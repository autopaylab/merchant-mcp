// "zod/v3" not "zod": moduleResolution:node resolves "zod" to .d.cts (CJS) and "zod/v3"
// to .d.ts (ESM). The MCP SDK's ZodRawShapeCompat is typed against the ESM declarations,
// so importing from the same path keeps TypeScript class identity aligned and avoids TS2589.
import { z } from "zod/v3";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import type { MerchantAdapter } from "../types/merchant";

const inputSchema = {
  merchant_id: z.string(),
  items: z
    .array(z.object({ sku: z.string(), quantity: z.number().int().min(1) }))
    .min(1, "At least one item is required"),
  buyer_token: z.string().optional(),
  return_url: z.string().url().optional(),
  currency: z.enum(["PLN", "EUR", "USD"]).default("PLN"),
};

export function registerCreateCheckoutSession(server: McpServer, adapter: MerchantAdapter): void {
  server.tool(
    "create_checkout_session",
    "Initiate a payment checkout session for one or more items. Returns a checkout URL and session ID. The buyer completes payment at the checkout URL. Use get_transaction_status to poll for completion.",
    inputSchema,
    async ({ merchant_id, items, buyer_token, return_url, currency }) => {
      const result = await adapter.createCheckoutSession({
        merchant_id,
        items,
        buyer_token,
        return_url,
        currency,
      });
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  );
}
