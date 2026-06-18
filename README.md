# merchant-mcp

[![CI](https://github.com/autopaylab/merchant-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/autopaylab/merchant-mcp/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/merchant-mcp)](https://www.npmjs.com/package/merchant-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Universal Merchant MCP Server** — integrate once, speak every AI agent protocol.

---

## The Problem

Every AI agent protocol (MCP, OpenAI tool-calling, Visa TAP, UCP) needs its own integration. A merchant who wants their catalog and checkout accessible to AI agents today must build and maintain separate connectors for each one. When a new protocol ships, the work starts over.

`merchant-mcp` solves this by sitting between agents and merchants. Merchants implement one interface. New protocols are added as adapters on the server side — the merchant does nothing.

---

## How It Works

```
AI Agent (Claude, GPT, etc.)
        │
        │  MCP / OpenAI SDK / Visa TAP / ...
        ▼
┌──────────────────────────────┐
│         merchant-mcp         │
│   ┌──────────────────────┐   │
│   │   MCP Tool Layer     │   │
│   │  get_catalog         │   │
│   │  create_checkout     │   │
│   │  get_tx_status       │   │
│   └──────────┬───────────┘   │
│              │ MerchantAdapter│
└──────────────┼───────────────┘
               │
       ┌───────┼───────┐
       ▼       ▼       ▼
     Mock   Autopay  Stripe
   (built-in)        (coming)
```

The `MerchantAdapter` interface is the only contract a backend needs to satisfy. See [`docs/adapter-spec.md`](docs/adapter-spec.md).

---

## Quickstart

```bash
git clone https://github.com/autopaylab/merchant-mcp
cd merchant-mcp
npm install
npm run dev
```

Verify it's running:

```bash
curl http://localhost:3000/health
# {"status":"ok","server":"merchant-mcp","version":"0.1.0","adapter":"mock"}
```

Call a tool directly:

```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "get_catalog",
      "arguments": { "merchant_id": "demoshop", "limit": 3 }
    }
  }'
```

---

## Connect to Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "merchant-mcp": {
      "url": "https://mcp.autopaylab.com/mcp"
    }
  }
}
```

Restart Claude Desktop. The three tools will appear automatically.

---

## Install Claude Plugin

The fastest way to connect Claude.ai to merchant-mcp.

1. Download [merchant-mcp.plugin](https://github.com/autopaylab/merchant-mcp/releases/latest/download/merchant-mcp.plugin)
2. Open Claude → Settings → Connectors → Upload plugin
3. Start a new conversation — three tools are now available

> Compatible with Claude.ai (Connectors) and Claude Cowork desktop app.

---

## Tools Reference

| Tool | Description | Key Inputs |
|---|---|---|
| `get_catalog` | Browse products from a merchant | `merchant_id`, `category?`, `limit` |
| `create_checkout_session` | Start a checkout and get a payment URL | `merchant_id`, `items[]`, `currency` |
| `get_transaction_status` | Poll a checkout for completion | `session_id` (UUID) |

Full input/output schemas: see source files in [`src/tools/`](src/tools/).

---

## Building an Adapter

See [`docs/adapter-spec.md`](docs/adapter-spec.md) for:

- The full `MerchantAdapter` TypeScript interface with JSDoc
- All input/output types
- Error contract (what to throw and when)
- A minimal 30-line skeleton you can copy and fill in

---

## Roadmap

- [ ] OpenAI SDK function-calling adapter (expose tools via `/openai/tools`)
- [ ] Per-request authentication (`Authorization` header → buyer context)
- [ ] Multi-merchant routing (single server, many `merchant_id`s, each pointing to a different adapter)
- [ ] Visa TAP adapter
- [ ] Stripe adapter

---

## License

MIT © [Autopay Lab](https://github.com/autopaylab)
