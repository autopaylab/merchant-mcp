// "zod/v3" not "zod": moduleResolution:node resolves "zod" to .d.cts (CJS) and "zod/v3"
// to .d.ts (ESM). The MCP SDK's ZodRawShapeCompat is typed against the ESM declarations,
// so importing from the same path keeps TypeScript class identity aligned and avoids TS2589.
import { z } from "zod/v3";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import type { MerchantAdapter } from "../types/merchant";

const inputSchema = {
  session_id: z
    .string()
    .uuid()
    .describe("Checkout session UUID returned by create_checkout_session"),
} as const;

export function registerGetTransactionStatus(server: McpServer, adapter: MerchantAdapter): void {
  server.tool(
    "get_transaction_status",
    "Check the current status of a checkout session. Returns status (pending/completed/failed/expired), amount, and — if completed — payment timestamp. Poll this after directing a buyer to the checkout URL.",
    inputSchema,
    async ({ session_id }) => {
      const result = await adapter.getTransactionStatus({ session_id });
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  );
}
