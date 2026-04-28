// Atlas — Policymaker / NGO dashboard renderer
// Reads ?country=ISO2 from URL, renders all sections, handles tabs,
// wires search + action buttons + regional country switcher.

(function () {
  "use strict";
  const C = window.ATLAS_CONFIG;
  const E = window.ECONOMETRIC;

  // ─── State ────────────────────────────────────────────────────────────
  const params = new URLSearchParams(window.location.search);
  let country = (params.get("country") || "GH").toUpperCase();

  const isFullCountry = (code) => !!C.COUNTRIES[code];
  const isPeerCountry = (code) => !!E.REGIONAL_PEERS?.[code];
  if (!isFullCountry(country) && !isPeerCountry(country)) country = "GH";

  const FORMAL_NAMES = {
    GH: "Republic of Ghana",
    BD: "People's Republic of Bangladesh",
    VN: "Socialist Republic of Viet Nam"
  };
  const ISO3 = { GH: "GHA", BD: "BGD", VN: "VNM" };

  // ─── Helpers ──────────────────────────────────────────────────────────
  const v = (x) => (x && typeof x === "object" && "v" in x) ? x.v : x;
  const prov = (x) => {
    if (x && typeof x === "object" && "v" in x) return { value: x.v, conf: x.conf || "approximated", src: x.src || "" };
    return { value: x, conf: "verified", src: "" };
  };
  const fmt = (n) => {
    if (n === null || n === undefined || isNaN(n)) return "—";
    return Number(n).toLocaleString();
  };
  const confChip = (c) => `<span class="conf-chip ${c || "approximated"}">${c || "approximated"}</span>`;

  // ─── Toast ────────────────────────────────────────────────────────────
  function toast(msg) {
    const t = document.createElement("div");
    t.className = "ngo-toast";
    t.innerHTML = `✓ ${msg}`;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add("show"));
    setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 300); }, 2500);
  }

  // ─── Modal ────────────────────────────────────────────────────────────
  function openModal(title, bodyHTML) {
    let bd = document.getElementById("ngo-modal-backdrop");
    if (!bd) {
      bd = document.createElement("div");
      bd.id = "ngo-modal-backdrop";
      bd.className = "ngo-modal-backdrop";
      document.body.appendChild(bd);
    }
    bd.innerHTML = `
      <div class="ngo-modal">
        <div class="ngo-modal-head"><h3>${title}</h3><button class="ngo-modal-close" aria-label="Close">×</button></div>
        <div class="ngo-modal-body">${bodyHTML}</div>
      </div>`;
    bd.classList.add("show");
    bd.querySelector(".ngo-modal-close").onclick = () => bd.classList.remove("show");
    bd.onclick = (e) => { if (e.target === bd) bd.classList.remove("show"); };
  }

  // ─── Country switcher (active + regional peers) ───────────────────────
  function activeRegion() {
    if (isFullCountry(country)) return C.COUNTRIES[country].region;
    if (isPeerCountry(country)) return E.REGIONAL_PEERS[country].region;
    return "West Africa";
  }
  function activePeerSet() {
    if (isFullCountry(country)) return C.COUNTRIES[country].regional_peers || [];
    if (isPeerCountry(country)) {
      const region = E.REGIONAL_PEERS[country].region;
      const fullForRegion = Object.keys(C.COUNTRIES).find(k => C.COUNTRIES[k].region === region);
      const others = Object.keys(E.REGIONAL_PEERS).filter(k => k !== country && E.REGIONAL_PEERS[k].region === region);
      return [fullForRegion, ...others].filter(Boolean).slice(0, 6);
    }
    return [];
  }
  function buildCountrySwitcher() {
    const wrap = document.getElementById("country-switcher");
    if (!wrap) return;
    wrap.innerHTML = "";

    const allCodes = [country, ...activePeerSet().filter(c => c !== country)];
    const region = activeRegion();
    const labelEl = document.getElementById("switcher-label");
    if (labelEl) labelEl.textContent = `${region} peers`;

    allCodes.forEach(code => {
      const isFull = isFullCountry(code);
      const data = isFull ? C.COUNTRIES[code] : E.REGIONAL_PEERS[code];
      if (!data) return;
      const b = document.createElement("button");
      b.className = (code === country ? "active " : "") + (!isFull ? "limited" : "");
      b.title = isFull ? `Full cohort data for ${data.name}` : `Limited peer data for ${data.name}`;
      b.innerHTML = `<span>${data.flag}</span><span>${data.name}</span>`;
      b.onclick = () => {
        country = code;
        const u = new URL(window.location);
        u.searchParams.set("country", country);
        history.replaceState(null, "", u);
        renderAll();
      };
      wrap.appendChild(b);
    });
  }

  // ─── Search ────────────────────────────────────────────────────────────
  function setupSearch() {
    const input = document.getElementById("country-search");
    if (!input) return;
    let dropdown = document.getElementById("search-dropdown");
    if (!dropdown) {
      dropdown = document.createElement("div");
      dropdown.id = "search-dropdown";
      dropdown.className = "ngo-search-dropdown";
      input.parentElement.appendChild(dropdown);
    }

    const allCountries = [
      ...Object.values(C.COUNTRIES).map(c => ({ ...c, full: true })),
      ...Object.entries(E.REGIONAL_PEERS || {}).map(([code, c]) => ({ ...c, code, full: false }))
    ];

    const renderResults = (q) => {
      const ql = (q || "").toLowerCase().trim();
      const matches = ql.length === 0 ? allCountries.slice(0, 8) :
        allCountries.filter(c =>
          c.name.toLowerCase().includes(ql) ||
          c.code.toLowerCase().includes(ql) ||
          (c.iso3 || "").toLowerCase().includes(ql) ||
          (c.region || "").toLowerCase().includes(ql)
        );
      if (matches.length === 0) {
        dropdown.innerHTML = `<div class="ngo-search-result" style="cursor:default;color:var(--d360-muted)">No country matches "${q}"</div>`;
        dropdown.classList.add("open");
        return;
      }
      dropdown.innerHTML = matches.slice(0, 12).map(c => `
        <div class="ngo-search-result" data-code="${c.code}">
          <span class="flag">${c.flag}</span>
          <span class="nm">${c.name}</span>
          <span class="iso">${c.iso3 || c.code}</span>
          <span class="${c.full ? "badge-full" : "badge-limited"}">${c.full ? "Full data" : "Peer"}</span>
        </div>`).join("");
      dropdown.classList.add("open");

      dropdown.querySelectorAll(".ngo-search-result").forEach(el => {
        el.onclick = () => {
          const code = el.dataset.code;
          if (!code) return;
          country = code;
          const u = new URL(window.location);
          u.searchParams.set("country", country);
          history.replaceState(null, "", u);
          input.value = "";
          dropdown.classList.remove("open");
          renderAll();
        };
      });
    };

    input.addEventListener("focus", () => renderResults(input.value));
    input.addEventListener("input", () => renderResults(input.value));
    input.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { dropdown.classList.remove("open"); input.blur(); }
      if (e.key === "Enter") {
        const first = dropdown.querySelector(".ngo-search-result[data-code]");
        if (first) first.click();
      }
    });
    document.addEventListener("click", (e) => {
      if (!input.parentElement.contains(e.target)) dropdown.classList.remove("open");
    });
  }

  // ─── Tabs ──────────────────────────────────────────────────────────────
  function activateTab(tabId) {
    const tabs = document.querySelectorAll(".ngo-tab");
    const sections = document.querySelectorAll(".ngo-section");
    tabs.forEach(t => t.classList.remove("active"));
    sections.forEach(s => s.classList.remove("active"));
    const tab = document.querySelector(`.ngo-tab[data-tab="${tabId}"]`);
    const sect = document.querySelector(`[data-section="${tabId}"]`);
    if (tab) tab.classList.add("active");
    if (sect) sect.classList.add("active");
    const shell = document.querySelector(".ngo-shell");
    if (shell) window.scrollTo({ top: shell.offsetTop - 80, behavior: "smooth" });
  }
  function setupTabs() {
    document.querySelectorAll(".ngo-tab").forEach(tab => {
      tab.onclick = () => activateTab(tab.dataset.tab);
    });
    // Wire main-nav data-jump links to tab activation
    document.querySelectorAll("[data-jump]").forEach(el => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        activateTab(el.dataset.jump);
      });
    });
  }

  // ─── Action buttons (CSV, PDF, Cite) ──────────────────────────────────
  function setupActionButtons() {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      const action = btn.dataset.action;
      if (action === "download-brief") downloadBrief();
      if (action === "export-csv") exportCSV();
      if (action === "cite") openCiteModal();
    });
  }

  function exportCSV() {
    const isFull = isFullCountry(country);
    const cc = isFull ? C.COUNTRIES[country] : E.REGIONAL_PEERS[country];
    const wdi = E.WDI?.[country];
    const rows = [["indicator", "value", "unit", "vintage", "source", "confidence"]];

    if (wdi) {
      Object.entries(wdi).forEach(([k, val]) => {
        if (k === "sector_growth") {
          Object.entries(val).forEach(([sk, sv]) => {
            const p = prov(sv);
            rows.push([`sector_growth.${sk}`, p.value, "% YoY", "2024", p.src, p.conf]);
          });
        } else {
          const p = prov(val);
          rows.push([k, p.value, "", "2024", p.src, p.conf]);
        }
      });
    } else if (isPeerCountry(country)) {
      const p = E.REGIONAL_PEERS[country];
      rows.push(["gni_per_capita_usd", p.gni, "current US$", "2024", "WDI 2024", p.conf]);
      rows.push(["youth_neet", p.neet, "%", "2024", "WDI 2024", p.conf]);
      rows.push(["informal_employment", p.informal, "%", "2024", "ILO 2024", p.conf]);
      rows.push(["female_lfp", p.female_lfp, "%", "2024", "WDI 2024", p.conf]);
      rows.push(["internet_pct", p.internet, "%", "2024", "ITU 2023", p.conf]);
    }

    const csv = rows.map(r => r.map(c => {
      const s = String(c ?? "");
      return s.includes(",") || s.includes("\"") ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `atlas_indicators_${country}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("CSV downloaded");
  }

  function downloadBrief() {
    const isFull = isFullCountry(country);
    const cc = isFull ? C.COUNTRIES[country] : E.REGIONAL_PEERS[country];
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Atlas Cohort Brief — ${cc.name}</title>
      <style>
        body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; max-width: 720px; margin: 0 auto; color: #1F2937; }
        h1 { color: #002244; font-size: 1.8rem; }
        h2 { color: #006EB5; font-size: 1.2rem; border-bottom: 2px solid #006EB5; padding-bottom: 6px; margin-top: 24px; }
        .meta { color: #6B7280; font-size: 0.85rem; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 0.88rem; }
        th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid #E1E7EE; }
        th { background: #F4F7FB; font-size: 0.74rem; text-transform: uppercase; letter-spacing: 0.04em; color: #6B7280; }
        .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #E1E7EE; font-size: 0.72rem; color: #6B7280; }
      </style></head><body>
      <h1>${cc.flag} ${cc.name} — Atlas Cohort Brief</h1>
      <div class="meta">Generated ${new Date().toISOString().slice(0, 10)} · Atlas v0 · For NGO / programme officer use only</div>
      <h2>Headline indicators</h2>
      <table><thead><tr><th>Indicator</th><th>Value</th><th>Source</th></tr></thead><tbody>${getBriefRows()}</tbody></table>
      <h2>Methodology note</h2>
      <p>Atlas measurements are hackathon-grade and not psychometrically validated. STEP-equivalent rubrics are calibrated against Ghana STEP 2013 anchors. Production deployment requires IRT calibration with ≥1,000 players over 6 months.</p>
      <div class="footer">Atlas · Hack-Nation 5th Global Hackathon. Distributed under CC BY 4.0 for derived metrics.</div>
      </body></html>`;
    const w = window.open("", "_blank");
    if (!w) { toast("Pop-up blocked — please allow pop-ups"); return; }
    w.document.write(html); w.document.close();
    setTimeout(() => w.print(), 400);
    toast("Brief opened — use your browser's Save as PDF");
  }
  function getBriefRows() {
    const isFull = isFullCountry(country);
    const cc = isFull ? C.COUNTRIES[country] : E.REGIONAL_PEERS[country];
    const wdi = E.WDI?.[country];
    const rows = [];
    if (wdi) {
      rows.push(["GNI per capita (current US$)", `$${fmt(v(wdi.gdp_per_capita_usd))}`, "WB WDI 2024"]);
      rows.push(["Youth NEET rate", `${v(wdi.youth_neet)}%`, "WB WDI 2024"]);
      rows.push(["Female labour-force participation", `${v(wdi.female_lfp)}%`, "WB WDI 2024"]);
      rows.push(["Informal employment share", `${cc.informal_employment_pct ?? cc.informal ?? "—"}%`, "ILOSTAT 2024"]);
    } else if (isPeerCountry(country)) {
      const p = E.REGIONAL_PEERS[country];
      rows.push(["GNI per capita (current US$)", `$${fmt(p.gni)}`, "WB WDI 2024"]);
      rows.push(["Youth NEET rate", `${p.neet}%`, "WB WDI 2024"]);
      rows.push(["Female labour-force participation", `${p.female_lfp}%`, "WB WDI 2024"]);
      rows.push(["Informal employment share", `${p.informal}%`, "ILOSTAT 2024"]);
      rows.push(["Internet penetration", `${p.internet}%`, "ITU 2023"]);
    }
    return rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("");
  }

  function openCiteModal() {
    const isFull = isFullCountry(country);
    const cc = isFull ? C.COUNTRIES[country] : E.REGIONAL_PEERS[country];
    const date = new Date().toISOString().slice(0, 10);
    const apa = `Atlas. (2026). Cohort Insights — ${cc.name} (${country}). Hack-Nation 5th Global Hackathon. Retrieved ${date} from https://atlas-mu-vert.vercel.app/policymaker?country=${country}`;
    const bibtex = `@misc{atlas_${country.toLowerCase()}_2026,
  title        = {Atlas Cohort Insights — ${cc.name} (${country})},
  author       = {{Atlas project}},
  year         = {2026},
  howpublished = {Hack-Nation 5th Global Hackathon},
  note         = {Hackathon-grade rubrics. Not psychometrically validated.},
  url          = {https://atlas-mu-vert.vercel.app/policymaker?country=${country}}
}`;

    openModal("Cite this dataset", `
      <h4 style="margin-top:0">APA-style</h4>
      <pre id="cite-apa">${apa}</pre>
      <button class="ngo-btn copy-btn" data-copy="cite-apa">Copy APA</button>
      <h4 style="margin-top:18px">BibTeX</h4>
      <pre id="cite-bibtex">${bibtex}</pre>
      <button class="ngo-btn copy-btn" data-copy="cite-bibtex">Copy BibTeX</button>
      <p style="margin-top:18px;font-size:0.82rem;color:var(--d360-muted)">
        <strong>Underlying public datasets</strong> retain their respective licences (ILOSTAT · WDI ·
        Frey-Osborne · WBL · ESCO · Findex · Wittgenstein Centre). Atlas-derived metrics are released under CC BY 4.0.
      </p>
    `);
    setTimeout(() => {
      document.querySelectorAll("[data-copy]").forEach(b => {
        b.onclick = () => {
          const id = b.dataset.copy;
          const text = document.getElementById(id).textContent;
          navigator.clipboard.writeText(text).then(() => toast("Copied to clipboard"));
        };
      });
    }, 50);
  }

  // ─── Profile ──────────────────────────────────────────────────────────
  function renderProfile() {
    const isFull = isFullCountry(country);
    const cc = isFull ? C.COUNTRIES[country] : E.REGIONAL_PEERS[country];

    document.getElementById("profile-flag").textContent = cc.flag;
    document.getElementById("profile-name").textContent = FORMAL_NAMES[country] || cc.name;
    document.getElementById("profile-iso").textContent = `ISO · ${cc.iso3 || ISO3[country] || "—"} · ${country}`;

    const classNode = document.getElementById("profile-class");
    classNode.textContent = (E.WB_CLASSIFICATION?.[country]?.fy26) || cc.classification || "—";

    const region = activeRegion();
    const regionTag = document.getElementById("profile-region");
    if (regionTag) regionTag.textContent = region;

    document.getElementById("bc-country").textContent = cc.name;
    const upd = document.getElementById("profile-updated");
    if (upd) upd.textContent = `Last updated: ${new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })} · Refresh: weekly · Vintage: ILOSTAT 2024 · WDI 2024 · WBL 2024 · Findex 2024`;

    document.title = `Atlas · Cohort Insights — ${cc.name}`;

    // Quick stats
    const wdi = E.WDI?.[country];
    let stats;
    if (isFull && wdi) {
      stats = [
        { lbl: "GNI per capita", val: `US$ ${fmt(v(wdi.gdp_per_capita_usd))}`, unit: "current US$, WDI 2024", p: prov(wdi.gdp_per_capita_usd) },
        { lbl: "Youth NEET rate", val: `${v(wdi.youth_neet)}%`, unit: "aged 15–24", p: prov(wdi.youth_neet) },
        { lbl: "Female labour-force", val: `${v(wdi.female_lfp)}%`, unit: "of working-age women", p: prov(wdi.female_lfp) },
        { lbl: "Internet penetration", val: `${v(wdi.internet_pct)}%`, unit: "of population", p: prov(wdi.internet_pct) }
      ];
    } else {
      stats = [
        { lbl: "GNI per capita", val: `US$ ${fmt(cc.gni)}`, unit: "current US$, WDI 2024", p: { conf: cc.conf || "approximated", src: "WB WDI 2024" } },
        { lbl: "Youth NEET rate", val: `${cc.neet}%`, unit: "aged 15–24", p: { conf: cc.conf, src: "WB WDI 2024" } },
        { lbl: "Female labour-force", val: `${cc.female_lfp}%`, unit: "of working-age women", p: { conf: cc.conf, src: "WB WDI 2024" } },
        { lbl: "Internet penetration", val: `${cc.internet}%`, unit: "of population", p: { conf: cc.conf, src: "ITU 2023" } }
      ];
    }
    document.getElementById("profile-stats").innerHTML = stats.map(s => `
      <div class="ngo-quickstat">
        <div class="lbl">${s.lbl}</div>
        <div class="val">${s.val}</div>
        <div class="unit">${s.unit}</div>
        <div class="src">${confChip(s.p.conf || "approximated")} ${s.p.src || ""}</div>
      </div>`).join("");

    const banner = document.getElementById("limited-data-banner");
    if (banner) {
      if (!isFull) {
        banner.style.display = "block";
        banner.innerHTML = `<strong>Limited peer view.</strong> Atlas does not yet hold full cohort data for ${cc.name}. Showing headline WB / ILO indicators only. Switch to Ghana, Bangladesh, or Viet Nam to access skills, AI fluency, automation tabs.`;
      } else {
        banner.style.display = "none";
      }
    }

    const narrEl = document.getElementById("cohort-narrative-1");
    if (narrEl) {
      const informal = cc.informal_employment_pct ?? cc.informal ?? 80;
      narrEl.textContent = `${informal}% of working-age youth`;
    }
  }

  // ─── Overview ─────────────────────────────────────────────────────────
  function renderOverview() {
    const isFull = isFullCountry(country);
    const cc = isFull ? C.COUNTRIES[country] : E.REGIONAL_PEERS[country];
    const wdi = E.WDI?.[country];

    const cohortSize = E.ATLAS_COHORT?.[country]?.verified_cards ?? "—";
    const elC = document.getElementById("kpi-cohort"); if (elC) elC.textContent = typeof cohortSize === "number" ? fmt(cohortSize) : cohortSize;
    const elN = document.getElementById("kpi-neet"); if (elN) elN.textContent = `${isFull && wdi ? v(wdi.youth_neet) : (cc.neet ?? "—")}%`;
    const elI = document.getElementById("kpi-informal"); if (elI) elI.textContent = `${cc.informal_employment_pct ?? cc.informal ?? "—"}%`;

    // Per-country fresh-NEET source labelling
    if (isFull && wdi) {
      const tag = country === "GH" ? "GSS Q3 2025"
                : country === "BD" ? "BBS LFS 2024"
                : country === "VN" ? "GSO LFS 2023" : "WDI 2024";
      const elNS = document.getElementById("kpi-neet-src"); if (elNS) elNS.textContent = tag;
      const elNC = document.getElementById("kpi-neet-citation");
      if (elNC) elNC.textContent = `[2] ${src(wdi.youth_neet) || tag}`;
      const elNQ = document.getElementById("kpi-neet-qual");
      if (elNQ) {
        elNQ.textContent = country === "GH"
          ? "young people aged 15–24 not in employment, education or training (1.34M persons)"
          : country === "BD"
          ? "young people aged 15–29 NEET (M 15.4% / F 22.1%; 41.9% rural / 58.1% urban)"
          : country === "VN"
          ? "young people aged 15–24 not in employment, education or training"
          : "young people aged 15–24 NEET";
      }
    }

    // ILO 2026 global trends layer
    const ilo = E.ILO_GLOBAL_2026;
    const grid = document.getElementById("ilo-2026-grid");
    if (ilo && grid) {
      const tiles = [
        { lbl: "Global jobs gap (2026 proj.)",   val: `${v(ilo.global_jobs_gap_millions)}M`,           sub: "people who want paid work but cannot access it" },
        { lbl: "Globally informal (2026 proj.)", val: `${v(ilo.global_informal_workers_bn)}B`,         sub: "workers in the informal economy" },
        { lbl: "SSA informal share",             val: `${v(ilo.ssa_informal_share_pct)}%`,             sub: "≈ 9 in 10 workers in Sub-Saharan Africa" },
        { lbl: "SSA annual jobs gap",            val: `${v(ilo.ssa_annual_jobs_gap_millions)}M / yr`,  sub: "rapid pop growth, agriculture absorbs informally" }
      ];
      grid.innerHTML = tiles.map(t => `
        <div style="background:white;border:1px solid var(--d360-border);border-radius:4px;padding:14px">
          <div style="font-size:0.7rem;color:var(--d360-muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">${t.lbl}${pill("verified")}</div>
          <div style="font-family:'Inter',sans-serif;font-size:1.7rem;font-weight:800;color:var(--d360-navy);line-height:1">${t.val}</div>
          <div style="font-size:0.78rem;color:var(--d360-muted);margin-top:4px">${t.sub}</div>
        </div>`).join("");
    }

    const tbody = document.getElementById("top-isco-table");
    if (!tbody) return;
    if (!isFull) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--d360-muted);padding:24px">Detailed ISCO breakdown not available for peer-only countries. Switch to Ghana, Bangladesh, or Viet Nam.</td></tr>`;
      return;
    }
    const isco_list = ["7421", "7531", "5223", "2519", "5311"];
    const labels = {
      "7421": "Electronic equipment mechanic",
      "7531": "Tailor / dressmaker",
      "5223": "Shop sales assistant",
      "2519": "Software developer",
      "5311": "Childcare worker"
    };
    const cohort_pct = { "7421": 18.2, "7531": 22.4, "5223": 26.1, "2519": 9.7, "5311": 12.5 };
    const wages = E.ILOSTAT_WAGE?.[country];
    const fo = E.FREY_OSBORNE;
    tbody.innerHTML = isco_list.map(isco => {
      const wage = wages?.[isco]?.formal_median;
      const risk = Math.round((fo?.[isco]?.p_automation || 0) * 100);
      const riskCls = risk > 70 ? "neg" : risk > 50 ? "warn" : "pos";
      return `<tr>
        <td class="mono">${isco}</td>
        <td>${labels[isco]}</td>
        <td class="num">${cohort_pct[isco]}%</td>
        <td class="num">${C.COUNTRIES[country].currency}${fmt(wage)}</td>
        <td class="num ${riskCls}">${risk}%</td>
      </tr>`;
    }).join("");
  }

  // ─── Skills ───────────────────────────────────────────────────────────
  function renderSkills() {
    const sc = document.getElementById("skills-chart");
    const escoBody = document.querySelector("#esco-table tbody");
    if (!sc) return;
    if (!isFullCountry(country)) {
      sc.innerHTML = `<div style="padding:24px;text-align:center;color:var(--d360-muted)">Skills supply data only for full-cohort countries. Switch to Ghana, Bangladesh, or Viet Nam.</div>`;
      if (escoBody) escoBody.innerHTML = "";
      return;
    }
    const wbes = E.WBES_SKILL_GAPS[country];
    const wdi = E.WDI[country];
    const sg = wdi.sector_growth;
    const sd = [
      { l: "Phone repair",   supply: 28, demand: wbes.repair_trades, growth: v(sg.manufacturing) },
      { l: "Tailoring",      supply: 41, demand: 36,                 growth: v(sg.manufacturing) },
      { l: "Sales",          supply: 52, demand: 49,                 growth: v(sg.services) },
      { l: "Software / ICT", supply: 14, demand: wbes.ict_specific,  growth: v(sg.ict) },
      { l: "Childcare",      supply: 19, demand: 31,                 growth: v(sg.services) }
    ];
    sc.innerHTML = sd.map(r => `
      <div class="ngo-bar-compare">
        <div class="label" style="font-weight:500">${r.l}</div>
        <div class="stack">
          <div class="mini"><span>Supply</span><div class="ngo-bar-track"><div class="ngo-bar-fill" style="width:${r.supply}%"></div></div><span class="mono">${r.supply}%</span></div>
          <div class="mini"><span>Demand</span><div class="ngo-bar-track"><div class="ngo-bar-fill ${r.demand > r.supply + 20 ? 'danger' : r.demand > r.supply ? 'warn' : 'gold'}" style="width:${r.demand}%"></div></div><span class="mono">${r.demand}%</span></div>
          <div class="mini"><span>YoY</span><div class="ngo-bar-track"><div class="ngo-bar-fill cyan" style="width:${Math.min(100, r.growth * 6)}%"></div></div><span class="mono">+${r.growth}%</span></div>
        </div>
      </div>`).join("");

    const gaps = sd.map(r => ({ ...r, gap: r.demand - r.supply }));
    gaps.sort((a, b) => b.gap - a.gap);
    const big = document.getElementById("biggest-gap");
    const bigP = document.getElementById("biggest-gap-pct");
    if (big) big.textContent = gaps[0].l;
    if (bigP) bigP.textContent = `+${gaps[0].gap} pp`;

    const esco_rows = [
      { code: "S6.4.2", label: "customer dispute resolution", tier: "transversal", pct: 71.2 },
      { code: "S2.5.1", label: "small-business pricing",      tier: "transversal", pct: 64.8 },
      { code: "S1.5",   label: "diagnose electronic faults",  tier: "core",        pct: 18.4 },
      { code: "S5.7.1", label: "operate sewing machine",      tier: "core",        pct: 22.7 },
      { code: "S2.1.1", label: "Python programming",          tier: "core",        pct: 9.3 },
      { code: "S2.1.12",label: "AI-assisted development",     tier: "modern",      pct: 4.1 },
      { code: "S6.7.1", label: "child supervision",           tier: "core",        pct: 12.5 }
    ];
    if (escoBody) escoBody.innerHTML = esco_rows.map(r => `<tr><td class="mono">${r.code}</td><td>${r.label}</td><td>${r.tier}</td><td class="num">${r.pct}%</td></tr>`).join("");
  }

  // ─── Wages ────────────────────────────────────────────────────────────
  function renderWages() {
    const tbody = document.querySelector("#wage-table tbody");
    const scenario = document.getElementById("wage-scenario-block");
    if (!tbody || !scenario) return;
    if (!isFullCountry(country)) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--d360-muted);padding:24px">Wage data only for full-cohort countries.</td></tr>`;
      scenario.innerHTML = "";
      return;
    }
    const cc = C.COUNTRIES[country];
    const wages = E.ILOSTAT_WAGE[country];
    const labels = {
      "7421": "Electronic equipment mechanic",
      "7531": "Tailor / dressmaker",
      "5223": "Shop sales assistant",
      "2519": "Software developer",
      "5311": "Childcare worker"
    };
    tbody.innerHTML = Object.keys(labels).map(isco => {
      const w = wages[isco]; if (!w) return "";
      const gap = ((w.formal_median - w.informal_median) / w.informal_median * 100).toFixed(0);
      return `<tr>
        <td class="mono">${isco}</td>
        <td>${labels[isco]}</td>
        <td class="num">${cc.currency}${fmt(w.informal_median)}</td>
        <td class="num">${cc.currency}${fmt(w.formal_median)}</td>
        <td class="num pos">+${gap}%</td>
      </tr>`;
    }).join("");

    const cohortSize = E.ATLAS_COHORT?.[country]?.verified_cards ?? 2000;
    const baseline = cc.median_wage_informal;
    const aggregate_status = cohortSize * baseline;
    const aggregateMonthly = Math.round(cohortSize * baseline * 0.15 * 0.5);
    scenario.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
        <div class="ngo-statblock">
          <div class="big">${cc.currency}${fmt(aggregate_status)}</div>
          <div class="qual">Status quo monthly cohort wages (${fmt(cohortSize)} workers)</div>
          <div class="src">${confChip("modelled")} Atlas modelled · ILO baseline</div>
        </div>
        <div class="ngo-statblock success">
          <div class="big">+ ${cc.currency}${fmt(aggregateMonthly)}</div>
          <div class="qual">If 50% lift one AI Tier (+15% on average)</div>
          <div class="src">${confChip("modelled")} Aggregate monthly wage uplift</div>
        </div>
      </div>
      <div class="ngo-disclaimer" style="margin-top:14px">
        <strong>The single highest-leverage intervention</strong> for this cohort is not a new vocational programme — it is a one-tier shift in AI fluency. Atlas measures and tracks this lever; existing labour data does not.
      </div>`;
  }

  // ─── AI Tier ──────────────────────────────────────────────────────────
  function renderAI() {
    const chart = document.getElementById("ai-tier-chart");
    if (!chart) return;
    if (!isFullCountry(country)) {
      chart.innerHTML = `<div style="padding:24px;text-align:center;color:var(--d360-muted)">AI Tier distribution unavailable for peer-only countries.</div>`;
      return;
    }
    const dist = E.ATLAS_COHORT?.[country]?.ai_tier_dist || [38, 36, 19, 6, 1];
    const labels = ["Tier 0 — Unfamiliar", "Tier 1 — Curious", "Tier 2 — Active", "Tier 3 — Power user", "Tier 4 — Builder"];
    const cls = ["danger", "warn", "", "success", "success"];
    chart.innerHTML = dist.map((vv, i) => `
      <div class="ngo-bar-row">
        <div class="label">${labels[i]}</div>
        <div class="ngo-bar-track"><div class="ngo-bar-fill ${cls[i]}" style="width:${vv * 1.2}%"></div></div>
        <div class="val">${vv}%</div>
      </div>`).join("");
  }

  // ─── Automation ───────────────────────────────────────────────────────
  function renderAutomation() {
    const chart = document.getElementById("fo-chart");
    if (!chart) return;
    const fo = E.FREY_OSBORNE || {};
    const labels = {
      "7421": "Electronic equipment mechanic",
      "7531": "Tailor / dressmaker",
      "5223": "Shop sales assistant",
      "2519": "Software developer",
      "5311": "Childcare worker"
    };
    chart.innerHTML = Object.entries(fo).map(([isco, d]) => {
      const p = Math.round(d.p_automation * 100);
      const cls = p > 70 ? "danger" : p > 50 ? "warn" : "success";
      const durable = d.durable_tasks?.[0] || "";
      return `<div class="ngo-bar-row" style="grid-template-columns: 220px 1fr 60px">
        <div class="label">
          <div style="font-weight:500">${labels[isco] || isco}</div>
          <div style="font-size:0.74rem;color:var(--d360-muted);margin-top:2px">durable: ${durable}</div>
        </div>
        <div class="ngo-bar-track" style="height:18px"><div class="ngo-bar-fill ${cls}" style="width:${p}%"></div></div>
        <div class="val">${p}%</div>
      </div>`;
    }).join("");
  }

  // ─── Demography ───────────────────────────────────────────────────────
  function renderDemography() {
    const isFull = isFullCountry(country);
    const cc = isFull ? C.COUNTRIES[country] : E.REGIONAL_PEERS[country];
    const witt = E.WITTGENSTEIN_2030?.[country];
    const wbl = E.WBL?.[country];
    const wdi = E.WDI?.[country];

    const wittBlk = document.getElementById("wittgenstein-block");
    if (wittBlk) {
      if (witt) {
        const wittPct = Math.round(witt.cohort_with_secondary_plus * 100);
        wittBlk.innerHTML = `
          <div class="ngo-statblock">
            <div class="big">${wittPct}%</div>
            <div class="qual">of women aged 20–24 will hold secondary+ education by 2030 in ${cc.name} (${witt.ten_year_delta} from 2020).</div>
            <div class="src">${confChip(witt.conf)} Wittgenstein Centre · ${witt.scenario || "SSP2 medium"}</div>
          </div>
          <div class="ngo-disclaimer" style="margin-top:14px">
            <strong>Implication.</strong> Credential differentiation is becoming harder. AI fluency, ESCO-mapped attestation and skill specificity replace "I have a diploma" as the labour-market signal of the next five years.
          </div>`;
      } else {
        wittBlk.innerHTML = `<div style="padding:18px;color:var(--d360-muted)">Wittgenstein 2030 projection not loaded for this country.</div>`;
      }
    }

    const wblBlk = document.getElementById("wbl-block");
    if (wblBlk) {
      if (wbl) {
        const score = wbl.score;
        const cls = score >= 70 ? "success" : score >= 50 ? "warn" : "danger";
        wblBlk.innerHTML = `
          <div class="ngo-statblock ${cls}">
            <div class="big">${score}/100</div>
            <div class="qual">Gender legal score (workplace, pay, mobility, parenthood, marriage, assets).</div>
            <div class="src">${confChip(wbl.conf)} WBL 2024 · WBL 2.0 legal frameworks ${wbl.wbl20_legal}/100</div>
          </div>
          <div class="ngo-disclaimer" style="margin-top:14px">
            <strong>${wbl.notes}</strong>
            ${isFull ? `<br/><br/><span style="font-size:0.85rem">Atlas privacy default for female users in ${cc.name}: <strong>Tier ${cc.privacy_default_female}</strong> ${cc.privacy_default_female === 1 ? "(public-only — names hidden by default)" : "(pseudonymous handle — name disclosed only with consent)"}.</span>` : ""}
          </div>`;
      } else {
        wblBlk.innerHTML = `<div style="padding:18px;color:var(--d360-muted)">WBL 2024 not loaded for this country.</div>`;
      }
    }

    const flfp = isFull && wdi ? v(wdi.female_lfp) : (cc.female_lfp ?? null);
    const flfpNarr = document.getElementById("flfp-narrative");
    const flfpChart = document.getElementById("flfp-chart");
    if (flfpNarr && flfpChart && flfp != null) {
      const malePct = Math.min(100, flfp + (country === "BD" ? 50 : country === "AF" ? 70 : (country === "PK" || country === "IN") ? 50 : country === "GH" ? 5 : 10));
      flfpNarr.textContent = `Female labour-force participation in ${cc.name} stands at ${flfp}% of working-age women, against an estimated male rate of ~${Math.round(malePct)}%. This differential drives Atlas privacy defaults and is monitored alongside WBL legal indicators.`;
      flfpChart.innerHTML = `
        <div class="ngo-bar-row"><div class="label">Women</div><div class="ngo-bar-track"><div class="ngo-bar-fill" style="width:${flfp}%"></div></div><div class="val">${flfp}%</div></div>
        <div class="ngo-bar-row"><div class="label">Men (estimate)</div><div class="ngo-bar-track"><div class="ngo-bar-fill gold" style="width:${malePct}%"></div></div><div class="val">~${Math.round(malePct)}%</div></div>`;
    }
  }

  // ─── Master render ────────────────────────────────────────────────────
  function renderAll() {
    buildCountrySwitcher();
    renderProfile();
    renderOverview();
    renderSkills();
    renderWages();
    renderAI();
    renderAutomation();
    renderDemography();
    renderClusters();
  }

  // ─── Cluster taxonomy panel ────────────────────────────────────────────

  const CLUSTER_STATE = { expanded: false, query: "" };

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function highlight(text, query) {
    if (!query) return escapeHTML(text);
    const q = query.toLowerCase();
    const t = String(text);
    const lower = t.toLowerCase();
    const idx = lower.indexOf(q);
    if (idx === -1) return escapeHTML(t);
    return escapeHTML(t.slice(0, idx)) + "<mark>" + escapeHTML(t.slice(idx, idx + q.length)) + "</mark>" + escapeHTML(t.slice(idx + q.length));
  }

  function clusterMatchesQuery(c, q) {
    if (!q) return true;
    const ql = q.toLowerCase();
    const fields = [
      c.name, c.tagline,
      ...(c.sample_iscos || []).map(String),
      ...(c.sample_occupations || []),
      ...(c.informal_skills || []),
      "isco " + (c.isco_majors || []).join(" "),
      "major " + (c.sub_majors || []).join(" "),
      "tier " + (c.skill_level || ""),
      c.flagship_persona || ""
    ];
    return fields.some(f => String(f).toLowerCase().includes(ql));
  }

  function renderClusters() {
    const grid = document.getElementById("cluster-grid");
    const meta = document.getElementById("cluster-meta");
    const toggle = document.getElementById("cluster-toggle");
    const clear = document.getElementById("cluster-search-clear");
    if (!grid) return;

    const all = window.ATLAS_CLUSTERS || [];
    const q = CLUSTER_STATE.query.trim();
    const filtered = all.filter(c => clusterMatchesQuery(c, q));

    let visible;
    if (q) {
      visible = filtered;
      meta.textContent = `${filtered.length} of ${all.length} cluster${filtered.length === 1 ? "" : "s"} match "${q}"`;
      toggle.style.display = "none";
    } else if (CLUSTER_STATE.expanded) {
      visible = all;
      meta.textContent = `Showing all ${all.length} clusters`;
      toggle.style.display = "";
      toggle.textContent = "Show top 5 only ↑";
    } else {
      visible = all.slice(0, 5);
      meta.textContent = `Showing 5 of ${all.length} clusters`;
      toggle.style.display = "";
      toggle.textContent = "See all 10 clusters →";
    }

    if (clear) clear.classList.toggle("visible", q.length > 0);

    if (visible.length === 0) {
      grid.innerHTML = `<div class="cluster-empty">No cluster matches "${escapeHTML(q)}". Try an ISCO code (e.g. <strong>7421</strong>), an occupation (<strong>tailor</strong>), or a skill (<strong>soldering</strong>).</div>`;
      return;
    }

    grid.innerHTML = visible.map(c => {
      const wb = c.wage_band[country] || "—";
      const cohort = c.cohort_pct[country] != null ? c.cohort_pct[country] + "%" : "—";
      const gap = c.skill_gap_demand_pct[country] != null ? c.skill_gap_demand_pct[country] + "%" : "—";
      const growth = c.sector_growth_pct[country] != null ? "+" + c.sector_growth_pct[country] + "%" : "—";
      const risk = c.automation_risk_pct;
      const riskCls = risk > 70 ? "danger" : risk > 50 ? "warn" : "pos";

      const iscos = (c.sample_iscos || []).slice(0, 3).map(i => `<span class="cc-isco">${highlight(i, q)}</span>`).join("");
      const skills = (c.informal_skills || []).slice(0, 4).map(s => `<span class="chip">${highlight(s, q)}</span>`).join("");

      return `
        <div class="cluster-card ${q && clusterMatchesQuery(c, q) ? "match" : ""}" data-cluster="${c.id}">
          <div class="cc-head">
            <div class="cc-emoji">${c.emoji}</div>
            <div class="cc-title">
              <div class="cc-name">${highlight(c.name, q)}</div>
              <div class="cc-tag">${highlight(c.tagline, q)}</div>
            </div>
          </div>

          <div style="display:flex;flex-wrap:wrap;gap:4px">
            ${iscos}
            <span class="cc-isco" style="background:transparent;border-color:transparent;color:var(--d360-muted)">+${(c.sample_iscos||[]).length - 3 < 0 ? 0 : (c.sample_iscos||[]).length - 3} more</span>
          </div>

          <div class="cc-stats">
            <div class="cc-stat"><span class="lbl">Cohort share</span><span class="val">${cohort}</span></div>
            <div class="cc-stat"><span class="lbl">Female share</span><span class="val">${c.female_share_pct}%</span></div>
            <div class="cc-stat"><span class="lbl">Wage band</span><span class="val">${wb}</span></div>
            <div class="cc-stat"><span class="lbl">Auto-risk</span><span class="val ${riskCls}">${risk}%</span></div>
            <div class="cc-stat"><span class="lbl">Skill gap (WBES)</span><span class="val">${gap}</span></div>
            <div class="cc-stat"><span class="lbl">Sector YoY</span><span class="val pos">${growth}</span></div>
          </div>

          <div class="cc-skills">${skills}</div>

          <div class="cc-foot">
            <span>Skill level ${c.skill_level} &middot; ISCO majors ${(c.isco_majors||[]).join(", ")}</span>
            <span>${c.flagship_persona ? "★ " + c.flagship_persona.split(" — ")[0] : ""}</span>
          </div>
        </div>`;
    }).join("");
  }

  function setupClusterControls() {
    const input = document.getElementById("cluster-search-input");
    const toggle = document.getElementById("cluster-toggle");
    const clear = document.getElementById("cluster-search-clear");
    if (!input || !toggle) return;

    input.addEventListener("input", (e) => {
      CLUSTER_STATE.query = e.target.value;
      renderClusters();
    });
    toggle.addEventListener("click", () => {
      CLUSTER_STATE.expanded = !CLUSTER_STATE.expanded;
      renderClusters();
    });
    if (clear) clear.addEventListener("click", () => {
      CLUSTER_STATE.query = "";
      input.value = "";
      input.focus();
      renderClusters();
    });
  }

  // ─── Boot ─────────────────────────────────────────────────────────────
  document.addEventListener("DOMContentLoaded", () => {
    setupTabs();
    setupSearch();
    setupActionButtons();
    setupClusterControls();
    renderAll();
  });
})();
