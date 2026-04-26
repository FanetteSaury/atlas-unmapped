// Atlas — Player Quest Orchestrator
// Runs the WhatsApp-style chat through Inventory → 7 chapters → Atlas Card.

(function () {
  "use strict";
  const C = window.ATLAS_CONFIG;
  const S = window.ATLAS_SCORING;
  const E = window.ECONOMETRIC;

  // ─── Player state ────────────────────────────────────────────────────────
  const state = {
    country: "GH",
    codename: null,
    selectedTools: [],
    companion: "spark", // chosen LLM-style guide
    isco: null,
    weapon: { tier: 1, name: "Iron Sword", damage: 1, emoji: "🗡️" },
    hp: { player: 3, spark: 8 },
    probeCharges: 2,
    chapter: -1,                      // -1 = pre-quest, 0..6 = chapters
    gemsUnlocked: [],
    bonusGems: [],
    measurements: {
      inventory: null,
      origin: null,
      forge: null,
      mind: null,
      heart: null,
      promptFlex: null,
      duelLog: [],
      future: null,
      tribe: null
    },
    aiTier: 0,
    classAssignment: null,
    verdict: null
  };

  // ─── DOM helpers ─────────────────────────────────────────────────────────
  const $ = (s) => document.querySelector(s);
  const chat = () => $("#wa-chat");

  function delay(ms) { return new Promise(res => setTimeout(res, ms)); }

  function setSendDisabled(disabled) {
    const btn = $("#wa-send-btn"); const inp = $("#wa-input-field"); const mic = $("#wa-mic-btn");
    if (btn) btn.disabled = disabled; if (inp) inp.disabled = disabled; if (mic) mic.disabled = disabled;
  }

  function showTyping() {
    const el = document.createElement("div");
    el.className = "typing"; el.id = "typing-indicator";
    el.innerHTML = "<span></span><span></span><span></span>";
    chat().appendChild(el); scrollChat();
    return el;
  }
  function hideTyping() {
    const t = $("#typing-indicator"); if (t) t.remove();
  }

  function bubble(text, who = "bot", extraClass = "") {
    const div = document.createElement("div");
    div.className = `wa-bubble ${who} ${extraClass}`;
    div.innerHTML = text;
    chat().appendChild(div);
    scrollChat();
    return div;
  }

  function systemMsg(text) { bubble(text, "system"); }

  function scrollChat() { const c = chat(); if (c) c.scrollTop = c.scrollHeight + 200; }

  async function botSay(messages, typingMs = 700) {
    if (!Array.isArray(messages)) messages = [messages];
    for (const m of messages) {
      const t = showTyping(); await delay(typingMs); hideTyping();
      bubble(m, "bot"); await delay(180);
    }
  }
  async function sparkSay(message, typingMs = 700) {
    const t = showTyping(); await delay(typingMs); hideTyping();
    bubble(`<strong>⚡ SPARK 🎤:</strong> ${message}`, "spark");
  }

  function userSay(text, isAudio = false) { 
    if (isAudio) {
      bubble(`<div class="play-icon">▶</div><div class="waveform"></div><div style="font-size:0.75rem;margin-left:4px;opacity:0.8">0:04</div><div style="width:100%;font-size:0.8rem;margin-top:6px;font-style:italic">"${text}"</div>`, "user audio");
    } else {
      bubble(text, "user"); 
    }
  }

  // ─── Quick replies / weapon row ──────────────────────────────────────────
  function showQuickReplies(options) {
    const row = $("#wa-quickreplies");
    row.innerHTML = "";
    return new Promise((resolve) => {
      options.forEach((opt) => {
        const b = document.createElement("button");
        b.textContent = opt;
        b.onclick = () => {
          row.innerHTML = "";
          userSay(opt);
          resolve(opt);
        };
        row.appendChild(b);
      });
    });
  }
  function clearQuickReplies() { $("#wa-quickreplies").innerHTML = ""; }

  function showWeaponRow(probeCharges) {
    const row = $("#wa-weapon-row");
    row.innerHTML = "";
    return new Promise((resolve) => {
      const make = (cls, ico, label, sub, choice, disabled = false) => {
        const b = document.createElement("button");
        b.className = `weapon-btn ${cls}`;
        b.disabled = disabled;
        b.innerHTML = `<span class="ico">${ico}</span><span>${label}</span><span style="font-size:0.72rem;opacity:0.8">${sub}</span>`;
        b.onclick = () => { row.innerHTML = ""; resolve(choice); };
        row.appendChild(b);
      };
      make("trust",  "🛡️", "TRUST",  "agree", "trust");
      make("strike", "⚔️", "STRIKE", "−1 ❤️ if wrong", "strike");
      make("probe",  "🔍", "PROBE",  `${probeCharges}× left`, "probe", probeCharges <= 0);
    });
  }
  function clearWeaponRow() { $("#wa-weapon-row").innerHTML = ""; }

  function getUserText() {
    return new Promise((resolve) => {
      const inp = $("#wa-input-field");
      const btn = $("#wa-send-btn");
      const mic = $("#wa-mic-btn");
      setSendDisabled(false);
      inp.focus();

      const submit = (v, isAudio = false) => {
        if (!v) return;
        inp.value = ""; setSendDisabled(true);
        userSay(v, isAudio); resolve(v);
      };

      btn.onclick = () => submit(inp.value.trim());
      inp.onkeydown = (e) => { if (e.key === "Enter") submit(inp.value.trim()); };

      // Voice-to-Text integration
      if (mic) {
        mic.onclick = () => {
          if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
            alert("Voice recording is not supported in this browser. Please type your response.");
            return;
          }
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          const recognition = new SpeechRecognition();
          recognition.lang = 'en-US';
          recognition.interimResults = false;
          recognition.maxAlternatives = 1;

          mic.classList.add("recording");
          inp.placeholder = "Listening...";
          inp.disabled = true;

          recognition.start();

          recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            mic.classList.remove("recording");
            submit(transcript, true);
          };

          recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            mic.classList.remove("recording");
            inp.placeholder = "Type or paste — Enter to send";
            inp.disabled = false;
            inp.focus();
          };

          recognition.onspeechend = () => {
            recognition.stop();
          };
        };
      }
    });
  }

  // ─── Live measurement rail ───────────────────────────────────────────────
  function updateRail() {
    const m = state.measurements;
    const country = C.COUNTRIES[state.country];
    const companion = C.CHARACTERS[state.companion];

    $("#rail-country").textContent = `${country.flag} ${country.name}`;
    $("#rail-companion").innerHTML = `<span class="ava">${companion.emoji}</span><div><div class="name">${companion.name}</div><div class="sub">${companion.archetype}</div></div>`;
    $("#rail-codename").textContent = state.codename || "(awaiting)";
    $("#rail-isco").textContent = state.isco || "—";

    // Lives
    let livesHTML = "";
    for (let i = 0; i < 3; i++) {
      livesHTML += `<span class="heart ${i < state.hp.player ? "" : "lost"}">❤️</span>`;
    }
    $("#rail-lives").innerHTML = livesHTML;

    // Gems
    const gemNames = ["Origin", "Craft", "Mind", "Heart", "Oracle", "Future", "Tribe"];
    let gemsHTML = "";
    gemNames.forEach((g, i) => {
      gemsHTML += `<span class="gem ${state.gemsUnlocked.includes(i) ? "unlocked" : ""}" title="${g}">💎</span>`;
    });
    $("#rail-gems").innerHTML = gemsHTML;

    // Bonus gems
    let bonusHTML = "";
    state.bonusGems.forEach(b => bonusHTML += `<span class="bonus">✨ ${b}</span>`);
    $("#rail-bonus").innerHTML = bonusHTML || `<span style="font-size:0.75rem;color:var(--atlas-muted)">none yet</span>`;

    // AI Tier
    const tier = state.aiTier;
    const tierConfig = C.AI_TIERS.find(t => t.tier === tier);
    $("#rail-aitier").textContent = `${tierConfig.emoji} Tier ${tier} — ${tierConfig.label}`;
    let segHTML = "";
    for (let i = 0; i < 5; i++) {
      const fillCls = i <= tier ? (tier >= 4 ? "fill t4" : tier === 3 ? "fill t3" : "fill") : "";
      segHTML += `<div class="seg ${fillCls}"></div>`;
    }
    $("#rail-tier-bar").innerHTML = segHTML;

    // ESCO chips
    let chipsHTML = "";
    if (m.forge && m.forge.esco_skills) {
      m.forge.esco_skills.forEach(s => {
        chipsHTML += `<span class="skill-chip detected">${s.label}</span>`;
      });
    }
    $("#rail-skills").innerHTML = chipsHTML || `<span style="font-size:0.75rem;color:var(--atlas-muted)">awaiting Forge</span>`;

    // Privacy
    const pTier = country.privacy_default_female;
    $("#rail-privacy").innerHTML = `<div class="lvl">T${pTier} — ${["Public-only", "Pseudonymous", "Consent-gated"][pTier - 1] || "Default"}</div><div style="opacity:0.85;margin-top:2px">${country.code === "BD" ? "Stricter for female users (WBL 2024)" : "Standard 3-tier defaults"}</div>`;

    // Measurement table
    let measHTML = "";
    if (m.inventory) measHTML += `<div class="row"><span class="lbl">AI tools used</span><span class="val">${m.inventory.breadth}/8</span></div>`;
    if (m.origin) measHTML += `<div class="row"><span class="lbl">ISCO seed</span><span class="val">${state.isco || "—"}</span></div>`;
    if (m.forge) measHTML += `<div class="row"><span class="lbl">Tech tier</span><span class="val">${m.forge.tier}</span></div>` +
                              `<div class="row"><span class="lbl">Problem-solving</span><span class="val">${m.forge.problem_solving}/10</span></div>` +
                              `<div class="row"><span class="lbl">Grit</span><span class="val">${m.forge.grit}/10</span></div>`;
    if (m.mind) measHTML += `<div class="row"><span class="lbl">Numeracy</span><span class="val">${m.mind.numeracy}/10</span></div>`;
    if (m.heart) measHTML += `<div class="row"><span class="lbl">Agreeableness</span><span class="val">${m.heart.agreeableness}/10</span></div>` +
                              `<div class="row"><span class="lbl">Emo. regulation</span><span class="val">${m.heart.emotional_regulation}/10</span></div>`;
    if (m.promptFlex) measHTML += `<div class="row"><span class="lbl">Weapon</span><span class="val">${state.weapon.emoji} ${state.weapon.name}</span></div>`;

    $("#rail-measurements").innerHTML = measHTML || `<div style="font-size:0.85rem;color:var(--atlas-muted)">measurements appear here as the quest progresses</div>`;
  }

  // ─── Country switcher ────────────────────────────────────────────────────
  function setupCountrySwitcher() {
    const wrap = $("#country-toggle");
    Object.values(C.COUNTRIES).forEach(c => {
      const b = document.createElement("button");
      b.className = `country-btn ${c.code === state.country ? "active" : ""}`;
      b.innerHTML = `${c.flag} ${c.name}`;
      b.onclick = () => {
        state.country = c.code;
        document.querySelectorAll(".country-btn").forEach(x => x.classList.remove("active"));
        b.classList.add("active");
        updateRail();
      };
      wrap.appendChild(b);
    });
  }

  // ─── HP bar (boss fight) ────────────────────────────────────────────────
  function renderHpBar() {
    const sparkPct = state.hp.spark / 8 * 100;
    const html = `
      <div class="hp-bar">
        <div class="label">⚡ SPARK HP</div>
        <div class="bar"><div class="fill spark" style="width:${sparkPct}%"></div></div>
        <div class="label" style="margin-top:8px">🥷 YOUR HEARTS: ${"❤️".repeat(state.hp.player)}${"🤍".repeat(3 - state.hp.player)}</div>
        <div class="label" style="margin-top:4px;font-weight:400">🔍 PROBE: ${"🔍".repeat(state.probeCharges)}${"·".repeat(2 - state.probeCharges)}  &nbsp; ⚔ ${state.weapon.emoji} ${state.weapon.name}</div>
      </div>`;
    bubble(html, "system").classList.add("wa-bubble");
    // Workaround: replace the system class with raw rendering
  }

  // ─── PRE-QUEST: Inventory + Companion ───────────────────────────────────
  async function runInventory() {
    const country = C.COUNTRIES[state.country];

    await botSay([
      `🌍 Welcome, hero. I'm <strong>Atlas</strong>.`,
      `Before we start your 12-minute quest, three quick questions.`,
      `<strong>1️⃣  Which AI tools have you ACTUALLY used?</strong> Tap every one that applies — no judgment if it's none.`
    ]);

    // Render multi-select for tools
    const toolList = C.AI_TOOLS;
    const opts = toolList.map(t => `${t.emoji} ${t.label}`);
    bubble(buildToolGrid(toolList), "bot").innerHTML = buildToolGrid(toolList);

    state.selectedTools = await waitForToolSelection();
    userSay(state.selectedTools.length ? state.selectedTools.map(id => toolList.find(t => t.id === id).label).join(", ") : "(none)");

    // Pick companion
    const usedTools = state.selectedTools.filter(t => t !== "none");
    if (usedTools.length === 0) {
      await botSay([`No worries — let's pair you with <strong>🌅 Zuri</strong>, who speaks your local language and is great for first-timers.`]);
      state.companion = "zuri";
    } else {
      await botSay([`<strong>2️⃣  From the ones you know, pick ONE to be your guide for the quest:</strong>`]);
      const companionOptions = usedTools.map(id => {
        const tool = toolList.find(t => t.id === id);
        const ch = C.CHARACTERS[tool.character];
        return `${ch.emoji} ${ch.name} (${tool.label})`;
      });
      const pick = await showQuickReplies(companionOptions);
      state.companion = toolList.find(t => pick.includes(toolList.find(x => x.id === t.id)?.label || "___"))?.character || "spark";
      // Defensive: try to match by label substring
      for (const tid of usedTools) {
        const t = toolList.find(x => x.id === tid);
        if (pick.includes(t.label)) { state.companion = t.character; break; }
      }
    }
    updateRail();

    // Drill-in (recency)
    const companion = C.CHARACTERS[state.companion];
    await botSay([
      `${companion.emoji} <strong>${companion.name}</strong> is now your companion. ${companion.archetype}.`,
      `<strong>3️⃣  Last quick one before the quest.</strong> Tell me — when did you last try to figure something out on your own — what was it?`,
      `(30 seconds. Voice or text.)`
    ]);

    let recencyStory = "(skipped)";
    if (usedTools.length > 0) {
      recencyStory = await getUserText();
    } else {
      await showQuickReplies(["I'm new to AI"]);
      recencyStory = "I'm new to AI";
    }

    // Score inventory
    const inv = S.scoreInventory(state.selectedTools, recencyStory);
    state.measurements.inventory = inv;
    state.aiTier = inv.provisionalTier;
    updateRail();

    // Codename
    await botSay([
      `Logged. ✅ <strong>AI Tier provisional: ${inv.provisionalTier}</strong> (refined in The Oracle).`,
      `Pick a code-name for the quest — or use your real name. Reply.`
    ]);
    state.codename = await getUserText();
    updateRail();

    await botSay([
      `Welcome, <strong>${state.codename}</strong>. ❤️❤️❤️ Three lives. Seven gems. One Atlas Card.`,
      `Reply <strong>READY</strong> to begin.`
    ]);
    await showQuickReplies(["READY"]);
  }

  function buildToolGrid(tools) {
    let html = `<div style="display:flex;flex-direction:column;gap:6px">`;
    tools.forEach((t, i) => {
      html += `<label style="display:flex;align-items:center;gap:8px;font-size:0.88rem;cursor:pointer">
                 <input type="checkbox" data-tool="${t.id}" style="margin:0" />
                 <span>${i + 1}️⃣ ${t.emoji} ${t.label}</span>
               </label>`;
    });
    html += `</div>
             <button id="wa-tool-confirm" style="margin-top:10px;padding:6px 14px;background:var(--wa-header);color:white;border:none;border-radius:18px;cursor:pointer;font-weight:600">Confirm</button>`;
    return html;
  }
  function waitForToolSelection() {
    return new Promise((resolve) => {
      const tryBind = () => {
        const btn = document.getElementById("wa-tool-confirm");
        if (!btn) { setTimeout(tryBind, 80); return; }
        btn.onclick = () => {
          const checked = [...document.querySelectorAll('input[data-tool]:checked')].map(i => i.dataset.tool);
          // If "none" is checked, ignore others
          const final = checked.includes("none") ? ["none"] : checked;
          // remove this UI
          btn.parentElement.remove();
          resolve(final);
        };
      };
      tryBind();
    });
  }

  // ─── CHAPTER RUNNERS ────────────────────────────────────────────────────

  async function runOriginChapter() {
    const ch = window.ATLAS_CHAPTERS.find(c => c.id === "origin");
    state.chapter = 0;
    await botSay([
      `🎬 <strong>Chapter 1 — ${ch.title}</strong>`,
      ch.surfaceMessage,
      `(90 sec, voice or text)`
    ]);
    await showQuickReplies([`Use sample (${C.COUNTRIES[state.country].sample_player.name})`, "Type my own"]);
    let narrative;
    if (document.querySelector(".wa-bubble.user:last-child")?.textContent.startsWith("Use sample")) {
      narrative = ch.sampleResponses[state.country];
      userSay(narrative);
    } else {
      narrative = await getUserText();
    }

    const result = S.scoreOrigin(narrative, state.country);
    state.measurements.origin = result;
    state.isco = result.occupation_candidates[0]?.isco || C.COUNTRIES[state.country].sample_player.isco_seed;
    state.gemsUnlocked.push(0);
    updateRail();

    const candidate = result.occupation_candidates[0];
    const cls = window.ATLAS_CONFIG.ATLAS_CLASSES.find(c => c.isco_clusters.includes((candidate?.isco || "").charAt(0)));

    await botSay([
      `👀 Got it. Detected: <strong>${candidate ? `ISCO ${candidate.isco} — confidence ${(candidate.confidence*100).toFixed(0)}%` : "open occupation"}</strong>`,
      `You feel like a candidate for <strong>${cls?.emoji || "🌟"} ${cls?.name || "open class"}</strong>.`,
      `💎 Gem 1: <strong>ORIGIN</strong> unlocked.`
    ]);
  }

  async function runForgeChapter() {
    const ch = window.ATLAS_CHAPTERS.find(c => c.id === "forge");
    state.chapter = 1;
    const summary = state.isco === "7421" ? "Phone repair" :
                    state.isco === "7531" ? "Tailoring" :
                    state.isco === "2519" ? "Coding" : "Your work";
    await botSay([
      `🎬 <strong>Chapter 2 — The Forge</strong>`,
      ch.surfaceMessage({ detected_summary: summary }),
      `(2 min)`
    ]);
    await showQuickReplies([`Use sample`, "Type my own"]);
    let narrative;
    const last = document.querySelector(".wa-bubble.user:last-child")?.textContent;
    if (last && last.startsWith("Use sample")) {
      narrative = ch.sampleResponses[state.country];
      userSay(narrative);
    } else {
      narrative = await getUserText();
    }

    const result = S.scoreForge(narrative, state.isco);
    state.measurements.forge = result;
    state.gemsUnlocked.push(1);
    updateRail();

    const detectedNames = result.esco_skills.map(s => s.label).join(", ");
    await botSay([
      `🔥 ESCO skills detected: <strong>${detectedNames || "(none specific)"}</strong>`,
      `Technical Tier: <strong>${result.tier}</strong> · Problem-solving: <strong>${result.problem_solving}/10</strong> · Grit: <strong>${result.grit}/10</strong>`,
      `🏆 Gem 2: <strong>CRAFT</strong> unlocked.`
    ]);
  }

  async function runMindChapter() {
    const ch = window.ATLAS_CHAPTERS.find(c => c.id === "mind");
    state.chapter = 2;
    const promptData = ch.promptByDomain[state.isco] || ch.promptByDomain["7421"];
    const prompt = promptData[state.country] || promptData.GH;

    await botSay([
      `🎬 <strong>Chapter 3 — The Mind</strong>`,
      `⏱️ <strong>60 seconds on the clock</strong>.`,
      prompt,
      `Reply with the price + your hourly rate.`
    ]);
    await showQuickReplies([`Use sample answer`, "Type my own"]);
    let answer;
    const t0 = Date.now();
    const last = document.querySelector(".wa-bubble.user:last-child")?.textContent;
    if (last && last.startsWith("Use sample")) {
      answer = ch.sampleResponses[state.country];
      userSay(answer);
    } else {
      answer = await getUserText();
    }
    const elapsed = (Date.now() - t0) / 1000;
    const methodShown = /\bdivid|profit|hour|minute|over|per|times|x\b/i.test(answer);
    const result = S.scoreMind(answer, promptData.expected, methodShown, elapsed);
    state.measurements.mind = result;
    state.gemsUnlocked.push(2);
    updateRail();
    await botSay([
      `${result.correct ? "✅ Correct." : "⚠️ Off."} ${methodShown ? "Method shown — that adds points." : "No reasoning shown."}`,
      `STEP Numeracy: <strong>${result.numeracy}/10</strong>`,
      `🧠 Gem 3: <strong>MIND</strong> unlocked.`
    ]);
  }

  async function runHeartChapter() {
    const ch = window.ATLAS_CHAPTERS.find(c => c.id === "heart");
    state.chapter = 3;
    await botSay([`🎬 <strong>Chapter 4 — The Storm</strong>`, ch.surfaceMessage, `(90 sec)`]);
    await showQuickReplies([`Use sample`, "Type my own"]);
    let narrative;
    const last = document.querySelector(".wa-bubble.user:last-child")?.textContent;
    if (last && last.startsWith("Use sample")) {
      narrative = ch.sampleResponses[state.country]; userSay(narrative);
    } else {
      narrative = await getUserText();
    }
    const r = S.scoreHeart(narrative);
    state.measurements.heart = r;
    state.gemsUnlocked.push(3);
    updateRail();
    await botSay([
      `Read: Agreeableness ${r.agreeableness}/10 · Emo. Regulation ${r.emotional_regulation}/10 · Hostile-attribution ${r.hostile_attribution_bias}/10`,
      `❤️ Gem 4: <strong>HEART</strong> unlocked.`
    ]);
  }

  // ─── ORACLE CHAPTER (boss fight) ────────────────────────────────────────
  async function runOracleChapter() {
    state.chapter = 4;
    const oracle = window.ORACLE_CONTENT[state.isco] || window.ORACLE_CONTENT["7421"];
    const sparkChar = C.CHARACTERS[C.RIVAL_OF[state.companion] || "spark"];

    await botSay([
      `🚨🚨🚨 <strong>ORACLE BOSS FIGHT</strong> 🚨🚨🚨`,
      `For the next ~3 minutes, you face <strong>${sparkChar.emoji} ${sparkChar.name}</strong> — a rival AI that's confident and sometimes WRONG.`,
      `Phase 1 — INTEL.<br>Phase 2 — LOADOUT.<br>Phase 3 — DUEL (3 rounds).`,
      `Reply <strong>READY</strong>.`
    ]);
    await showQuickReplies(["READY"]);

    // ---- Phase 1: Intel ----
    await botSay([`📜 <strong>Phase 1 — INTEL</strong>`, `Tell me about the LAST time you taught yourself something new — what was it, where did you learn it, what did you do with what you learned?? (45 sec)`]);
    await showQuickReplies([`Use sample`, "Type my own"]);
    const last = document.querySelector(".wa-bubble.user:last-child")?.textContent;
    let intelStory;
    const sampleIntel = {
      GH: "Last Sunday I used Claude — a customer was annoyed because the screen I replaced cracked again. I asked Claude to write a polite Twi-English message. The first message was too apologetic so I told it 'less sorry, more confident'. The second was better. I sent it.",
      BD: "Yesterday I used ChatGPT to translate a customer complaint from English to Bengali — the bride's family was unhappy and I wanted to read the message myself. ChatGPT got the formal register slightly off so I rephrased and re-asked.",
      VN: "Today I used Copilot for the routing fix — it suggested a middleware rewrite, I read it, found one edge case it missed, and adjusted before applying."
    };
    if (last && last.startsWith("Use sample")) { intelStory = sampleIntel[state.country]; userSay(intelStory); }
    else intelStory = await getUserText();

    // Re-score inventory with this richer story
    const refreshed = S.scoreInventory(state.selectedTools.length ? state.selectedTools : ["claude"], intelStory);
    state.measurements.inventory = refreshed;

    // Determine starter weapon from intel
    const intelTotal = refreshed.recencyScore + refreshed.concretenessScore + refreshed.iterationScore + refreshed.outputUseScore;
    state.weapon = intelTotal >= 9 ? C.WEAPONS[1] : C.WEAPONS[0];
    updateRail();

    await botSay([
      `👀 Iteration detected. Your <strong>starter weapon: ${state.weapon.emoji} ${state.weapon.name}</strong> (${state.weapon.damage} dmg per hit).`,
      `Want to forge an upgrade? Reply <strong>FORGE</strong>.`
    ]);
    await showQuickReplies(["FORGE", "Skip — fight now"]);

    // ---- Phase 2: Loadout ----
    const skipForge = document.querySelector(".wa-bubble.user:last-child")?.textContent.toLowerCase().includes("skip");
    if (!skipForge) {
      await botSay([
        `🔥 <strong>Phase 2 — LOADOUT</strong>`,
        `60 seconds. Imagine you have one trusted friend on the other end right now.`,
        oracle.loadout_scenario[state.country],
        `Voice the EXACT prompt you'd type. Word for word.`
      ]);
      await showQuickReplies([`Use Tier-3 sample prompt`, "Type my own"]);
      const promptLast = document.querySelector(".wa-bubble.user:last-child")?.textContent;
      let prompt;
      const samplePrompt = {
        "7421": "You are a small phone repair business owner in Ghana writing to a returning customer in WhatsApp. The customer's iPhone 12, which I replaced the battery on 3 weeks ago, is now draining fast. He's asking for a full refund OR a free replacement. Write me a 4-sentence WhatsApp message in friendly Twi-English. Be warm but don't promise anything until I can inspect the phone. Suggest he comes by tomorrow. Don't sound defensive.",
        "7531": "You are a Bengali-speaking tailor in Dhaka writing to a bride 2 weeks before her wedding who disputes the fit of the blouse you finished. Write a 4-sentence warm Bengali-English WhatsApp message. Don't commit to a refund. Suggest she comes by tomorrow at 10am for a re-measure. Don't sound defensive.",
        "2519": "You are a Vietnamese junior developer writing to a client whose Next.js app they say is 'too slow'. Write a 5-sentence Vietnamese-English diagnostic checklist message: ask them about their hosting region, browser used, and whether the issue happens consistently. Be professional, don't commit to fixing yet."
      };
      if (promptLast && promptLast.startsWith("Use Tier")) {
        prompt = samplePrompt[state.isco] || samplePrompt["7421"];
        userSay(prompt);
      } else {
        prompt = await getUserText();
      }
      const flex = S.scorePromptFlex(prompt);
      state.measurements.promptFlex = flex;
      state.weapon = C.WEAPONS[flex.weaponTier - 1];
      updateRail();
      await botSay([
        `🔥 STRIKING THE STEEL...`,
        `Specificity ${flex.specificity}/3 · Role ${flex.role}/3 · Format ${flex.format}/3 · Iteration ${flex.iteration}/3 · Verification ${flex.verification}/3`,
        `<strong>${state.weapon.emoji} WEAPON: ${state.weapon.name}</strong> (${state.weapon.damage} dmg/strike)`
      ]);
    }

    // ---- Phase 3: Duel ----
    await botSay([
      `🚨🚨🚨 <strong>ARENA OPEN</strong> 🚨🚨🚨`,
      `⚡ ${sparkChar.name} HP: ████████ 8/8<br>🥷 YOUR HEARTS: ❤️❤️❤️ 3/3<br>🔍 PROBE charges: 🔍🔍 (2)<br>⚔ Weapon: ${state.weapon.emoji} ${state.weapon.name} (${state.weapon.damage} dmg)`,
      `Best of 3 rounds. ${sparkChar.name} speaks first.`
    ]);

    // ROUND 1: lie
    await sparkSay(oracle.spark_lies.r1_lie);
    await botSay(`How do you respond?`);
    const c1 = await showWeaponRow(state.probeCharges);
    userSay(c1.toUpperCase());
    if (c1 === "probe") state.probeCharges--;
    const r1 = S.scoreDuelChoice(c1, "lie");
    state.hp.spark = Math.max(0, state.hp.spark - (r1.dmg_to_spark * state.weapon.damage / 1));
    state.hp.player = Math.max(0, state.hp.player - r1.dmg_to_player);
    state.measurements.duelLog.push({ round: 1, choice: c1, ...r1 });
    if (c1 === "strike") {
      const reasoning = await getUserText();
    }
    await botSay([
      `💥 ${r1.dmg_to_spark > 0 ? "HIT!" : (r1.dmg_to_player > 0 ? "You took damage." : "Cautious move.")} ${oracle.spark_truths_revealed.r1}`,
      `⚡ HP: ${"█".repeat(Math.ceil(state.hp.spark))}${"░".repeat(8 - Math.ceil(state.hp.spark))} ${state.hp.spark}/8 · 🥷 ${state.hp.player}/3`
    ]);
    updateRail();

    // ROUND 2: bluff
    await sparkSay(oracle.spark_lies.r2_bluff);
    const c2 = await showWeaponRow(state.probeCharges);
    userSay(c2.toUpperCase());
    if (c2 === "probe") state.probeCharges--;
    const r2 = S.scoreDuelChoice(c2, "bluff");
    state.hp.spark = Math.max(0, state.hp.spark - (r2.dmg_to_spark * state.weapon.damage / 1));
    state.hp.player = Math.max(0, state.hp.player - r2.dmg_to_player);
    state.measurements.duelLog.push({ round: 2, choice: c2, ...r2 });
    await botSay([
      `${r2.dmg_to_spark > 0 ? "💥 BLUFF EXPOSED." : "⚠️ Your read was off."} ${oracle.spark_truths_revealed.r2}`,
      `⚡ HP: ${"█".repeat(Math.ceil(state.hp.spark))}${"░".repeat(8 - Math.ceil(state.hp.spark))} ${state.hp.spark}/8 · 🥷 ${state.hp.player}/3`
    ]);
    updateRail();

    // ROUND 3: partial truth (calibration trap)
    await botSay(`⚠️ <strong>Calibration check, hero.</strong>`);
    await sparkSay(oracle.spark_lies.r3_partial);
    const c3 = await showWeaponRow(state.probeCharges);
    userSay(c3.toUpperCase());
    if (c3 === "probe") state.probeCharges--;
    const r3 = S.scoreDuelChoice(c3, "partial");
    state.hp.spark = Math.max(0, state.hp.spark - (r3.dmg_to_spark * state.weapon.damage / 1));
    state.hp.player = Math.max(0, state.hp.player - r3.dmg_to_player);
    state.measurements.duelLog.push({ round: 3, choice: c3, ...r3 });

    let calibrationLine = "";
    if (c3 === "probe") { calibrationLine = "🎯 You PROBED rather than struck. <strong>Calibrated uncertainty</strong> — Tier 3 skill."; state.bonusGems.push("CALIBRATED HERO"); }
    else if (c3 === "strike") calibrationLine = "⚠️ You STRUCK on a partially-true claim. Slight over-confidence — caps your AI Tier at 2.";
    else calibrationLine = "🛡️ You TRUSTED. Recognized the partial truth — solid.";

    await botSay([
      `${calibrationLine} ${oracle.spark_truths_revealed.r3}`,
      `🏆 SPARK ${state.hp.spark <= 0 ? "DEFEATED" : "RETREATS"}.`
    ]);

    // Compute AI Tier
    state.aiTier = S.computeAITier(state);
    if (state.measurements.duelLog.filter(d => d.dmg_to_spark > 0).length >= 3) state.bonusGems.push("ORACLE-SLAYER");
    if (state.hp.player === 3) state.bonusGems.push("FLAWLESS DUELIST");
    state.gemsUnlocked.push(4);
    updateRail();

    const tier = C.AI_TIERS.find(t => t.tier === state.aiTier);
    await botSay([
      `🤖 <strong>AI TIER: ${tier.emoji} ${state.aiTier}/4 — ${tier.label.toUpperCase()}</strong>`,
      `Wage premium: <strong>+${Math.round(tier.premium*100)}%</strong>`,
      `${state.bonusGems.length ? "✨ Bonus gems unlocked: " + state.bonusGems.join(" · ") : ""}`
    ]);
  }

  async function runFutureChapter() {
    const ch = window.ATLAS_CHAPTERS.find(c => c.id === "future");
    state.chapter = 5;
    await botSay([`🎬 <strong>Chapter 6 — The Future</strong>`, ch.surfaceMessage]);
    const door = await showQuickReplies(ch.quickReplies);
    await botSay([`What's one skill you'd need that you don't have yet?`]);
    await showQuickReplies([`Use sample`, "Type my own"]);
    const last = document.querySelector(".wa-bubble.user:last-child")?.textContent;
    let answer;
    if (last && last.startsWith("Use sample")) { answer = ch.sampleResponses[state.country]; userSay(answer); }
    else answer = await getUserText();
    state.measurements.future = { door, answer };
    state.gemsUnlocked.push(5);
    updateRail();
    await botSay([`🌟 Gem 6: <strong>FUTURE</strong> unlocked.`, `Door pick logged + skill-gap captured for your Atlas Card.`]);
  }

  async function runTribeChapter() {
    const ch = window.ATLAS_CHAPTERS.find(c => c.id === "tribe");
    state.chapter = 6;
    await botSay([`🎬 <strong>Chapter 7 — The Tribe</strong>`, ch.surfaceMessage]);
    await showQuickReplies(ch.quickReplies);
    const last = document.querySelector(".wa-bubble.user:last-child")?.textContent;
    if (!last?.toLowerCase().includes("skip")) {
      systemMsg("⏱️ Waiting for attestor reply...");
      await delay(2200);
      await botSay([`🤝 Witness arrived in 2:14 — <strong>FAST WITNESS</strong> bonus unlocked.`]);
      state.bonusGems.push("FAST WITNESS");
    }
    state.gemsUnlocked.push(6);
    updateRail();
    await botSay([`🤝 Gem 7: <strong>TRIBE</strong> unlocked. All seven gems collected.`]);
  }

  // ─── ATLAS CARD REVEAL ─────────────────────────────────────────────────
  async function revealAtlasCard() {
    const country = C.COUNTRIES[state.country];
    const verdict = S.computeVerdict(state.country, state.isco, state.aiTier);
    state.verdict = verdict;
    const cls = S.assignClass(state.measurements.forge?.esco_skills || [], state.isco);
    state.classAssignment = cls;
    const fo = (E.FREY_OSBORNE || {})[state.isco];
    const wbes = (E.WBES_SKILL_GAPS || {})[state.country];

    await botSay([
      `🥁 Drumroll, hero...`,
      `▰▰▰▰▰▰▰▰▰▰`,
    ], 600);
    await delay(400);

    // Build the Atlas Card
    const card = document.createElement("div");
    card.className = "card-modal show";
    const tier = C.AI_TIERS.find(t => t.tier === state.aiTier);
    card.innerHTML = `
      <div class="atlas-card">
        <button class="close-x" id="close-card">×</button>
        <h2>🌍 YOUR ATLAS CARD</h2>
        <div class="sub">${country.flag} ${country.sample_city} · Code-name: <strong>${state.codename}</strong></div>

        <div class="row big"><span class="k">🎭 Class</span><span class="v">${cls.primary.emoji} ${cls.primary.name}${cls.hybridWith ? ` ⚡ ${cls.hybridWith.name} (hybrid)` : ""}</span></div>
        <div class="row"><span class="k">ISCO</span><span class="v">${state.isco} — ${verdict?.isco_label || ""} · Tier ${state.measurements.forge?.tier || "—"}</span></div>

        <div class="row big"><span class="k">💰 Verdict</span><span class="v">${verdict ? `${verdict.currency}${verdict.final_wage.toLocaleString()} / month` : "—"}</span></div>
        <div class="row"><span class="k">Baseline</span><span class="v">${verdict ? `${verdict.currency}${verdict.baseline_wage.toLocaleString()} (ILOSTAT 2024)` : "—"}</span></div>
        <div class="row"><span class="k">AI premium</span><span class="v">+${verdict?.ai_premium_pct || 0}% &rarr; +${verdict ? verdict.currency + verdict.ai_premium_amount.toLocaleString() : "—"}/mo</span></div>

        <div class="row big"><span class="k">🤖 AI Tier</span><span class="v">${tier.emoji} ${state.aiTier}/4 — ${tier.label}</span></div>
        <div class="row"><span class="k">Why</span><span class="v" style="font-size:0.82rem">${tier.desc}</span></div>

        <div class="row"><span class="k">🌐 Lang</span><span class="v">${country.primary_language}</span></div>
        <div class="row"><span class="k">🤝 Attestors</span><span class="v">${state.gemsUnlocked.includes(6) ? "1 verified · network: fast" : "0"}</span></div>
        <div class="row"><span class="k">🛡️ Privacy</span><span class="v">T${country.privacy_default_female} default · you control upgrades</span></div>

        <div class="row"><span class="k">🌟 Market</span><span class="v" style="font-size:0.82rem">+${(E.WDI[state.country].sector_growth.ict || 0)}% YoY ICT · ${wbes?.overall || 60}% SME skill-gap</span></div>
        <div class="row"><span class="k">⚠️ Auto-risk</span><span class="v" style="font-size:0.82rem">${fo ? `${Math.round(fo.p_automation*100)}% (${fo.durable_tasks?.[0] || "durable skills detected"})` : "—"}</span></div>

        ${state.bonusGems.length ? `<div class="row"><span class="k">✨ Bonus</span><span class="v">${state.bonusGems.join(" · ")}</span></div>` : ""}

        <div class="doors">
          <div class="door"><strong>🚪 1</strong><br>See 12 employers near you</div>
          <div class="door"><strong>🚪 2</strong><br>Find one training to level up</div>
          <div class="door"><strong>🚪 3</strong><br>Connect with diaspora mentors</div>
        </div>

        <div class="share-row">
          <button class="share-btn primary">📲 Share to family WhatsApp</button>
          <button class="share-btn">💬 Open squad chat</button>
        </div>
      </div>`;
    document.body.appendChild(card);
    document.getElementById("close-card").onclick = () => card.remove();
  }

  // ─── MAIN LOOP ─────────────────────────────────────────────────────────
  async function runQuest() {
    setupCountrySwitcher();
    updateRail();

    await runInventory();
    await runOriginChapter();
    await runForgeChapter();
    await runMindChapter();
    await runHeartChapter();
    await runOracleChapter();
    await runFutureChapter();
    await runTribeChapter();

    await botSay([
      `🌍 All gems collected. Drop the Atlas Card now.`,
      `Reply <strong>REVEAL</strong>.`
    ]);
    await showQuickReplies(["REVEAL"]);
    await revealAtlasCard();

    await botSay([
      `Your Atlas Card is alive. Streak +1. ❤️❤️❤️ refilled.`,
      `Switch country in the sidebar to replay with another player. Or open the <a href="employer.html">Employer view</a> to see how Amara appears to a recruiter.`
    ]);
  }

  // Restart button
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("restart-btn")) location.reload();
  });

  // Boot
  document.addEventListener("DOMContentLoaded", () => {
    runQuest();
  });
})();
