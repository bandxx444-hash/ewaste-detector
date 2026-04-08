"""
EcoLens FastAPI backend — wraps the real Claude API calls.
Run with:  uvicorn backend:app --reload --port 8000
"""
import asyncio
import json
import base64
import io
import uuid
from datetime import datetime

from dotenv import load_dotenv
load_dotenv()

import os
import httpx
import anthropic
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.responses import Response, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

from prompts import ANALYSIS_PROMPT, LISTING_PROMPT

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── eBay Finding API ───────────────────────────────────────────────────────────

EBAY_APP_ID = os.environ.get("EBAY_APP_ID", "")
EBAY_OAUTH_TOKEN = os.environ.get("EBAY_OAUTH_TOKEN", "")

async def ebay_sold_listings(query: str, limit: int = 3) -> list[dict]:
    """Fetch active eBay listings via the Browse API using OAuth token."""
    if not EBAY_OAUTH_TOKEN:
        return []
    url = "https://api.ebay.com/buy/browse/v1/item_summary/search"
    params = {
        "q": query,
        "limit": limit,
        "filter": "conditionIds:{3000}",
    }
    headers = {
        "Authorization": f"Bearer {EBAY_OAUTH_TOKEN}",
        "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
    }
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(url, params=params, headers=headers)
        print(f"eBay Browse API status: {r.status_code}")
        data = r.json()
        if r.status_code != 200:
            print(f"eBay Browse API error: {data}")
            return []
        items = data.get("itemSummaries", [])
        results = []
        for item in items[:limit]:
            price_val = float(item.get("price", {}).get("value", 0))
            image_url = item.get("image", {}).get("imageUrl", "").replace("s-l225", "s-l500").replace("s-l140", "s-l500")
            results.append({
                "title": item.get("title", ""),
                "soldPrice": price_val,
                "condition": item.get("condition", "Used"),
                "soldDate": "",
                "variant": "",
                "imageUrl": image_url,
                "ebayUrl": item.get("itemWebUrl", "https://www.ebay.com"),
            })
        return results
    except Exception as e:
        print(f"eBay Browse API error: {e}")
        return []


# ── GET /api/image-proxy ───────────────────────────────────────────────────────

@app.get("/api/image-proxy")
async def image_proxy(url: str):
    """Proxy eBay images to avoid hotlink blocking."""
    if not url.startswith("https://i.ebayimg.com"):
        return Response(status_code=403)
    async with httpx.AsyncClient() as client:
        r = await client.get(url, headers={"Referer": "https://www.ebay.com/"}, follow_redirects=True)
    return Response(content=r.content, media_type=r.headers.get("content-type", "image/jpeg"))


# ── Helpers ────────────────────────────────────────────────────────────────────

IDENTIFY_PROMPT = """
Look at these photos of an electronic device and identify it as accurately as possible.
For each field provide the actual identified value AND your confidence level.

Return ONLY valid JSON — no markdown, no explanation:
{
  "device_name":      {"value": null, "confidence": "certain"},
  "brand":            {"value": null, "confidence": "certain"},
  "model":            {"value": null, "confidence": "unknown"},
  "year":             {"value": null, "confidence": "unknown"},
  "powers_on":        {"value": null, "confidence": "unknown"},
  "screen_condition": {"value": null, "confidence": "unknown"}
}

Rules:
- device_name: the full product name you see (e.g. "MacBook Pro 14", "Samsung Galaxy S21", "iPad Air 4th Gen")
- brand: manufacturer name (e.g. "Apple", "Samsung", "Dell", "Sony")
- model: model number or identifier if visible (e.g. "A2442", "SM-G991B"), null if not visible
- year: estimated release year as a number (e.g. 2021), null if uncertain
- powers_on: "Yes" or "No" based on what you can see, null if screen is off and you cannot tell
- screen_condition: one of "Flawless", "Minor Scratches", "Cracked", "Screen is off/broken", null if uncertain
- confidence must be exactly one of: "certain", "likely", "unknown"
- If you cannot determine a value, set value to null and confidence to "unknown"
- Do NOT use placeholder or example text as values — only use what you actually observe
"""

CARBON_SAVINGS = {
    "smartphone": 44, "iphone": 44, "android": 44, "phone": 44,
    "laptop": 357, "macbook": 357, "notebook": 357,
    "desktop": 718, "imac": 718, "pc": 718,
    "tablet": 86, "ipad": 86,
    "monitor": 530, "display": 530,
    "printer": 185,
    "television": 1050, "tv": 1050,
    "keyboard": 22,
    "camera": 55,
    "watch": 22, "smartwatch": 22,
}


def extract_json(text: str) -> dict:
    text = text.strip()
    if "```" in text:
        for part in text.split("```"):
            part = part.strip().lstrip("json").strip()
            if part.startswith("{"):
                text = part
                break
    s, e = text.find("{"), text.rfind("}") + 1
    if s == -1 or e == 0:
        raise ValueError("No JSON found in response.")
    return json.loads(text[s:e])


def make_image_block(b: bytes) -> dict:
    img = Image.open(io.BytesIO(b))
    img.thumbnail((1568, 1568))
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    b64 = base64.standard_b64encode(buf.getvalue()).decode()
    return {"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": b64}}


async def fetch_ebay_image(url: str) -> str:
    """Scrape the first product image from an eBay listing page."""
    if not url or "ebay.com" not in url:
        return ""
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            r = await client.get(url, headers={
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9",
            }, follow_redirects=True)
        text = r.text
        # Look for i.ebayimg.com image URLs in the page
        import re
        matches = re.findall(r'https://i\.ebayimg\.com/images/g/[^"\'\\s]+s-l[0-9]+\.jpg', text)
        if matches:
            # Prefer s-l500 size
            for m in matches:
                if "s-l500" in m or "s-l400" in m:
                    return m
            return matches[0]
    except Exception:
        pass
    return ""


def carbon_saving(device_name: str) -> int:
    lower = device_name.lower()
    for key, val in CARBON_SAVINGS.items():
        if key in lower:
            return val
    return 100


# ── POST /api/identify ─────────────────────────────────────────────────────────

@app.post("/api/identify")
async def identify(files: list[UploadFile] = File(...)):
    """Upload device photos → returns DiagnosticsData."""
    photo_bytes = [await f.read() for f in files[:4]]
    blocks = [make_image_block(b) for b in photo_bytes]
    blocks.append({"type": "text", "text": IDENTIFY_PROMPT})

    client = anthropic.Anthropic()
    resp = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=600,
        messages=[{"role": "user", "content": blocks}],
    )
    raw = extract_json(resp.content[0].text)

    def val(field):
        return raw.get(field, {}).get("value") or ""

    def confident(field):
        return raw.get(field, {}).get("confidence") in ("certain", "likely")

    powers_on_raw = val("powers_on")
    powers_on = True if str(powers_on_raw).lower() == "yes" else (
        False if str(powers_on_raw).lower() == "no" else None
    )

    return {
        "productName": val("device_name") or "",
        "brand": val("brand") or "",
        "modelNumber": val("model") or "",
        "yearOfPurchase": raw.get("year", {}).get("value") or datetime.now().year,
        "powersOn": powers_on,
        "screenCondition": val("screen_condition") or "",
        "aiConfidence": {
            "productName": confident("device_name"),
            "brand": confident("brand"),
            "modelNumber": confident("model"),
            "yearOfPurchase": confident("year"),
            "powersOn": confident("powers_on"),
            "screenCondition": confident("screen_condition"),
        },
    }


# ── POST /api/analyze ──────────────────────────────────────────────────────────

@app.post("/api/analyze")
async def analyze(
    diagnostics: str = Form(...),
    files: list[UploadFile] = File(default=[]),
):
    """Run full AI analysis → returns ScanResult."""
    diag = json.loads(diagnostics)
    name = diag.get("productName", "")
    brand = diag.get("brand", "")
    model = diag.get("modelNumber", "")
    year = diag.get("yearOfPurchase", datetime.now().year)

    photo_bytes = [await f.read() for f in files]
    blocks = [make_image_block(b) for b in photo_bytes]
    blocks.append({"type": "text", "text": ANALYSIS_PROMPT.format(
        name=name, brand=brand, model=model, year=year
    )})

    # Fetch real eBay sold listings in parallel with Claude analysis
    ebay_query = f"{brand} {name} {model}".strip()
    client = anthropic.Anthropic()
    ebay_task = ebay_sold_listings(ebay_query, limit=3)

    resp = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=1000,
        messages=[{"role": "user", "content": blocks}],
    )

    raw = None
    for block in reversed(resp.content):
        if hasattr(block, "text") and block.text.strip():
            raw = extract_json(block.text)
            break
    if not raw:
        raise ValueError("No analysis response from Claude.")

    # Use real eBay listings if available, else fall back to Claude's estimates
    comparables = await ebay_task
    if not comparables:
        # Fall back to comparable listings Claude generated in its analysis
        claude_comps = raw.get("comparable_listings", [])
        comparables = []
        for c in claude_comps[:3]:
            image_urls = c.get("image_urls", [])
            comparables.append({
                "title": c.get("title", ""),
                "soldPrice": float(c.get("price", 0)),
                "condition": c.get("condition", "Used"),
                "soldDate": c.get("sold_date", ""),
                "variant": c.get("variant", ""),
                "imageUrl": image_urls[0] if image_urls else "",
                "ebayUrl": c.get("url", "https://www.ebay.com"),
            })

    low = raw.get("estimated_value_low", 0)
    high = raw.get("estimated_value_high", 0)
    estimated = round((low + high) / 2)
    device_name = raw.get("device_identified", f"{brand} {name}".strip())

    return {
        "id": str(uuid.uuid4()),
        "deviceName": device_name,
        "brand": brand,
        "modelNumber": model,
        "year": year,
        "condition": raw.get("condition", "Fair"),
        "conditionNotes": raw.get("condition_notes", ""),
        "estimatedValue": estimated,
        "valueLow": low,
        "valueHigh": high,
        "comparables": comparables,
        "recommendation": raw.get("decision", "sell"),
        "recommendationReason": raw.get("decision_reasoning", ""),
        "co2Saved": carbon_saving(device_name),
        "scannedAt": datetime.now().isoformat(),
        "decision": raw.get("decision", "sell"),
        "adjustedPrice": estimated,
    }


# ── POST /api/listing ──────────────────────────────────────────────────────────

@app.post("/api/listing")
async def listing(result: str = Form(...)):
    """Generate a ready-to-post eBay listing from a ScanResult."""
    r = json.loads(result)

    client = anthropic.Anthropic()
    resp = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=1500,
        messages=[{"role": "user", "content": LISTING_PROMPT.format(
            device=r.get("deviceName", ""),
            brand=r.get("brand", ""),
            model=r.get("modelNumber", ""),
            year=r.get("year", ""),
            condition=r.get("condition", ""),
            notes=r.get("conditionNotes", ""),
            low=r.get("adjustedPrice", r.get("valueLow", 0)),
            high=r.get("adjustedPrice", r.get("valueHigh", 0)),
        )}],
    )
    raw = extract_json(resp.content[0].text)

    # Format as a clean plain-text listing
    title = raw.get("title", r.get("deviceName", ""))
    cond = raw.get("condition_grade", f"Used - {r.get('condition', 'Good')}")
    desc = raw.get("description", "")
    price = raw.get("suggested_price", r.get("adjustedPrice", 0))
    shipping = raw.get("shipping_recommendation", "")
    tags = raw.get("keywords", [])

    return {
        "title": title,
        "condition": cond,
        "description": desc,
        "price": price,
        "shipping": shipping,
        "tags": tags,
    }


# ── Serve React frontend (must be last) ────────────────────────────────────────

DIST = os.path.join(os.path.dirname(__file__), "Website-Design", "dist")

if os.path.isdir(DIST):
    app.mount("/assets", StaticFiles(directory=os.path.join(DIST, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file = os.path.join(DIST, full_path)
        if os.path.isfile(file):
            return FileResponse(file)
        # Never cache index.html so browsers always get the latest JS bundle
        return FileResponse(
            os.path.join(DIST, "index.html"),
            headers={"Cache-Control": "no-store, no-cache, must-revalidate"},
        )
