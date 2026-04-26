// Atlas — Twilio outbound sender for WhatsApp.
//
// Twilio Sandbox limit: 1 message per second per recipient. We stagger with
// 1100ms between sends. On 429 / rate-limit errors we back off and retry once.
//
// Idempotency: a given inbound MessageSid produces at most one outbound batch
// (enforced by `isDuplicate` in `state.ts`). The sender itself is fire-and-
// forget — we don't fail the webhook if a single outbound errors; we log it
// and move on. This keeps Twilio happy (200 OK) and the user's UX smooth.
//
// In test environments without TWILIO creds, `sendMessages()` falls back to
// console.log so the orchestrator pipeline can be smoke-tested locally.

import twilio from "twilio";

const STAGGER_MS = 1_100;

let client: ReturnType<typeof twilio> | null = null;
function getClient() {
  if (!client) {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    if (!sid || !token) return null;
    client = twilio(sid, token);
  }
  return client;
}

export interface SendOptions {
  to: string; // E.164, e.g. "+233241234567"
  messages: string[];
}

export async function sendMessages(opts: SendOptions): Promise<void> {
  const from = process.env.TWILIO_WA_FROM ?? "whatsapp:+14155238886";
  const c = getClient();
  if (!c) {
    for (const m of opts.messages) console.log(`[wa/sender:stub] -> ${opts.to}: ${m}`);
    return;
  }
  const toWa = opts.to.startsWith("whatsapp:") ? opts.to : `whatsapp:${opts.to}`;
  for (let i = 0; i < opts.messages.length; i++) {
    const body = opts.messages[i];
    if (i > 0) await sleep(STAGGER_MS);
    try {
      await c.messages.create({ from, to: toWa, body });
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      if (status === 429) {
        await sleep(STAGGER_MS * 2);
        try {
          await c.messages.create({ from, to: toWa, body });
        } catch (err2) {
          console.error("[wa/sender] retry failed", err2);
        }
      } else {
        console.error("[wa/sender] send failed", err);
      }
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Twilio request-signature validation. Used by the webhook before parsing. */
export function validateTwilioSignature(
  signature: string | null,
  url: string,
  params: Record<string, string>,
): boolean {
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!token) return process.env.NODE_ENV !== "production";
  if (!signature) return false;
  return twilio.validateRequest(token, signature, url, params);
}
