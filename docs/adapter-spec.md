# Adapter Specification

An **adapter** connects `merchant-mcp` to one merchant backend. Implementing the `MerchantAdapter` interface is the only integration work a merchant ever has to do.

---

## The Interface

```typescript
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types";

/**
 * Core contract every merchant backend must satisfy.
 * The MCP tools are thin wrappers over these three methods.
 */
export interface MerchantAdapter {
  /**
   * Return products from the merchant's catalog.
   * Apply category filter and limit before returning.
   */
  getCatalog(params: GetCatalogParams): Promise<CatalogResult>;

  /**
   * Create a new checkout session for the given items.
   * Validate all SKUs and compute line-item totals before persisting.
   */
  createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutSession>;

  /**
   * Return the current status of a previously created session.
   * Must remain callable after process restart if sessions are persisted externally.
   */
  getTransactionStatus(params: StatusParams): Promise<TransactionStatus>;
}
```

---

## Input / Output Types

```typescript
// --- getCatalog ---

interface GetCatalogParams {
  merchant_id: string;
  category?: string;   // filter; undefined means "all categories"
  limit: number;       // 1–50, already validated by Zod before reaching adapter
}

type CatalogResult = Product[];

interface Product {
  id: string;
  sku: string;          // globally unique within this merchant
  name: string;
  description: string;
  price: number;        // in the product's native currency
  currency: "PLN" | "EUR" | "USD";
  availability: boolean;
  category: string;
  image_url?: string;
}

// --- createCheckoutSession ---

interface CreateCheckoutParams {
  merchant_id: string;
  items: Array<{ sku: string; quantity: number }>;
  buyer_token?: string;  // opaque; pass through to downstream API
  return_url?: string;
  currency: "PLN" | "EUR" | "USD";
}

interface CheckoutSession {
  session_id: string;    // UUID v4
  checkout_url: string;
  expires_at: string;    // ISO 8601
  status: "pending";     // always "pending" at creation
  total_amount: number;
  currency: string;
  line_items: LineItem[];
}

interface LineItem {
  sku: string;
  name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;      // unit_price × quantity
}

// --- getTransactionStatus ---

interface StatusParams {
  session_id: string;
}

interface TransactionStatus {
  session_id: string;
  status: "pending" | "completed" | "failed" | "expired";
  merchant_id: string;
  amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
  paid_at?: string;         // present only when status === "completed"
  failure_reason?: string;  // present only when status === "failed"
}
```

---

## Error Contract

Throw `McpError` for all recoverable errors. The MCP SDK converts it to a structured error response the calling agent can inspect.

| Condition | Code | Example message |
|---|---|---|
| `merchant_id` not recognized | `ErrorCode.InvalidParams` | `Unknown merchant_id: "xyz"` |
| One or more SKUs not in catalog | `ErrorCode.InvalidParams` | `Unknown SKUs: SKU-A, SKU-B` |
| Downstream API unreachable | `ErrorCode.InternalError` | `Payment provider unavailable` |

All other errors bubble up as `InternalError` automatically.

---

## Minimal Adapter Skeleton (~30 lines)

```typescript
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types";
import type {
  MerchantAdapter, GetCatalogParams, CatalogResult,
  CreateCheckoutParams, CheckoutSession, StatusParams, TransactionStatus,
} from "../../types/merchant";

export class MyShopAdapter implements MerchantAdapter {
  constructor(private readonly apiKey: string) {}

  async getCatalog(params: GetCatalogParams): Promise<CatalogResult> {
    const res = await fetch(`https://api.myshop.example/products?limit=${params.limit}`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });
    if (!res.ok) throw new McpError(ErrorCode.InternalError, "Catalog fetch failed");
    return (await res.json()) as CatalogResult;
  }

  async createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutSession> {
    const res = await fetch("https://api.myshop.example/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new McpError(ErrorCode.InternalError, "Session creation failed");
    return (await res.json()) as CheckoutSession;
  }

  async getTransactionStatus(params: StatusParams): Promise<TransactionStatus> {
    const res = await fetch(`https://api.myshop.example/sessions/${params.session_id}`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });
    if (!res.ok) throw new McpError(ErrorCode.InternalError, "Status fetch failed");
    return (await res.json()) as TransactionStatus;
  }
}
```

Register it in `src/server.ts`:

```typescript
import { MyShopAdapter } from "./adapters/myshop";
const adapter = new MyShopAdapter(process.env.MYSHOP_API_KEY!);
```

That's it. No changes to tools, transport, or MCP wiring.
