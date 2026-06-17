import { randomUUID } from "crypto";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types";
import type {
  MerchantAdapter,
  GetCatalogParams,
  CatalogResult,
  CreateCheckoutParams,
  CheckoutSession,
  StatusParams,
  TransactionStatus,
  TransactionStatusCode,
  LineItem,
} from "../../types/merchant";
import { catalog, MERCHANT_ID } from "./data";

interface StoredSession extends CheckoutSession {
  merchant_id: string;
  created_at: string;
}

function resolveStatus(sessionId: string): TransactionStatusCode {
  const lastChar = sessionId[sessionId.length - 1];
  const val = parseInt(lastChar, 16) % 10;
  if (val <= 3) return "completed";
  if (val <= 6) return "pending";
  if (val <= 8) return "failed";
  return "expired";
}

export class MockMerchantAdapter implements MerchantAdapter {
  private readonly sessions = new Map<string, StoredSession>();

  private assertValidMerchant(merchantId: string): void {
    if (merchantId !== MERCHANT_ID) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Unknown merchant_id: "${merchantId}". Valid merchant: "${MERCHANT_ID}".`,
      );
    }
  }

  async getCatalog(params: GetCatalogParams): Promise<CatalogResult> {
    this.assertValidMerchant(params.merchant_id);
    let products = Array.from(catalog);
    if (params.category !== undefined) {
      products = products.filter((p) => p.category === params.category);
    }
    return products.slice(0, params.limit);
  }

  async createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutSession> {
    this.assertValidMerchant(params.merchant_id);

    const unknownSkus: string[] = [];
    const lineItems: LineItem[] = [];
    let totalCents = 0;

    for (const item of params.items) {
      const product = catalog.find((p) => p.sku === item.sku);
      if (product === undefined) {
        unknownSkus.push(item.sku);
        continue;
      }
      const subtotalCents = Math.round(product.price * 100) * item.quantity;
      totalCents += subtotalCents;
      lineItems.push({
        sku: product.sku,
        name: product.name,
        quantity: item.quantity,
        unit_price: product.price,
        subtotal: subtotalCents / 100,
      });
    }

    if (unknownSkus.length > 0) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Unknown SKUs: ${unknownSkus.join(", ")}`,
      );
    }

    const sessionId = randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000);

    const stored: StoredSession = {
      session_id: sessionId,
      checkout_url: `https://checkout.merchant-mcp.dev/${sessionId}`,
      expires_at: expiresAt.toISOString(),
      status: "pending",
      total_amount: totalCents / 100,
      currency: params.currency,
      line_items: lineItems,
      merchant_id: params.merchant_id,
      created_at: now.toISOString(),
    };

    this.sessions.set(sessionId, stored);

    const { merchant_id: _m, created_at: _c, ...session } = stored;
    return session;
  }

  async getTransactionStatus(params: StatusParams): Promise<TransactionStatus> {
    const stored = this.sessions.get(params.session_id);
    const status = resolveStatus(params.session_id);
    const now = new Date().toISOString();

    if (stored === undefined) {
      // Demo mode: synthesize a deterministic status for sessions not in memory
      // (e.g. created before a cold start, or provided by hand in demos).
      // A real adapter must throw McpError(ErrorCode.InvalidParams) for unknown IDs.
      const result: TransactionStatus = {
        session_id: params.session_id,
        status,
        merchant_id: MERCHANT_ID,
        amount: 0,
        currency: "PLN",
        created_at: now,
        updated_at: now,
      };
      if (status === "completed") result.paid_at = now;
      if (status === "failed") result.failure_reason = "insufficient_funds";
      return result;
    }

    const result: TransactionStatus = {
      session_id: stored.session_id,
      status,
      merchant_id: stored.merchant_id,
      amount: stored.total_amount,
      currency: stored.currency,
      created_at: stored.created_at,
      updated_at: now,
    };

    if (status === "completed") {
      result.paid_at = new Date(
        new Date(stored.created_at).getTime() + 5 * 60 * 1000,
      ).toISOString();
    }
    if (status === "failed") {
      result.failure_reason = "insufficient_funds";
    }

    return result;
  }
}
