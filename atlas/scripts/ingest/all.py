"""Atlas — LMIC ingest entrypoint.

Runs all source ingest scripts in parallel for the configured countries.
Phase 0 stub — Phase 1 (08:00 → 10:00 Paris) fills in the real fetchers.

Usage:
    uv run python -m scripts.ingest.all
    uv run python -m scripts.ingest.all --country GH
    uv run python -m scripts.ingest.all --source ilostat
"""

from __future__ import annotations

import argparse
import asyncio
import os
import sys

DEFAULT_COUNTRIES = ["GH", "BD", "VN"]


async def main() -> int:
    parser = argparse.ArgumentParser(description="Atlas LMIC ingest")
    parser.add_argument(
        "--country",
        default=os.environ.get("INGEST_COUNTRIES"),
        help=f"Comma-separated ISO-2 codes (default {','.join(DEFAULT_COUNTRIES)})",
    )
    parser.add_argument(
        "--source",
        default=None,
        help="One of: ilostat, wdi, frey_osborne, wbl, wbes, findex, wittgenstein, hci, isco, onet",
    )
    args = parser.parse_args()

    countries = (args.country or ",".join(DEFAULT_COUNTRIES)).split(",")
    print(f"[atlas:ingest] starting for countries: {', '.join(countries)}")
    print("[atlas:ingest] Phase 0 stub — real fetchers ship in Phase 1.")
    print("[atlas:ingest] See PIPELINE.md for the per-source spec.")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
