// Atlas — Twilio WhatsApp inbound webhook.
//
// Twilio Sandbox POSTs `application/x-www-form-urlencoded` here on every
// inbound WA message. Lifecycle:
//   1. Read raw form body (need exact bytes for signature validation).
//   2. Validate `X-Twilio-Signature`.
//   3. Dedupe by `MessageSid` (5-min KV TTL) so retries are idempotent.
//   4. Hand off to `handleWaMessage()` to compute the reply batch.
//   5. Return 200 OK *immediately* — replies are sent out-of-band via the
//      Twilio REST API by `sendMessages()`. This keeps Twilio happy under the
//      15s webhook deadline even when Claude is slow.
//
// IMPORTANT: never block the 200 OK on Claude. Step 4 has its own 5s soft
// timeout; if it expires we send a holding message and queue the real reply
// for the next inbound turn.

import { after } from "next/server";
import { handleWaMessage } from "@/lib/wa/handler";
import { isDuplicate } from "@/lib/wa/state";
import { sendMessages, validateTwilioSignature } from "@/lib/wa/sender";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  const url = request.url;
  const signature = request.headers.get("x-twilio-signature");
  const raw = await request.text();
  const params = parseFormUrlEncoded(raw);

  if (!validateTwilioSignature(signature, url, params)) {
    return new Response("invalid signature", { status: 403 });
  }

  const messageSid = params["MessageSid"] ?? "";
  const from = params["From"] ?? ""; // "whatsapp:+233..."
  const body = params["Body"] ?? "";
  const fromE164 = from.replace(/^whatsapp:/, "");

  if (!fromE164) return twiml200();
  if (messageSid && (await isDuplicate(messageSid))) return twiml200();

  // Process out-of-band via `after()` so the 200 returns fast and Vercel
  // keeps the function alive long enough for sendMessages() to fire.
  // Without `after()`, Vercel kills the function once the response is sent
  // and the unfinished promise is dropped (silent demo-killer).
  after(processInBackground(fromE164, body));

  return twiml200();
}

async function processInBackground(fromE164: string, body: string): Promise<void> {
  try {
    const result = await handleWaMessage(fromE164, body);
    await sendMessages({ to: fromE164, messages: result.messages });
  } catch (err) {
    console.error("[wa/webhook] processing error", err);
    try {
      await sendMessages({
        to: fromE164,
        messages: ["Sage hit a snag — reply *RESTART* to try again."],
      });
    } catch (sendErr) {
      console.error("[wa/webhook] fallback send failed", sendErr);
    }
  }
}

function parseFormUrlEncoded(raw: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const pair of raw.split("&")) {
    if (!pair) continue;
    const eq = pair.indexOf("=");
    if (eq < 0) continue;
    const k = decodeURIComponent(pair.slice(0, eq).replace(/\+/g, " "));
    const v = decodeURIComponent(pair.slice(eq + 1).replace(/\+/g, " "));
    out[k] = v;
  }
  return out;
}

function twiml200(): Response {
  // Empty TwiML — we send replies out-of-band via the REST API.
  return new Response('<?xml version="1.0" encoding="UTF-8"?><Response/>', {
    status: 200,
    headers: { "content-type": "text/xml" },
  });
}
