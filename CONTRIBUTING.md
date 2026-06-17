# Contributing

## Setup

```bash
git clone https://github.com/autopaylab/merchant-mcp
cd merchant-mcp
npm install
npm run dev
```

## Project layout

```
src/
  server.ts          — entry point, wires adapter → app
  types/merchant.ts  — MerchantAdapter interface (the only contract)
  adapters/mock/     — reference implementation, good starting point for new adapters
  tools/             — MCP tool registrations (thin wrappers over the adapter)
  transport/http.ts  — Streamable HTTP + Express wiring
docs/
  adapter-spec.md    — full adapter contract with example skeleton
```

## Adding an adapter

1. Create `src/adapters/<name>/index.ts` implementing `MerchantAdapter` from `src/types/merchant.ts`.
2. Change the two lines in `src/server.ts` that instantiate `MockMerchantAdapter`.
3. Nothing else changes.

See [`docs/adapter-spec.md`](docs/adapter-spec.md) for the full contract, error rules, and a 30-line skeleton.

## Guidelines

- Keep tool files as thin wrappers — no business logic outside `adapters/`.
- `McpError(ErrorCode.InvalidParams, ...)` for bad input; `McpError(ErrorCode.InternalError, ...)` for downstream failures.
- `strict: true` is enforced — no `any`, no non-null assertions.
- Match the existing code style; there is no linter yet, so use your judgment.

## Pull requests

- One logical change per PR.
- New adapters go in a separate directory under `src/adapters/`.
- New protocol adapters (OpenAI function-calling, Visa TAP, etc.) go under a new top-level `src/protocols/` directory and can be proposed as issues first.
