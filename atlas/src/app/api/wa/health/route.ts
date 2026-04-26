// Atlas — WA integration health check.
//
// GET /api/wa/health -> JSON summary used by the manager to verify deploy:
//   - Which env vars are set (presence-only; never returns secret values).
//   - How many squad groups are configured vs missing.
//   - The Twilio sandbox sender number.
//
// Hit during smoke tests: `curl https://<vercel-url>/api/wa/health`.

import { squadHealth } from "@/lib/wa/squad";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const env = {
    ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
    TWILIO_ACCOUNT_SID: !!process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: !!process.env.TWILIO_AUTH_TOKEN,
    TWILIO_WA_FROM: process.env.TWILIO_WA_FROM ?? null,
    KV_REST_API_URL: !!process.env.KV_REST_API_URL,
    KV_REST_API_TOKEN: !!process.env.KV_REST_API_TOKEN,
    WA_PHONE_SALT: !!process.env.WA_PHONE_SALT,
  };
  const groups = squadHealth();
  const ready =
    env.ANTHROPIC_API_KEY &&
    env.TWILIO_ACCOUNT_SID &&
    env.TWILIO_AUTH_TOKEN &&
    env.KV_REST_API_URL &&
    env.WA_PHONE_SALT;
  return Response.json({
    ok: ready,
    env,
    squadGroups: groups,
    timestamp: new Date().toISOString(),
  });
}
