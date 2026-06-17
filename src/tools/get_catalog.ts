// "zod/v3" not "zod": moduleResolution:node resolves "zod" to .d.cts (CJS) and "zod/v3"
// to .d.ts (ESM). The MCP SDK's ZodRawShapeCompat is typed against the ESM declarations,
// so importing from the same path keeps TypeScript class identity aligned and avoids TS2589.
import { z } from "zod/v3";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import type { MerchantAdapter } from "../types/merchant";

const inputSchema = {
  merchant_id: z.string(),
  category: z.string().optional(),
  limit: z.number().int().min(1).max(50).default(10),
};

export function registerGetCatalog(server: McpServer, adapter: MerchantAdapter): void {
  server.tool(
    "get_catalog",
    "Retrieve products available from a merchant. Returns name, description, price, currency, availability, and SKU for each item. Use this before initiating checkout to confirm items exist and are available.",
    inputSchema,
    async ({ merchant_id, category, limit }) => {
      const result = await adapter.getCatalog({ merchant_id, category, limit });
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  );
}
