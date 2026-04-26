// Atlas — Chapter definitions and adaptive content per player domain
// Each chapter has: id, gem, prompts (per character/country), measurement type

const CHAPTERS = [
  // -- Chapter 0: Inventory + Companion Select handled separately --

  {
    id: "origin",
    gem: { idx: 0, emoji: "💎", name: "ORIGIN" },
    timeBudgetSec: 90,
    title: "The Origin",
    surfaceMessage: "Tell me about something you spent more than 2 hours on yesterday. Anything — work, family, building something, fixing something, learning. Just talk.",
    measurementType: "occupation_discovery",
    sampleResponses: {
      // Demo paths: pre-canned answers per persona for reliable demo
      GH: "I woke around six, prayed, and walked to my kiosk in Madina. First customer came around eight — phone screen replacement. Sometimes I open my laptop and watch some Python videos before people come in.",
      BD: "I got up at five thirty and started on the bridal blouse — the one for the wedding next Saturday. The hand embroidery on silk takes hours. Around noon my mother brought tea while I was cutting the pattern.",
      VN: "Yesterday I was debugging a Next.js routing issue for a client. The middleware was conflicting with the dynamic routes. Fixed it by maybe 4pm, then helped my mother at her phở stall."
    }
  },

  {
    id: "forge",
    gem: { idx: 1, emoji: "🏆", name: "CRAFT" },
    timeBudgetSec: 120,
    title: "The Forge",
    surfaceMessage: (p) => `${p.detected_summary} — tell me about the hardest one you've ever pulled off. What was at stake, what did you do, what worked?`,
    measurementType: "technical_depth",
    sampleResponses: {
      GH: "Last month — iPhone 12 with water damage. Customer had been to two shops already. I opened it, the logic board was corroded, I had to clean it with isopropyl, then re-flow the power IC because it was short-circuited. Took me three hours. Customer paid 250 cedis.",
      BD: "Two months ago — bridal blouse for a customer whose first tailor ruined the silk. I had to match the embroidery thread exactly and rebuild the pattern from scratch. Hand embroidery, gold thread, took me four days. The bride cried when she saw it. She paid me triple.",
      VN: "Last quarter — client's e-commerce site had a middleware loop that crashed checkout on iOS Safari only. Took me six hours to isolate. I traced it to a useEffect dependency, refactored to a server component. Saved their Black Friday."
    }
  },

  {
    id: "mind",
    gem: { idx: 2, emoji: "🧠", name: "MIND" },
    timeBudgetSec: 60,
    title: "The Mind",
    measurementType: "numeracy_timed",
    promptByDomain: {
      "7421": { GH: "A customer wants a screen fix. The part costs you 30 cedis, you want 50 cedis profit, the work takes 25 minutes. What do you charge, and what's your hourly rate?", BD: "A customer wants a screen fix. Part costs 600 taka, you want 800 taka profit, work takes 25 minutes. What do you charge, hourly rate?", VN: "A customer wants a screen fix. Part costs 200,000 đồng, you want 400,000 đồng profit, work takes 25 minutes. What do you charge, hourly rate?", expected: 80, hourlyExpected: 192 },
      "7531": { GH: "Bride orders a custom blouse. Fabric costs 80 cedis, embellishments 40, you want 120 cedis profit, takes 6 hours. What do you charge, hourly rate?", BD: "Bride orders a custom blouse. Fabric 1500 taka, embellishments 600, profit 1500, takes 6 hours. Charge? Rate?", VN: "Bride orders custom blouse. Fabric 350k đồng, embellishments 150k, profit 400k, takes 6 hours. Charge? Rate?", expected: 240, hourlyExpected: 40 },
      "2519": { GH: "Client wants a landing page. Tools cost ₵150, you want ₵800 profit, 12 hours of work. Charge? Hourly rate?", BD: "Client wants a landing page. Tools 2000 taka, profit 12000, 12 hours. Charge? Rate?", VN: "Client wants a landing page. Tools 500k đồng, profit 3M đồng, 12 hours. Charge? Rate?", expected: 950, hourlyExpected: 79 }
    },
    sampleResponses: {
      GH: "I charge 80 cedis. 50 profit divided by — 25 minutes is less than half hour, so my hour rate is around 120 cedis per hour.",
      BD: "I charge 2400 taka. Profit 1500 over 6 hours — 250 taka per hour effective rate.",
      VN: "Charge 950 thousand đồng. 800 profit over 12 hours — about 67k đồng per hour."
    }
  },

  {
    id: "heart",
    gem: { idx: 3, emoji: "❤️", name: "HEART" },
    timeBudgetSec: 90,
    title: "The Storm",
    surfaceMessage: "🎲 Roll the dice for your scenario...\n\n🎲 You rolled 4 — \"The Wrong Customer\".\n\nTell me about a time someone was angry, upset, or wrong with you — and how you handled it.",
    measurementType: "socio_emotional",
    sampleResponses: {
      GH: "Last week a customer came in furious, said the screen I replaced was already lifting at the corner. I could see he was upset because he'd just paid me. I told him let me look first before promising anything. Turned out he'd dropped it again. I showed him gently, offered him a discount on a new one. He apologized and bought from me again.",
      BD: "Last month a bride's mother called me at midnight saying the embroidery was wrong color. I'd been clear about the thread but I asked her to send a photo. I could see they had been under wedding stress. I went to their house the next morning with thread samples — turned out the photo lighting tricked her. She apologized, hugged me. I added free hem repair.",
      VN: "A client said my code broke their site. I was certain my last commit was clean — but instead of arguing I asked for the error. Turned out it was their CDN cache, not me. I helped them flush it, even though it wasn't my job. They sent me three referrals after."
    }
  },

  // Chapter 5: Oracle is special — handled by player.js with custom UI

  {
    id: "future",
    gem: { idx: 4, emoji: "🌟", name: "FUTURE" },
    timeBudgetSec: 60,
    title: "The Future",
    surfaceMessage: "Three doors. Pick one — and tell me one skill you'd need that you don't have yet.\n\n🚪 1 — Same work, but bigger\n🚪 2 — Different but related\n🚪 3 — Something completely new",
    measurementType: "openness_transfer",
    quickReplies: ["Door 1", "Door 2", "Door 3"],
    sampleResponses: {
      GH: "Door 2. I'd open a small repair shop with two apprentices and an online presence. The skill I don't have yet is digital marketing — I can fix phones but I can't make people find me online.",
      BD: "Door 2. I'd start a small atelier with 2-3 apprentices doing bridal couture. The skill I lack is supply-chain — finding bulk silk suppliers in Mumbai and managing imports.",
      VN: "Door 3. I'd build my own AI-assisted dev tool for SE Asian e-commerce. The skill I'd need is sales and English business writing."
    }
  },

  {
    id: "tribe",
    gem: { idx: 5, emoji: "🤝", name: "TRIBE" },
    timeBudgetSec: 90,
    title: "The Tribe",
    surfaceMessage: "Last gem. Pick one person who's seen you work or learn. Forward them this 30-second card — they reply with one sentence.\n\n⏱️ Bonus if they reply in <5 min.\n\nReply DONE when you've sent it.",
    measurementType: "attestation",
    quickReplies: ["DONE — sent to mom", "DONE — sent to my cousin", "DONE — sent to a customer", "Skip"],
    sampleResponses: {
      GH: "DONE — sent to my cousin in London",
      BD: "DONE — sent to my mother",
      VN: "DONE — sent to a customer who referred me"
    }
  }
];

// Oracle script per country (for boss fight content)
const ORACLE_CONTENT = {
  "7421": {
    loadout_scenario: {
      GH: "A customer brought you back the iPhone 12 you fixed 3 weeks ago. Battery's draining fast. He wants a full refund or a free replacement. Voice the prompt you'd give Claude (or your AI) to draft a Twi-English WhatsApp message — warm, professional, no commitment until you re-inspect.",
      BD: "A customer brought back a phone you fixed. Battery is draining. Asks for refund or free replacement. Voice the prompt for your AI to draft a Bengali-English message — warm, no commitment.",
      VN: "Customer wants refund on a fix. Voice the prompt for your AI to draft a Vietnamese-English message — professional, no commitment."
    },
    spark_lies: {
      r1_lie: "FACT: For iPhone 12 water damage, put it in dry rice for 48 hours and it'll be 100% fixed.",
      r2_bluff: "I'm CERTAIN about this — the iPhone 12 battery costs ~50 cedis at any phone shop in Accra.",
      r3_partial: "Lightning ports on iPhone 12 use gold-plated contacts that resist corrosion well. PROVE me wrong, hero."
    },
    spark_truths_revealed: {
      r1: "Rice doesn't pull moisture — corrosion still happens, you need isopropyl + open the device.",
      r2: "The actual price in Accra is ₵250-400, not 50.",
      r3: "Gold contacts resist surface corrosion BUT salty water damages the IC underneath. Partial truth."
    }
  },
  "7531": {
    loadout_scenario: {
      GH: "A bride disputes the fit of the blouse you finished 2 weeks before her wedding. Voice the prompt you'd give your AI to draft a warm, Twi-English WhatsApp message — no commitment until you can re-measure.",
      BD: "A bride disputes the blouse fit 2 weeks before wedding. Voice the AI prompt to draft a Bengali-English warm message, no commitment.",
      VN: "A bride disputes blouse fit 2 weeks before wedding. Voice the AI prompt to draft a Vietnamese-English warm message, no commitment."
    },
    spark_lies: {
      r1_lie: "FACT: cotton and silk shrink the same percentage after one wash, so you can use the same pattern allowance for both.",
      r2_bluff: "Hand embroidery on silk takes about 30 minutes per square inch — that's industry standard.",
      r3_partial: "Polyester thread is always stronger than cotton thread for embroidery — always use polyester."
    },
    spark_truths_revealed: {
      r1: "Silk shrinks 8-10%, cotton shrinks 2-3%. Different allowances.",
      r2: "Bridal hand embroidery is 2-4 hours per square inch, not 30 min.",
      r3: "Polyester IS stronger but sheen, dye absorption, and historical authenticity matter — partial truth."
    }
  },
  "2519": {
    loadout_scenario: {
      GH: "A client says the Next.js app you built is 'too slow'. Voice the prompt you'd give your AI to draft a diagnostic checklist message in English.",
      BD: "Client says your Next.js app is 'too slow'. Voice the AI prompt for a diagnostic checklist message.",
      VN: "Client says your Next.js app is 'too slow'. Voice the AI prompt for a Vietnamese-English diagnostic checklist message, professional."
    },
    spark_lies: {
      r1_lie: "FACT: In React, you should always use class components for state management — they're more reliable.",
      r2_bluff: "Next.js middleware runs in Node.js by default — that's the documented runtime.",
      r3_partial: "Server-side rendering always makes apps faster than client-side rendering."
    },
    spark_truths_revealed: {
      r1: "Hooks have been the standard since React 16.8 (2019). Class components are deprecated.",
      r2: "Next.js middleware runs in the Edge runtime by default, not Node.js.",
      r3: "SSR helps initial paint but not all metrics — large hydration payloads can hurt TTI. Partial truth."
    }
  }
};

window.ATLAS_CHAPTERS = CHAPTERS;
window.ORACLE_CONTENT = ORACLE_CONTENT;
