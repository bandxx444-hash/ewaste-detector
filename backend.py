"""
EcoLens FastAPI backend — wraps the real Claude API calls.
Run with:  uvicorn backend:app --reload --port 8000
"""
import json
import base64
import io
import uuid
from datetime import datetime

import anthropic
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

from prompts import ANALYSIS_PROMPT, LISTING_PROMPT

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Helpers ────────────────────────────────────────────────────────────────────

IDENTIFY_PROMPT = """
Look at these photos of an electronic device and identify it as accurately as possible.
For each field provide a value AND confidence: "certain", "likely", or "unknown".
Return ONLY valid JSON — no markdown:
{
  "device_name":      {"value": "e.g. iPhone 12",    "confidence": "certain|likely|unknown"},
  "brand":            {"value": "e.g. Apple",         "confidence": "certain|likely|unknown"},
  "model":            {"value": "e.g. A2172",         "confidence": "certain|likely|unknown"},
  "year":             {"value": 2020,                 "confidence": "certain|likely|unknown"},
  "powers_on":        {"value": "Yes|No",             "confidence": "certain|likely|unknown"},
  "screen_condition": {"value": "Flawless|Minor Scratches|Cracked|Screen is off/broken", "confidence": "certain|likely|unknown"}
}
If unknown, set value to null and confidence to "unknown".
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

    client = anthropic.Anthropic()
    resp = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=1500,
        tools=[{"type": "web_search_20250305", "name": "web_search", "max_uses": 3}],
        messages=[{"role": "user", "content": blocks}],
    )

    raw = None
    for block in reversed(resp.content):
        if block.type == "text" and block.text.strip():
            raw = extract_json(block.text)
            break
    if not raw:
        raise ValueError("No analysis response from Claude.")

    comparables = [
        {
            "title": c.get("title", ""),
            "soldPrice": c.get("price", 0),
            "condition": c.get("condition", "Used"),
            "soldDate": c.get("sold_date", ""),
            "variant": c.get("variant", ""),
            "imageUrl": (c.get("image_urls") or [""])[0],
            "ebayUrl": c.get("url", "https://www.ebay.com"),
        }
        for c in raw.get("comparable_listings", [])
    ]

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

    text = f"""{title}

TITLE: {title}

CONDITION: {cond}

DESCRIPTION:
{desc}

SUGGESTED PRICE: ${price} USD

SHIPPING: {shipping}

TAGS: {', '.join(tags)}"""

    return {"listing": text}
