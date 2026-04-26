// Atlas — LMIC data ingest entrypoint
// Runs all source ingest scripts in parallel for the configured countries.
// Phase 1 will fill in the real fetchers; this scaffold ensures `pnpm ingest` works.

import "dotenv/config";

const COUNTRIES = (process.env["INGEST_COUNTRIES"] ?? "GH,BD").split(",");

async function main() {
  console.log(`[atlas:ingest] starting for countries: ${COUNTRIES.join(", ")}`);
  console.log(`[atlas:ingest] Phase 0 stub — real fetchers ship in Phase 1 (08:00 → 10:00 Paris).`);
  console.log(`[atlas:ingest] See PIPELINE.md for the per-source spec.`);
}

main().catch((err) => {
  console.error("[atlas:ingest] failed", err);
  process.exit(1);
});
