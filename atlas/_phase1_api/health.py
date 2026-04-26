"""Atlas — health check + smoke endpoint for the Python serverless runtime.

Vercel auto-detects this file at build time and exposes it as
GET /api/health. A 200 OK with the build commit confirms the Python
runtime is live. This file exists for Phase 0 verification.
"""

from __future__ import annotations

import os
import sys
from datetime import UTC, datetime

from fastapi import FastAPI

app = FastAPI(title="Atlas Engine — health")


@app.get("/api/health")
def health() -> dict[str, str | bool | int]:
    return {
        "ok": True,
        "service": "atlas-engine",
        "runtime": f"python-{sys.version_info.major}.{sys.version_info.minor}",
        "now": datetime.now(UTC).isoformat(),
        "commit": os.environ.get("VERCEL_GIT_COMMIT_SHA", "local"),
        "env": os.environ.get("VERCEL_ENV", "development"),
    }
