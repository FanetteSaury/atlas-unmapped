// Atlas — Measurement Engine
// Implements the rubric-based scoring described in the methodology deck.
//
// The scoring is rule-based here for offline demo reliability.
// In production each rubric runs through Claude Sonnet 4.6 with structured tool-calling.

const ATLAS_SCORING = (function () {

  // ─── Rubric helpers ────────────────────────────────────────────────────────

  const KW = (text, words) => {
    const t = text.toLowerCase();
    return words.filter(w => t.includes(w.toLowerCase())).length;
  };

  const HAS = (text, word) => text.toLowerCase().includes(word.toLowerCase());

  const WORDS = (text) => text.trim().split(/\s+/).filter(Boolean).length;

  // ─── Inventory step (AI Tier baseline) ─────────────────────────────────────

  function scoreInventory(selectedTools, recencyStory) {
    const breadth = selectedTools.filter(t => t !== "none").length;

    let recencyScore = 0;       // 0-3
    let concretenessScore = 0;  // 0-3
    let iterationScore = 0;     // 0-3
    let outputUseScore = 0;     // 0-3

    if (selectedTools.includes("none") || !recencyStory) {
      return { breadth, recencyScore: 0, concretenessScore: 0, iterationScore: 0, outputUseScore: 0, provisionalTier: 0 };
    }

    const t = recencyStory.toLowerCase();

    if (HAS(t, "today") || HAS(t, "yesterday") || HAS(t, "this morning")) recencyScore = 3;
    else if (HAS(t, "this week") || HAS(t, "last week") || HAS(t, "few days")) recencyScore = 2;
    else if (HAS(t, "month")) recencyScore = 1;

    const customer = HAS(t, "customer") || HAS(t, "client") || HAS(t, "user");
    const taskWords = KW(t, ["wrote", "drafted", "asked", "translated", "fixed", "debugged", "summarized", "explained", "researched"]);
    if (customer && taskWords >= 1) concretenessScore = 3;
    else if (taskWords >= 2) concretenessScore = 2;
    else if (taskWords >= 1) concretenessScore = 1;

    const iterCues = KW(t, ["told it", "asked it again", "rephrased", "less", "more", "tried again", "second time", "iterate", "refine", "tweak"]);
    if (iterCues >= 2) iterationScore = 3;
    else if (iterCues === 1) iterationScore = 2;

    const outputCues = KW(t, ["sent", "used", "shared", "posted", "submitted", "published", "applied"]);
    const editCues = KW(t, ["edited", "changed", "fixed", "polished"]);
    if (editCues >= 1 && outputCues >= 1) outputUseScore = 3;
    else if (outputCues >= 1) outputUseScore = 2;
    else if (HAS(t, "read")) outputUseScore = 1;

    const provisionalTier = Math.min(4, Math.round(
      (breadth >= 3 ? 1 : 0) +
      (recencyScore + concretenessScore + iterationScore + outputUseScore) / 4
    ));

    return { breadth, recencyScore, concretenessScore, iterationScore, outputUseScore, provisionalTier };
  }

  // ─── Origin (Chapter 1) — universal occupation discovery ──────────────────

  function scoreOrigin(narrative, country) {
    const lower = narrative.toLowerCase();
    const tokens = WORDS(narrative);
    const codeSwitches = (narrative.match(/[\u0980-\u09FF]|[À-ÿ]/g) || []).length > 0 ? 1 : 0;

    // Detect occupation candidates (toy detector — production uses ESCO classifier)
    const candidates = [];
    const matchers = [
      { isco: "7421", words: ["phone", "repair", "fix", "logic board", "screen", "battery", "soldering"] },
      { isco: "7531", words: ["sewing", "tailor", "blouse", "fabric", "embroidery", "stitching", "pattern"] },
      { isco: "5223", words: ["selling", "shop", "store", "customer", "sales", "kiosk", "market"] },
      { isco: "2519", words: ["code", "coding", "javascript", "python", "react", "next.js", "debug", "developer"] },
      { isco: "5311", words: ["babysit", "babysitting", "childcare", "kid", "kids", "toddler", "infant"] },
      { isco: "5223", words: ["fish", "trade", "ice", "wharf", "market", "dawn"] },
    ];
    for (const m of matchers) {
      const hits = KW(narrative, m.words);
      if (hits > 0) candidates.push({ isco: m.isco, confidence: Math.min(0.95, 0.45 + 0.12 * hits) });
    }
    candidates.sort((a, b) => b.confidence - a.confidence);

    const time_organized = HAS(lower, "morning") || HAS(lower, "afternoon") || HAS(lower, "evening") ||
                           HAS(lower, "first") || HAS(lower, "then") || HAS(lower, "after") || HAS(lower, "around");
    const cognitive_baseline = Math.min(10, 3 + (tokens / 12));

    return {
      occupation_candidates: candidates.slice(0, 3),
      tokens,
      time_organized,
      code_switches: codeSwitches,
      cognitive_baseline: Math.round(cognitive_baseline * 10) / 10,
      conscientiousness_signal: time_organized ? 1 : 0
    };
  }

  // ─── Forge (Chapter 2) — technical tier + grit + problem solving ──────────

  function scoreForge(narrative, isco) {
    const lower = narrative.toLowerCase();
    const catalog = (window.ESCO_CATALOG || {})[isco];
    const detected = [];
    if (catalog) {
      for (const skill of catalog.skills) {
        const tokens = skill.label.split(/\s+/).map(w => w.toLowerCase());
        const hits = tokens.filter(w => w.length > 3 && lower.includes(w)).length;
        if (hits >= 1) detected.push(skill);
      }
    }

    const escalation_words = KW(lower, ["tried", "first", "then", "switched", "next", "after that", "finally"]);
    const duration = HAS(lower, "hour") || HAS(lower, "day") || HAS(lower, "week");
    const setbacks = KW(lower, ["broke", "failed", "wrong", "didn't work", "stuck", "again"]);

    // Problem-solving rubric (0-3 per dimension)
    const diagnosis = escalation_words >= 2 ? 3 : escalation_words >= 1 ? 2 : 1;
    const specificity = detected.length >= 2 ? 3 : detected.length === 1 ? 2 : 1;
    const escalation = setbacks >= 1 && escalation_words >= 1 ? 3 : 1;
    const outcome = HAS(lower, "worked") || HAS(lower, "fixed") || HAS(lower, "delivered") ? 3 : 1;

    const ps_score = (diagnosis + specificity + escalation + outcome) / 4 * 10 / 3;
    const grit = Math.min(10, (duration ? 4 : 1) + setbacks * 2 + (escalation_words >= 2 ? 2 : 0));

    // Tier I-V from skill density × specificity
    const advanced_count = detected.filter(s => s.tier === "advanced").length;
    let tier = "I";
    if (advanced_count >= 2) tier = "IV";
    else if (advanced_count === 1) tier = "III";
    else if (detected.length >= 2) tier = "II";

    return {
      esco_skills: detected,
      problem_solving: Math.round(ps_score * 10) / 10,
      grit: Math.round(grit * 10) / 10,
      tier,
      escalation_words,
      setbacks
    };
  }

  // ─── Mind (Chapter 3) — numeracy ──────────────────────────────────────────

  function scoreMind(answer, expected, methodShown, elapsedSec) {
    const num = parseFloat(answer.replace(/[^\d.\-]/g, ""));
    const correct = !isNaN(num) && Math.abs(num - expected) / expected < 0.1;
    const closeMiss = !isNaN(num) && Math.abs(num - expected) / expected < 0.25;

    let score = 0;
    if (correct && methodShown && elapsedSec < 30) score = 10;
    else if (correct && methodShown) score = 9;
    else if (correct) score = 7;
    else if (closeMiss && methodShown) score = 5;
    else if (closeMiss) score = 4;
    else if (methodShown) score = 3;
    else score = 1;

    return { numeracy: score, correct, methodShown, elapsedSec };
  }

  // ─── Heart (Chapter 4) — socio-emotional ──────────────────────────────────

  function scoreHeart(narrative) {
    const lower = narrative.toLowerCase();

    const externalBlame = KW(lower, ["they were wrong", "they didn't", "their fault", "she was rude", "he was wrong"]);
    const sharedView = KW(lower, ["i could see", "i understood", "they were upset because", "i'd been"]);
    const selfAware = KW(lower, ["i made a mistake", "i could have", "i should have", "my bad", "my fault"]);
    const action = KW(lower, ["i told", "i offered", "i listened", "i asked", "i went back", "i apologized", "i fixed", "i replaced"]);
    const resolved = HAS(lower, "resolved") || HAS(lower, "calmed") || HAS(lower, "agreed") || HAS(lower, "happy") || HAS(lower, "thanked");
    const dysreg = KW(lower, ["furious", "destroyed", "blew up", "yelled"]);

    const attribution = sharedView >= 1 ? 3 : (externalBlame >= 1 ? 1 : 2);
    const regulation = dysreg >= 1 ? 1 : 3;
    const action_orient = action >= 2 ? 3 : action >= 1 ? 2 : 1;
    const self_awareness = selfAware >= 1 ? 3 : 2;
    const outcome = resolved ? 3 : 1;

    const agreeableness = (attribution + self_awareness) / 2 * 10 / 3;
    const neuroticism_inverse = regulation * 10 / 3;
    const conscientiousness = action_orient * 10 / 3;
    const hostile_attribution_bias = 10 - attribution * 10 / 3;
    const grit_storm = ((action_orient + outcome) / 2) * 10 / 3;

    return {
      agreeableness: Math.round(agreeableness * 10) / 10,
      emotional_regulation: Math.round(neuroticism_inverse * 10) / 10,
      conscientiousness_storm: Math.round(conscientiousness * 10) / 10,
      hostile_attribution_bias: Math.round(hostile_attribution_bias * 10) / 10,
      grit_storm: Math.round(grit_storm * 10) / 10,
      raw: { attribution, regulation, action_orient, self_awareness, outcome }
    };
  }

  // ─── Oracle (Chapter 5) — AI Tier composite ───────────────────────────────

  function scorePromptFlex(prompt) {
    const lower = prompt.toLowerCase();
    const tokens = WORDS(prompt);

    const role = HAS(lower, "you are") || HAS(lower, "act as") || HAS(lower, "pretend") ? 3 : (HAS(lower, "as a ") ? 2 : 0);
    const audience = HAS(lower, "customer") || HAS(lower, "client") || HAS(lower, "audience") || HAS(lower, "for ") ? (tokens > 25 ? 3 : 2) : 0;

    const specificity = tokens > 50 ? 3 : tokens > 25 ? 2 : tokens > 10 ? 1 : 0;
    const lengthSpec = HAS(lower, "sentence") || HAS(lower, "paragraph") || HAS(lower, "word") ? 2 : 0;
    const toneSpec = HAS(lower, "warm") || HAS(lower, "professional") || HAS(lower, "friendly") || HAS(lower, "formal") ? 1 : 0;
    const formatSpec = Math.min(3, lengthSpec + toneSpec);

    const iteration = HAS(lower, "if ") || HAS(lower, "then ") || HAS(lower, "also ") ? 2 : 0;
    const verification = HAS(lower, "don't ") || HAS(lower, "avoid") || HAS(lower, "without") || HAS(lower, "verify") || HAS(lower, "cite") ? 3 : 0;

    const total = role + Math.min(3, specificity + audience / 3) + formatSpec + iteration + verification;
    let weaponTier = 1;
    if (total >= 11) weaponTier = 3;
    else if (total >= 6) weaponTier = 2;

    return { role, specificity, format: formatSpec, iteration, verification, total, weaponTier };
  }

  function scoreDuelChoice(choice, roundType) {
    // roundType: "lie" | "bluff" | "partial"
    // returns { dmg_to_spark, dmg_to_player, gem_unlocked }
    if (roundType === "lie") {
      if (choice === "strike") return { dmg_to_spark: 3, dmg_to_player: 0, calibration: 1 };
      if (choice === "probe")  return { dmg_to_spark: 1, dmg_to_player: 0, calibration: 0 };
      return { dmg_to_spark: 0, dmg_to_player: 1, calibration: -1 }; // trust on lie = penalty
    }
    if (roundType === "bluff") {
      if (choice === "probe")  return { dmg_to_spark: 2, dmg_to_player: 0, calibration: 1 };
      if (choice === "strike") return { dmg_to_spark: 2, dmg_to_player: 0, calibration: 0 };
      return { dmg_to_spark: 0, dmg_to_player: 1, calibration: -1 };
    }
    if (roundType === "partial") {
      if (choice === "probe")  return { dmg_to_spark: 2, dmg_to_player: 0, calibration: 2 }; // best
      if (choice === "trust")  return { dmg_to_spark: 1, dmg_to_player: 0, calibration: 1 };
      return { dmg_to_spark: 0, dmg_to_player: 1, calibration: -2 }; // strike on partial = over-confident
    }
    return { dmg_to_spark: 0, dmg_to_player: 0, calibration: 0 };
  }

  function computeAITier(state) {
    const { inventory, promptFlex, duelLog } = state.measurements;

    const breadthScore = Math.min(3, (inventory?.breadth || 0));
    const intelAvg = inventory ? (inventory.recencyScore + inventory.concretenessScore + inventory.iterationScore + inventory.outputUseScore) / 4 : 0;
    const promptScore = promptFlex ? promptFlex.total / 14 * 3 : 0;

    const strikeAccuracy = duelLog ? duelLog.filter(r => r.calibration > 0).length / Math.max(1, duelLog.length) * 3 : 0;
    const r3 = duelLog ? duelLog[duelLog.length - 1] : null;
    const calibrationScore = r3 ? Math.max(0, r3.calibration) : 0;

    const composite =
      0.10 * breadthScore +
      0.20 * intelAvg +
      0.30 * promptScore +
      0.20 * strikeAccuracy +
      0.20 * calibrationScore;

    let tier = Math.min(4, Math.round(composite * 1.4));

    // R3 floor + cap rules
    if (r3) {
      if (r3.calibration < 0) tier = Math.min(2, tier); // over-confident strike caps at 2
      if (r3.calibration === 2 && tier < 3) tier = 3;   // calibrated probe unlocks 3
    }

    // No tools = max tier 1
    if (inventory && inventory.breadth === 0) tier = Math.min(1, tier);

    return Math.max(0, tier);
  }

  // ─── Atlas Class assignment from ESCO clusters ────────────────────────────

  function assignClass(escoSkills, isco) {
    const major = isco ? isco.charAt(0) : null;
    const map = { "7": "artisan", "6": "grower", "5": "dealmaker", "2": "builder", "3": "storyteller", "4": "solver", "1": "solver" };
    const primary = map[major] || "hustler";

    // Detect hustler bonus: skills span 2+ ISCO majors
    const majors = new Set();
    for (const s of escoSkills) {
      // Toy detection: just count distinct skill prefixes
      majors.add(s.code.charAt(2));
    }
    const isHybrid = majors.size >= 2;

    const cls = window.ATLAS_CONFIG.ATLAS_CLASSES.find(c => c.id === primary);
    return { primary: cls, hybridWith: isHybrid ? window.ATLAS_CONFIG.ATLAS_CLASSES.find(c => c.id === "hustler") : null };
  }

  // ─── Final wage verdict ───────────────────────────────────────────────────

  function computeVerdict(country, isco, aiTier) {
    const wageData = (window.ECONOMETRIC.ILOSTAT_WAGE[country] || {})[isco];
    if (!wageData) return null;

    const baseline = wageData.formal_median;
    const tierConfig = window.ATLAS_CONFIG.AI_TIERS.find(t => t.tier === aiTier);
    const aiPremium = tierConfig.premium;
    const finalWage = Math.round(baseline * (1 + aiPremium));

    return {
      isco_label: wageData.isco_label,
      baseline_wage: baseline,
      ai_premium_pct: Math.round(aiPremium * 100),
      ai_premium_amount: finalWage - baseline,
      final_wage: finalWage,
      currency: window.ATLAS_CONFIG.COUNTRIES[country].currency
    };
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  return {
    scoreInventory,
    scoreOrigin,
    scoreForge,
    scoreMind,
    scoreHeart,
    scorePromptFlex,
    scoreDuelChoice,
    computeAITier,
    assignClass,
    computeVerdict
  };
})();

window.ATLAS_SCORING = ATLAS_SCORING;
