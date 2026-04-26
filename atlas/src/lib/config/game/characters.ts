// Atlas — Companion characters, AI tools, Atlas Classes, AI Tier definitions, weapons, gems.
// Ported from demo_v1/scripts/configs.js. No `window.*` globals — proper ES modules.

export type CharacterId = "sage" | "spark" | "zuri" | "kira" | "scout" | "ember";

export interface Character {
  id: CharacterId;
  emoji: string;
  name: string;
  /** Human archetype Amara would recognize from her own community (no LLM/AI references). */
  archetype: string;
  tagline: string;
}

// Amara lives in rural Ghana. She doesn't know ChatGPT or Claude. Her companion
// is a person-archetype she's met in real life: a thinker, a doer, a finisher.
// AI is what we MEASURE on her side (AI Tier 0–4), not how we frame her guide.
export const CHARACTERS: Record<CharacterId, Character> = {
  sage: { id: "sage", emoji: "🧙", name: "Sage", archetype: "the thinker", tagline: "Let's slow down and think this through together." },
  spark: { id: "spark", emoji: "⚡", name: "Spark", archetype: "the doer", tagline: "Show me — we'll learn by trying." },
  zuri: { id: "zuri", emoji: "🌅", name: "Zuri", archetype: "the neighbor", tagline: "Yɛbɛyɛ no wɔ Twi mu — we'll do this in your language." },
  kira: { id: "kira", emoji: "🎯", name: "Kira", archetype: "the finisher", tagline: "Tell me what you've built. Then what's next." },
  scout: { id: "scout", emoji: "🦅", name: "Scout", archetype: "the explorer", tagline: "I'll help you see the bigger picture." },
  ember: { id: "ember", emoji: "🔥", name: "Ember", archetype: "the firestarter", tagline: "Bold first, polish later." },
};

/// Boss-fight rivals — your guide vs the rival in The Oracle chapter
export const RIVAL_OF: Record<CharacterId, CharacterId> = {
  sage: "spark",
  spark: "scout",
  zuri: "spark",
  kira: "spark",
  scout: "sage",
  ember: "spark",
};

export interface AITool {
  id: string;
  label: string;
  emoji: string;
  maker: string | null;
  character: CharacterId;
}

export const AI_TOOLS: AITool[] = [
  { id: "chatgpt", label: "ChatGPT", emoji: "🤖", maker: "OpenAI", character: "spark" },
  { id: "claude", label: "Claude", emoji: "🤖", maker: "Anthropic", character: "sage" },
  { id: "gemini", label: "Gemini", emoji: "🤖", maker: "Google", character: "scout" },
  { id: "copilot", label: "Copilot", emoji: "🤖", maker: "Microsoft", character: "kira" },
  { id: "metaai", label: "Meta AI / WhatsApp AI", emoji: "🤖", maker: "Meta", character: "spark" },
  { id: "deepseek", label: "DeepSeek", emoji: "🤖", maker: "DeepSeek", character: "ember" },
  { id: "regional", label: "Regional / local LLM (Jais, BharatGPT, Lelapa…)", emoji: "🤖", maker: "Various", character: "zuri" },
  { id: "none", label: "I haven't used any of these", emoji: "❌", maker: null, character: "zuri" },
];

export interface AtlasClass {
  id: string;
  emoji: string;
  name: string;
  iscoClusters: string[]; // ISCO-08 major group prefixes
  tag: string;
}

export const ATLAS_CLASSES: AtlasClass[] = [
  { id: "artisan", emoji: "🔧", name: "The Artisan", iscoClusters: ["7"], tag: "Hands. Craft. Fixing things." },
  { id: "grower", emoji: "🌾", name: "The Grower", iscoClusters: ["6"], tag: "Patience. Cycles. Earth." },
  { id: "dealmaker", emoji: "🤝", name: "The Dealmaker", iscoClusters: ["5", "3"], tag: "Negotiation. Networks. Flow." },
  { id: "builder", emoji: "💻", name: "The Builder", iscoClusters: ["2"], tag: "Logic. Systems. Code." },
  { id: "storyteller", emoji: "🎨", name: "The Storyteller", iscoClusters: ["3"], tag: "Voice. Audience. Persuasion." },
  { id: "guardian", emoji: "🛡️", name: "The Guardian", iscoClusters: ["3", "5"], tag: "Care. Protect. Teach." },
  { id: "solver", emoji: "🧠", name: "The Solver", iscoClusters: ["1", "2", "4"], tag: "Analyze. Investigate. Judge." },
  { id: "hustler", emoji: "⚡", name: "The Hustler", iscoClusters: ["multiple"], tag: "Multi-domain entrepreneur." },
];

export interface AITier {
  tier: 0 | 1 | 2 | 3 | 4;
  label: string;
  emoji: string;
  /** Wage premium factor vs Tier 0 baseline (e.g. 0.20 = +20%) */
  premium: number;
  desc: string;
}

export const AI_TIERS: AITier[] = [
  { tier: 0, label: "Unfamiliar", emoji: "🌑", premium: 0, desc: "Hasn't used AI tools" },
  { tier: 1, label: "Curious", emoji: "🌒", premium: 0.05, desc: "Tried 1–2 times. Casual one-shot queries" },
  { tier: 2, label: "Active", emoji: "🌓", premium: 0.2, desc: "Weekly+ use. Iterates. Has go-to use cases" },
  { tier: 3, label: "Power User", emoji: "🌔", premium: 0.5, desc: "Multi-tool, multimodal, verifies output" },
  { tier: 4, label: "Builder", emoji: "🌕", premium: 1.0, desc: "Builds on AI: custom workflows, automations, code" },
];

export interface Weapon {
  tier: 1 | 2 | 3;
  name: string;
  damage: number;
  emoji: string;
}

export const WEAPONS: Weapon[] = [
  { tier: 1, name: "Iron Sword", damage: 1, emoji: "🗡️" },
  { tier: 2, name: "Steel Sword", damage: 2, emoji: "⚔️" },
  { tier: 3, name: "Mythril Blade", damage: 3, emoji: "✨⚔️" },
];

export interface BonusGem {
  id: string;
  emoji: string;
  name: string;
  condition: string;
}

export const BONUS_GEMS: BonusGem[] = [
  { id: "multilingual", emoji: "✨", name: "MULTILINGUAL", condition: "3+ languages" },
  { id: "polymath", emoji: "✨", name: "POLYMATH", condition: "2+ occupation domains" },
  { id: "mentor", emoji: "✨", name: "MENTOR", condition: "high agreeableness + teaching cues" },
  { id: "builder", emoji: "✨", name: "BUILDER", condition: "high transfer + AI Tier 2+" },
  { id: "resilient", emoji: "✨", name: "RESILIENT", condition: "grit + storm composure" },
  { id: "hustler", emoji: "✨", name: "HUSTLER", condition: "multiple income streams" },
  { id: "fast_witness", emoji: "✨", name: "FAST WITNESS", condition: "attestor responds < 5 min" },
  { id: "oracle_slayer", emoji: "✨", name: "ORACLE-SLAYER", condition: "caught 4+ errors in rival clip" },
  { id: "flawless", emoji: "✨", name: "FLAWLESS DUELIST", condition: "no damage taken in boss fight" },
  { id: "calibrated", emoji: "✨", name: "CALIBRATED HERO", condition: "PROBE on partial truth" },
];
