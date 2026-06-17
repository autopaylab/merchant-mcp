#!/usr/bin/env node
import path from "path";
import express from "express";
import { createApp } from "./transport/http";
import { MockMerchantAdapter } from "./adapters/mock";

const adapter = new MockMerchantAdapter();
const app = createApp(adapter, "mock");
app.use(express.static(path.join(__dirname, "../public")));

const PORT = Number(process.env.PORT ?? 3000);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`merchant-mcp listening on http://localhost:${PORT}`);
    console.log(`  POST /mcp    — MCP endpoint (Streamable HTTP)`);
    console.log(`  GET  /health — health check`);
  });
}

export default app;
