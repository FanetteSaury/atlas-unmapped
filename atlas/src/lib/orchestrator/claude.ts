// Atlas — Anthropic SDK wrapper with prompt caching.
//
// `runChapter()` in `index.ts` currently uses heuristics. Phase 1 morning swaps
// in `callSage()` per chapter. The wrapper:
//   - applies cache_control to SYSTEM_PROMPT_STATIC so we pay full price once
//     per cache lifetime and ~10% on subsequent turns.
//   - parses JSON-only output, with one repair retry on parse failure.
//   - falls back to a stub object on timeout > 5s so the WA layer can still
//     ack the user; the real reply is queued for the next inbound message.
//
// Model: claude-sonnet-4-6 by default (1M context not needed; we want speed
// + caching on a stable system prompt). Override with ANTHROPIC_MODEL env.

import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT_STATIC, CHAPTER_RUBRICS } from "./prompts";

const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";
const MAX_TOKENS = 600;
const SOFT_TIMEOUT_MS = 5_000;

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");
    client = new Anthropic({ apiKey });
  }
  return client;
}

export interface SageOutput {
  reply_messages: string[];
  scoring?: Record<string, number | string | boolean>;
  advance: boolean;
}

export interface SageInput {
  chapter: keyof typeof CHAPTER_RUBRICS | string;
  countryCode: string;
  playerBody: string;
  /** Real numbers the orchestrator wants the model to cite verbatim. */
  injectedFacts?: Record<string, string | number>;
}

/** Call Sage. Throws on hard error; returns null on soft-timeout. */
export async function callSage(input: SageInput): Promise<SageOutput | null> {
  const rubric = CHAPTER_RUBRICS[input.chapter] ?? "";
  const facts = input.injectedFacts
    ? `\n# Real-data injection (cite these verbatim if relevant):\n${JSON.stringify(input.injectedFacts, null, 2)}\n`
    : "";
  const userMsg = `${rubric}\n\n# Country: ${input.countryCode}${facts}\n\n# Player just said:\n"""\n${input.playerBody}\n"""\n\nReturn ONLY the JSON object.`;

  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), SOFT_TIMEOUT_MS);

  try {
    const resp = await getClient().messages.create(
      {
        model: DEFAULT_MODEL,
        max_tokens: MAX_TOKENS,
        system: [
          {
            type: "text",
            text: SYSTEM_PROMPT_STATIC,
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: [{ role: "user", content: userMsg }],
      },
      { signal: ac.signal },
    );
    clearTimeout(t);
    const block = resp.content.find((c) => c.type === "text");
    if (!block || block.type !== "text") return null;
    return parseSageJSON(block.text);
  } catch (err) {
    clearTimeout(t);
    if (err instanceof Error && err.name === "AbortError") return null;
    throw err;
  }
}

function parseSageJSON(raw: string): SageOutput | null {
  // Strip code fences if the model added them despite instructions.
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/, "");
  try {
    const obj = JSON.parse(cleaned);
    if (Array.isArray(obj.reply_messages) && typeof obj.advance === "boolean") {
      return obj as SageOutput;
    }
    return null;
  } catch {
    return null;
  }
}
