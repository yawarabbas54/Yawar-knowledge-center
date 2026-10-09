# Yawar Knowledge Center — Mega Edition

An extensible Node.js AI assistant and knowledge workspace. Includes a chat UI, configurable AI provider, browser voice input/output support, a safe arithmetic tool, searchable local knowledge, persistent task tracking, article API, and an optional consent-gated Twilio outbound-call adapter.

## Requirements

- Node.js 18 or newer (Node 20 LTS recommended)
- npm
- Optional: API key for an OpenAI-compatible chat-completions provider
- Optional: Twilio account and a publicly reachable HTTPS deployment for outbound calls

## Run locally

1. Extract the ZIP.
2. Open a terminal in the `yawar-knowledge-center` directory.
3. Copy `.env.example` to `.env` and set a long random `API_KEY`.
4. Add `AI_API_KEY` and set `AI_MODEL` if you want model-powered chat. Keep `.env` private.
5. Run `npm install`.
6. Run `npm start`.
7. Open `http://localhost:3000`.

Without an AI key, the app uses a small local fallback response; it does not pretend to provide full LLM reasoning. Write endpoints are unprotected only when `API_KEY` is blank, so configure it before public deployment. If you configure `API_KEY`, provide it in the UI when prompted for a write action.

## Features

- **AI chat:** `/api/agent/chat` forwards conversation messages to an OpenAI-compatible `/chat/completions` endpoint.
- **Built-in tool:** safe arithmetic parser (no `eval`). Try `Calculate 125 * (8 + 4).`
- **Knowledge:** `GET /api/knowledge`, `GET /api/knowledge/search?q=...`, `POST /api/knowledge`.
- **Tasks:** `GET/POST /api/tasks`, `PATCH /api/tasks/:id`.
- **Articles:** existing `/api/articles` API preserved.
- **Voice:** browser speech recognition where supported and speech playback by double-clicking an assistant message. Browser support and HTTPS permissions vary.
- **Calls:** optional `POST /api/calls/outbound`, protected by `API_KEY`, requiring Twilio configuration, HTTPS `PUBLIC_BASE_URL`, E.164 recipient, and explicit `confirmed: true`. This feature can incur charges. Only call recipients who have agreed to receive the call and comply with local laws and provider rules.
- **Health/status:** `/health` and `/api/status`.

## API examples

Chat:
```bash
curl -X POST http://localhost:3000/api/agent/chat \
  -H 'Content-Type: application/json' \
  -d '{"message":"Explain recursion simply"}'
```

Create knowledge (if API_KEY is configured):
```bash
curl -X POST http://localhost:3000/api/knowledge \
  -H 'Content-Type: application/json' -H 'x-api-key: YOUR_API_KEY' \
  -d '{"title":"My note","content":"Agents can call tools.","tags":["AI"]}'
```

## Storage and limitations

JSON files are used for simple single-instance persistence under `DATA_DIR` (default `./data`). This is suitable for a starter deployment, not concurrent multi-instance production. Upgrade to PostgreSQL and a durable job queue for production-grade multi-user usage. Current tasks are tracked records, not an autonomous background worker. The call adapter places an outbound call; it is not a full inbound voice agent or a general phone-control API. Automatic email/WhatsApp replies, arbitrary computer control, unrestricted code execution, and unrestricted web browsing are not enabled by this starter. Add each integration explicitly with permissions, limits, and audit logs.

## Security checklist before deployment

- Set a strong `API_KEY` and a real AI provider key through the hosting environment, never source control.
- Use HTTPS, rate limiting, monitoring, and platform secret management.
- Add user authentication and per-user authorization before multi-user hosting.
- Do not expose task/knowledge write endpoints publicly without authentication.
- Add a database, backups, request-size limits, and durable queues before production workloads.
- Keep human confirmation for calls, messages, purchases, deletion, and other consequential actions.

## Test

```bash
npm test
npm run check
```

## Architecture

`src/routes` handles HTTP, `src/services` contains application logic, `src/tools` contains small controlled capabilities, `public` is the browser UI, and `tests` covers core behaviors. New providers should be integrated behind service interfaces rather than scattered throughout route handlers.
