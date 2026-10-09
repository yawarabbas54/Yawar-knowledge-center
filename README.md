# Yawar Knowledge Center — Backend

A small, security-conscious Node.js API for connecting a static GitHub Pages frontend to an AI chat-completions provider.

## What this backend does

- Keeps the AI API key on the server (not in browser JavaScript).
- Exposes `POST /api/chat` and `GET /health`.
- Restricts browser origins with CORS.
- Adds basic security headers, JSON size limits, input validation, request rate limiting, and an upstream timeout.
- Supports OpenAI-compatible API endpoints through `AI_BASE_URL`.

## Important

This backend does **not** provide AI by itself. You must configure a valid provider API key and have access to the selected model. Provider API billing/limits are separate from a ChatGPT subscription. Never publish your key in GitHub files, frontend JavaScript, screenshots, or chat messages.

## Deploy to Render

1. Upload these backend files to a GitHub repository. Recommended: create a separate repository named `yawar-knowledge-center-backend`.
2. In Render, choose **New + → Web Service** and connect that repository.
3. Render should detect `render.yaml`; if it asks for commands, use:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. In Render's **Environment** settings, add:
   - `AI_API_KEY`: your provider API key
   - `AI_BASE_URL`: `https://api.openai.com/v1` for OpenAI
   - `AI_MODEL`: a model available to your API account
   - `CORS_ORIGINS`: `https://yawarabbas54.github.io`
5. Deploy. Open `https://YOUR-SERVICE.onrender.com/health`. Expect JSON containing `"status":"ok"`.
6. If the service URL is different, keep it handy for the frontend connection.

Do not set `AI_API_KEY` in `render.yaml`, source code, or GitHub. Add it only through Render's private Environment settings.

## Test the chat endpoint

Replace the URL with your own Render URL:

```bash
curl -X POST https://YOUR-SERVICE.onrender.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Explain what a loop is in C++."}'
```

A successful response resembles:

```json
{"answer":"A loop repeats a block of code...","model":"gpt-4o-mini"}
```

If no API key is configured, the endpoint intentionally returns HTTP 503 with a helpful setup message.

## Connect the frontend

After deployment, set the frontend's API base URL to your Render service URL and send JSON to `/api/chat`:

```javascript
const API_BASE_URL = "https://YOUR-SERVICE.onrender.com";

async function askYawarAI(message, history = []) {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "AI request failed");
  return data.answer;
}
```

Pass only prior `{ role: "user" | "assistant", content: "..." }` text messages in `history`. Do not put secrets in frontend code.

## Current limitations / next upgrades

This is a strong starter backend, not a complete enterprise platform. It does not include user accounts, per-user quotas, billing controls, persistent chat storage, document upload/RAG, moderation services, or streaming responses. Add authentication and abuse/cost controls before opening it to a large public audience. The built-in rate limit is per server instance and is not a substitute for per-user limits.
