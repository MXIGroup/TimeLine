"""
Optional FastAPI worker. The Next.js app calls this when it needs the
heavyweight scraping path — primarily Playwright-driven TikTok / IG screenshot
captures that don't fit in a serverless function's runtime budget.

Status: scaffolding only. Wire up endpoints as you implement scrapers.
See docs/SCRAPERS.md for the design contract.
"""

from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel
import os

app = FastAPI(title="mxi-campaign-tracker workers")

WORKER_SECRET = os.environ.get("WORKER_SECRET", "")


def _auth(authorization: str | None):
    if not WORKER_SECRET:
        raise HTTPException(500, "WORKER_SECRET not configured")
    if authorization != f"Bearer {WORKER_SECRET}":
        raise HTTPException(401, "unauthorized")


class ScrapeRequest(BaseModel):
    post_url: str
    platform: str


@app.get("/healthz")
def healthz():
    return {"ok": True}


@app.post("/scrape/metrics")
def scrape_metrics(req: ScrapeRequest, authorization: str | None = Header(None)):
    _auth(authorization)
    # TODO: dispatch to scrapers/tiktok.py / instagram.py / etc.
    raise HTTPException(501, "not implemented")
