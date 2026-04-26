// Atlas — ESCO skill subset for offline demo
// In production, hits ESCO public REST API at ec.europa.eu/esco/api
// Each ISCO occupation has core ESCO skill codes attached.

const ESCO_CATALOG = {
  "7421": { // Electronic Equipment Mechanic
    label: "Electronic Equipment Mechanic",
    skills: [
      { code: "S1.5",   label: "diagnose electronic faults",   tier: "core" },
      { code: "S5.6.1", label: "solder electronics",            tier: "core" },
      { code: "S5.6.4", label: "use isopropyl alcohol cleaning",tier: "advanced" },
      { code: "S5.6.5", label: "reflow soldering",              tier: "advanced" },
      { code: "S6.4.2", label: "customer dispute resolution",   tier: "transversal" },
      { code: "S2.1.1", label: "Python programming",            tier: "adjacent" }
    ]
  },
  "7531": { // Tailor
    label: "Tailor / Dressmaker",
    skills: [
      { code: "S5.7.1", label: "operate sewing machine",        tier: "core" },
      { code: "S5.7.2", label: "hand embroidery",               tier: "advanced" },
      { code: "S5.7.3", label: "pattern cutting",               tier: "core" },
      { code: "S5.7.4", label: "fabric selection",              tier: "core" },
      { code: "S6.4.2", label: "customer dispute resolution",   tier: "transversal" },
      { code: "S2.5.1", label: "small-business pricing",        tier: "transversal" }
    ]
  },
  "5223": { // Shop Sales Assistant
    label: "Shop Sales Assistant",
    skills: [
      { code: "S6.1.1", label: "customer service",              tier: "core" },
      { code: "S6.1.2", label: "upselling",                     tier: "advanced" },
      { code: "S6.4.2", label: "dispute resolution",            tier: "transversal" },
      { code: "S2.5.2", label: "inventory tracking",            tier: "core" }
    ]
  },
  "2519": { // Software Developer (junior)
    label: "Software Developer",
    skills: [
      { code: "S2.1.1", label: "Python programming",            tier: "core" },
      { code: "S2.1.4", label: "JavaScript / TypeScript",       tier: "core" },
      { code: "S2.1.7", label: "React / Next.js",               tier: "advanced" },
      { code: "S2.1.9", label: "debugging routing issues",      tier: "advanced" },
      { code: "S2.1.12",label: "AI-assisted development",       tier: "modern" },
      { code: "S6.4.2", label: "client communication",          tier: "transversal" }
    ]
  },
  "5311": { // Childcare Worker
    label: "Childcare Worker",
    skills: [
      { code: "S6.7.1", label: "child supervision",             tier: "core" },
      { code: "S6.7.2", label: "infant safe-sleep",             tier: "core" },
      { code: "S6.7.3", label: "early learning activities",     tier: "advanced" },
      { code: "S6.4.2", label: "parent communication",          tier: "transversal" },
      { code: "S6.6.1", label: "emergency first aid",           tier: "advanced" }
    ]
  }
};

window.ESCO_CATALOG = ESCO_CATALOG;
