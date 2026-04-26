// Atlas — channel-agnostic WA message handler.
//
// `handleWaMessage(from, body, opts?)` is the single entrypoint shared by the
// Twilio webhook and any future channel adapter (Meta Cloud API, browser
// simulator). It:
//   1. Looks up state in KV.
//   2. Handles bot-level commands (RESTART, HELP).
//   3. Calls `runChapter()` from the channel-agnostic orchestrator.
//   4. Persists the new state.
//   5. Returns the outbound messages for the sender to deliver.
//
// The handler does NOT call Twilio directly — that's the webhook's job, after
// it has returned 200 to Twilio. Keeping the side-effect at the edge means
// this function is unit-testable without mocks.

import { runChapter, type ChapterId, type ChapterInput } from "@/lib/orchestrator";
import { freshState, getState, setState, type WAState } from "./state";
import { resolveSquadInvite } from "./squad";

export interface HandleResult {
  messages: string[];
  finished: boolean;
}

const HELP_TEXT =
  "🌍 *Atlas Quest* — twelve minutes, eight chapters, one boss fight.\n\n" +
  "Reply *START* to begin. Reply *RESTART* any time to start over.";

export async function handleWaMessage(from: string, rawBody: string): Promise<HandleResult> {
  const body = rawBody.trim();
  const upper = body.toUpperCase();

  // Bot-level commands (always honored)
  if (upper === "HELP" || upper === "?") {
    return { messages: [HELP_TEXT], finished: false };
  }
  if (upper === "RESTART") {
    const fresh = freshState(from);
    await setState(from, fresh);
    return {
      messages: [
        "Restarting.",
        "🌍 Atlas Quest. Where are you?\n\nReply *GH* (Ghana) or *BD* (Bangladesh).",
      ],
      finished: false,
    };
  }

  // First-time-or-expired state -> kickoff.
  const existing = await getState(from);
  if (!existing || upper === "START" || upper === "JOIN") {
    const fresh = freshState(from);
    await setState(from, fresh);
    return {
      messages: [
        "🌍 Welcome, traveler. I'm *Sage*.",
        "Three lives. Seven gems. One Atlas Card at the end — your *class*, your *AI tier*, and a door I can't tell you about yet.",
        "Twelve minutes. Eight chapters. A boss fight in the middle.\n\nWhere does your story start?\n\nReply *GH* 🇬🇭 or *BD* 🇧🇩.",
      ],
      finished: false,
    };
  }

  // Run a chapter turn.
  const input: ChapterInput = { chapter: existing.chapter, body };
  const result = await runChapter(input, existing.ctx);

  let messages = result.replies.map((r) => r.text);

  // On the final card chapter, append the squad invite as a tail message so
  // the player gets one tappable link.
  if (result.finished) {
    const isco = result.ctx.iscoSeed ?? "7421";
    const country = result.ctx.country || "GH";
    const invite = resolveSquadInvite(country, isco);
    messages = [
      ...messages,
      `🤝 *Your squad*: ${invite.groupName}\n${invite.url}\n\nTap to join. Employers in your ward are already there.`,
    ];
  }

  const newState: WAState = {
    ctx: result.ctx,
    chapter: result.nextChapter as ChapterId,
    lastTurnAt: Date.now(),
  };
  await setState(from, newState);

  return { messages, finished: !!result.finished };
}
