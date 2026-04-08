ANALYSIS_PROMPT = """
You are an expert in used electronics valuation and e-waste assessment.

Product info provided by the user:
- Name: {name}
- Brand: {brand}
- Model: {model}
- Year purchased: {year}

Carefully analyze the uploaded photos of the device. Look for:
- Physical damage (cracks, dents, scratches, missing parts)
- Screen condition
- Port and button condition
- Overall cleanliness and wear

Based on your knowledge of the used electronics market, estimate the current resale value
for this device on eBay and create 3 realistic comparable sold listings that represent
what this device actually sells for in similar condition. Use realistic eBay-style listing
titles and accurate recent sold prices from your training data.

Return ONLY valid JSON — no markdown, no explanation, just the raw JSON object:
{{
  "device_identified": "string — exactly what you see in the photos",
  "condition": "Poor | Fair | Good | Excellent",
  "condition_notes": "string — specific observations from the photos (2-3 sentences)",
  "decision": "sell | trade-in | recycle",
  "decision_reasoning": "string — 2-3 sentences explaining why",
  "estimated_value_low": number,
  "estimated_value_high": number,
  "sellable": true or false,
  "comparable_listings": [
    {{
      "title": "realistic full eBay listing title",
      "price": 245,
      "condition": "Used",
      "sold_date": "Mar 2025",
      "variant": "64GB Black",
      "url": "https://www.ebay.com/sch/i.html?_nkw={name}+{model}&LH_BIN=1&_sop=12&Condition=3000",
      "image_urls": []
    }}
  ]
}}

Include exactly 3 comparable listings with realistic prices that vary slightly (10-15%)
to reflect natural market variation. For the url field of every listing use this format
to link to real active eBay listings for the specific device — replace spaces with +:
https://www.ebay.com/sch/i.html?_nkw=BRAND+NAME+MODEL&LH_BIN=1&_sop=12&Condition=3000
For example for an Apple MacBook Pro 14 A2442:
https://www.ebay.com/sch/i.html?_nkw=Apple+MacBook+Pro+14+A2442&LH_BIN=1&_sop=12&Condition=3000
Set image_urls to an empty array [].
"""

LISTING_PROMPT = """
Create a complete, ready-to-paste eBay listing for this used electronic device.

Device details:
- Device: {device}
- Brand: {brand}
- Model: {model}
- Year purchased: {year}
- Condition grade: {condition}
- Condition notes from inspection: {notes}
- Suggested price range based on market: ${low}–${high}

Write the listing to attract buyers while being honest about the condition.
Use relevant search keywords in the title. Follow eBay best practices.

Return ONLY valid JSON — no markdown, no explanation, just the raw JSON object:
{{
  "title": "string — max 80 characters, keyword-rich eBay title",
  "condition_grade": "Used - Excellent | Used - Good | Used - Fair | For Parts or Not Working",
  "description": "string — 150-200 word listing body with bullet points for key specs and condition details",
  "suggested_price": number,
  "shipping_recommendation": "string — e.g. 'Free shipping via USPS Priority Mail'",
  "keywords": ["5", "relevant", "search", "tags"]
}}
"""
