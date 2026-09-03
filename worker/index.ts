// Cloudflare Worker that serves the static Next.js export (via the ASSETS
// binding) for everything, and layers one real API route on top:
// POST /api/copilot — a Claude-backed chat endpoint grounded in the specific
// incident's analysis object. If ANTHROPIC_API_KEY isn't configured as a
// Worker secret, this returns 503 and the client falls back to its local
// heuristic responder (see lib/copilot-responder.ts) — the app works either
// way, this just upgrades the copilot to a real model when available.
//
// To enable it after deploying:
//   wrangler secret put ANTHROPIC_API_KEY

interface Fetcher {
  fetch(request: Request): Promise<Response>;
}

export interface Env {
  ASSETS: Fetcher;
  ANTHROPIC_API_KEY?: string;
}

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "content-type"
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", ...CORS_HEADERS }
  });
}

function buildSystemPrompt(analysis: unknown): string {
  return [
    "You are a senior SOC analyst copilot embedded inside a security incident investigation tool.",
    "Answer the analyst's question about THIS SPECIFIC incident only, grounded strictly in the JSON data below.",
    "Be concise (2-5 sentences), technical but readable, and never invent facts the data doesn't support.",
    "If asked something the data can't answer, say so plainly instead of guessing.",
    "",
    "INCIDENT DATA (JSON):",
    JSON.stringify(analysis).slice(0, 8000)
  ].join("\n");
}

async function handleCopilot(request: Request, env: Env): Promise<Response> {
  if (!env.ANTHROPIC_API_KEY) {
    return json({ error: "copilot_not_configured" }, 503);
  }

  let body: { question?: string; analysis?: unknown; history?: Array<{ role: string; content: string }> };
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const { question, analysis, history } = body;
  if (!question || !analysis) return json({ error: "missing_fields" }, 400);

  const messages = [
    ...(Array.isArray(history) ? history : []).map((h) => ({ role: h.role, content: h.content })),
    { role: "user", content: question }
  ];

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        system: buildSystemPrompt(analysis),
        messages
      })
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return json({ error: "upstream_error", detail: text.slice(0, 300) }, 502);
    }

    const data = (await res.json()) as { content?: Array<{ type: string; text?: string }> };
    const textBlock = data.content?.find((b) => b.type === "text");
    if (!textBlock?.text) return json({ error: "empty_response" }, 502);

    return json({ answer: textBlock.text, source: "claude" });
  } catch (err) {
    return json({ error: "request_failed", detail: String(err) }, 500);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/copilot") {
      if (request.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });
      if (request.method === "POST") return handleCopilot(request, env);
      return json({ error: "method_not_allowed" }, 405);
    }

    return env.ASSETS.fetch(request);
  }
};
