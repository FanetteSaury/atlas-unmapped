// Atlas — Country & Character configuration
// Country-agnostic by design. Add a new country by adding a config entry.

const COUNTRIES = {
  GH: {
    code: "GH",
    name: "Ghana",
    flag: "🇬🇭",
    currency: "₵",
    currency_code: "GHS",
    languages: ["English", "Twi", "Ga", "Ewe", "Hausa"],
    primary_language: "Twi-English",
    sample_city: "Madina, Greater Accra",
    messaging_channel: "WhatsApp",
    privacy_default_female: 2, // pseudonymous OK
    informal_employment_pct: 88,
    youth_neet_pct: 28,
    smartphone_pct: 65,
    median_wage_informal: 1050,
    median_wage_formal: 2400,
    iso_alpha2: "GH",
    region: "West Africa",
    regional_peers: ["NG", "CI", "SN", "TG", "BF", "BJ"],
    sample_player: {
      name: "Amara",
      domain_hint: "Phone repair micro-business + self-taught Python",
      isco_seed: "7421"
    }
  },
  BD: {
    code: "BD",
    name: "Bangladesh",
    flag: "🇧🇩",
    currency: "৳",
    currency_code: "BDT",
    languages: ["Bengali", "English"],
    primary_language: "Bengali-English",
    sample_city: "Mirpur, Dhaka",
    messaging_channel: "WhatsApp + imo",
    privacy_default_female: 1,
    informal_employment_pct: 84,
    youth_neet_pct: 30,
    smartphone_pct: 55,
    median_wage_informal: 12000,
    median_wage_formal: 22000,
    iso_alpha2: "BD",
    region: "South Asia",
    regional_peers: ["IN", "PK", "NP", "LK", "BT"],
    sample_player: {
      name: "Riya",
      domain_hint: "Tailor / hand embroidery on bridal blouses",
      isco_seed: "7531"
    }
  },
  VN: {
    code: "VN",
    name: "Vietnam",
    flag: "🇻🇳",
    currency: "₫",
    currency_code: "VND",
    languages: ["Vietnamese", "English"],
    primary_language: "Vietnamese",
    sample_city: "Cầu Giấy, Hà Nội",
    messaging_channel: "Zalo",
    privacy_default_female: 2,
    informal_employment_pct: 65,
    youth_neet_pct: 12,
    smartphone_pct: 73,
    median_wage_informal: 4500000,
    median_wage_formal: 8500000,
    iso_alpha2: "VN",
    region: "Southeast Asia",
    regional_peers: ["KH", "LA", "PH", "MM", "ID"],
    sample_player: {
      name: "Tuan",
      domain_hint: "Junior dev — Next.js routing debugging",
      isco_seed: "2519"
    }
  }
};

// AI tools shown in the inventory step (Step 0a)
const AI_TOOLS = [
  { id: "chatgpt",  label: "ChatGPT", emoji: "🤖", maker: "OpenAI",      character: "spark" },
  { id: "claude",   label: "Claude",  emoji: "🤖", maker: "Anthropic",   character: "sage"  },
  { id: "gemini",   label: "Gemini",  emoji: "🤖", maker: "Google",      character: "scout" },
  { id: "copilot",  label: "Copilot", emoji: "🤖", maker: "Microsoft",   character: "kira"  },
  { id: "metaai",   label: "Meta AI / WhatsApp AI", emoji: "🤖", maker: "Meta", character: "spark" },
  { id: "deepseek", label: "DeepSeek",emoji: "🤖", maker: "DeepSeek",    character: "ember" },
  { id: "regional", label: "Regional / local LLM (Jais, BharatGPT, Lelapa…)", emoji: "🤖", maker: "Various", character: "zuri" },
  { id: "none",     label: "I haven't used any of these", emoji: "❌", maker: null, character: "zuri" }
];

// Companion characters (mapped to LLM families)
const CHARACTERS = {
  sage:  { id: "sage",  emoji: "🧙", name: "Sage",  echoes: "Claude",   tagline: "I'll think with you, not for you." },
  spark: { id: "spark", emoji: "⚡", name: "Spark", echoes: "ChatGPT",  tagline: "Try me with anything." },
  zuri:  { id: "zuri",  emoji: "🌅", name: "Zuri",  echoes: "Local LLM",tagline: "Yɛbɛyɛ no wɔ Twi mu — let's do this in your language." },
  kira:  { id: "kira",  emoji: "🎯", name: "Kira",  echoes: "Copilot",  tagline: "No fluff. Show me what you've built." },
  scout: { id: "scout", emoji: "🦅", name: "Scout", echoes: "Gemini",   tagline: "I see your world." },
  ember: { id: "ember", emoji: "🔥", name: "Ember", echoes: "DeepSeek / open-source", tagline: "Bold and raw." }
};

// Boss-fight rivals — your guide vs the rival in The Oracle
const RIVAL_OF = {
  sage:  "spark",
  spark: "scout",
  zuri:  "spark",
  kira:  "spark",
  scout: "sage",
  ember: "spark"
};

// Atlas Classes (Hogwarts-style; resolved from ESCO clusters)
const ATLAS_CLASSES = [
  { id: "artisan",    emoji: "🔧", name: "The Artisan",    isco_clusters: ["7"],          tag: "Hands. Craft. Fixing things." },
  { id: "grower",     emoji: "🌾", name: "The Grower",     isco_clusters: ["6"],          tag: "Patience. Cycles. Earth." },
  { id: "dealmaker",  emoji: "🤝", name: "The Dealmaker",  isco_clusters: ["5", "3"],     tag: "Negotiation. Networks. Flow." },
  { id: "builder",    emoji: "💻", name: "The Builder",    isco_clusters: ["2"],          tag: "Logic. Systems. Code." },
  { id: "storyteller",emoji: "🎨", name: "The Storyteller",isco_clusters: ["3"],          tag: "Voice. Audience. Persuasion." },
  { id: "guardian",   emoji: "🛡️", name: "The Guardian",   isco_clusters: ["3", "5"],     tag: "Care. Protect. Teach." },
  { id: "solver",     emoji: "🧠", name: "The Solver",     isco_clusters: ["1", "2", "4"],tag: "Analyze. Investigate. Judge." },
  { id: "hustler",    emoji: "⚡", name: "The Hustler",    isco_clusters: ["multiple"],   tag: "Multi-domain entrepreneur." }
];

// AI Tier definitions
const AI_TIERS = [
  { tier: 0, label: "Unfamiliar", emoji: "🌑", premium: 0,    desc: "Hasn't used AI tools" },
  { tier: 1, label: "Curious",    emoji: "🌒", premium: 0.05, desc: "Tried 1–2 times. Casual one-shot queries" },
  { tier: 2, label: "Active",     emoji: "🌓", premium: 0.20, desc: "Weekly+ use. Iterates. Has go-to use cases" },
  { tier: 3, label: "Power User", emoji: "🌔", premium: 0.50, desc: "Multi-tool, multimodal, verifies output" },
  { tier: 4, label: "Builder",    emoji: "🌕", premium: 1.00, desc: "Builds on AI: custom workflows, automations, code" }
];

// Weapon tiers (from Loadout prompt-flex score)
const WEAPONS = [
  { tier: 1, name: "Iron Sword",    damage: 1, emoji: "🗡️" },
  { tier: 2, name: "Steel Sword",   damage: 2, emoji: "⚔️" },
  { tier: 3, name: "Mythril Blade", damage: 3, emoji: "✨⚔️" }
];

// Hidden bonus gems
const BONUS_GEMS = [
  { id: "multilingual",   emoji: "✨", name: "MULTILINGUAL",   condition: "3+ languages" },
  { id: "polymath",       emoji: "✨", name: "POLYMATH",       condition: "2+ occupation domains" },
  { id: "mentor",         emoji: "✨", name: "MENTOR",         condition: "high agreeableness + teaching cues" },
  { id: "builder",        emoji: "✨", name: "BUILDER",        condition: "high transfer + AI Tier 2+" },
  { id: "resilient",      emoji: "✨", name: "RESILIENT",      condition: "grit + storm composure" },
  { id: "hustler",        emoji: "✨", name: "HUSTLER",        condition: "multiple income streams" },
  { id: "fast_witness",   emoji: "✨", name: "FAST WITNESS",   condition: "attestor responds < 5 min" },
  { id: "oracle_slayer",  emoji: "✨", name: "ORACLE-SLAYER",  condition: "caught 4+ errors in rival clip" },
  { id: "flawless",       emoji: "✨", name: "FLAWLESS DUELIST",condition: "no damage taken in boss fight" },
  { id: "calibrated",     emoji: "✨", name: "CALIBRATED HERO",condition: "PROBE on partial truth" }
];

// Make accessible globally for the demo
window.ATLAS_CONFIG = { COUNTRIES, AI_TOOLS, CHARACTERS, RIVAL_OF, ATLAS_CLASSES, AI_TIERS, WEAPONS, BONUS_GEMS };
