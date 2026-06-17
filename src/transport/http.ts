import express, { type Request, type Response } from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { MerchantAdapter } from "../types/merchant";
import { registerGetCatalog } from "../tools/get_catalog";
import { registerCreateCheckoutSession } from "../tools/create_checkout_session";
import { registerGetTransactionStatus } from "../tools/get_transaction_status";
import pkg from "../../package.json";

const SERVER_INFO = {
  name: "merchant-mcp",
  version: pkg.version,
} as const;

function buildMcpServer(adapter: MerchantAdapter): McpServer {
  const server = new McpServer(SERVER_INFO);
  registerGetCatalog(server, adapter);
  registerCreateCheckoutSession(server, adapter);
  registerGetTransactionStatus(server, adapter);
  return server;
}

export function createApp(adapter: MerchantAdapter, adapterName = "mock"): express.Application {
  const app = express();
  app.use(express.json());

  // MCP endpoint — Streamable HTTP transport, one server per request (stateless)
  app.post("/mcp", async (req: Request, res: Response) => {
    const server = buildMcpServer(adapter);
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error("[mcp] request error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.get("/health", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      server: SERVER_INFO.name,
      version: SERVER_INFO.version,
      adapter: adapterName,
    });
  });

  app.get("/", (_req: Request, res: Response) => {
    res.redirect("https://github.com/autopaylab/merchant-mcp");
  });

  return app;
}
