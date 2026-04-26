// Atlas — per-phone state machine for WhatsApp runs.
//
// Storage: Vercel KV (Upstash Redis). One key per phone:
//   wa:state:<phoneHash>  -> JSON { ctx, chapter, lastTurn }
//
// Phone hashing: SHA-256( WA_PHONE_SALT + phoneNumber ), first 16 hex chars.
// Salt MUST be set in env. We never store the raw E.164 number.
//
// TTLs:
//   - chapter state: 2 hours (matches the user's expected play session)
//   - dedupe MessageSid: 5 minutes
//
// All KV calls are best-effort: if KV is unavailable we log + return null;
// the webhook responds with a generic "Sage is thinking…" so Twilio still
// gets its 200 OK and the user isn't left hanging.

import { kv } from "@vercel/kv";
import { createHash } from "node:crypto";
import type { ChapterId, PlayerContext } from "@/lib/orchestrator";

export interface WAState {
  ctx: PlayerContext;
  chapter: ChapterId;
  lastTurnAt: number; // ms epoch
}

const STATE_TTL_SEC = 2 * 60 * 60;
const SID_TTL_SEC = 5 * 60;

export function hashPhone(phoneE164: string): string {
  const salt = process.env.WA_PHONE_SALT;
  if (!salt) throw new Error("WA_PHONE_SALT not set");
  return createHash("sha256")
    .update(salt + phoneE164)
    .digest("hex")
    .slice(0, 16);
}

const stateKey = (h: string) => `wa:state:${h}`;
const sidKey = (sid: string) => `wa:sid:${sid}`;

export async function getState(phoneE164: string): Promise<WAState | null> {
  try {
    const h = hashPhone(phoneE164);
    const raw = await kv.get<WAState>(stateKey(h));
    return raw ?? null;
  } catch (err) {
    console.error("[wa/state] getState failed", err);
    return null;
  }
}

export async function setState(phoneE164: string, state: WAState): Promise<void> {
  try {
    const h = hashPhone(phoneE164);
    await kv.set(stateKey(h), state, { ex: STATE_TTL_SEC });
  } catch (err) {
    console.error("[wa/state] setState failed", err);
  }
}

export async function clearState(phoneE164: string): Promise<void> {
  try {
    const h = hashPhone(phoneE164);
    await kv.del(stateKey(h));
  } catch (err) {
    console.error("[wa/state] clearState failed", err);
  }
}

/** Returns true if this MessageSid was seen in the last 5 minutes. Marks it
 * seen as a side effect. Use to dedupe Twilio retries. */
export async function isDuplicate(messageSid: string): Promise<boolean> {
  try {
    // SET NX so concurrent webhooks with the same Sid race-safely.
    const ok = await kv.set(sidKey(messageSid), 1, { ex: SID_TTL_SEC, nx: true });
    return ok === null;
  } catch (err) {
    console.error("[wa/state] isDuplicate failed (allowing through)", err);
    return false;
  }
}

export function freshState(phoneE164: string): WAState {
  const handle = `wa:${hashPhone(phoneE164)}`;
  return {
    ctx: {
      handle,
      country: "",
      scores: {},
      channel: "wa",
    },
    chapter: "country",
    lastTurnAt: Date.now(),
  };
}
