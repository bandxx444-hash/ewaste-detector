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

Then search the web for current eBay SOLD listings for this exact model to get real
market prices. Search for: site:ebay.com "{model} {name}" sold completed listings.
Focus on completed/sold listings, not active ones. Visit the actual listing pages to get image URLs.

For each comparable listing you find, extract:
- The full listing title
- The sold price (number only, no $ sign)
- The condition label used on eBay (e.g. "Used", "Good - Refurbished", "For parts")
- The sold date (e.g. "Mar 28, 2025")
- The direct eBay listing URL — must be a real https://www.ebay.com/itm/ITEMID URL from the listing page you visited. If you cannot find a real listing URL, use https://www.ebay.com/sch/i.html?_nkw={name}+{model}&LH_Complete=1&LH_Sold=1
- A short storage/variant label if visible (e.g. "64GB", "256GB Space Gray", "Wi-Fi only")
- The main product image URL from the listing page — eBay images follow the pattern https://i.ebayimg.com/images/g/HASH/s-l500.jpg or https://i.ebayimg.com/thumbs/images/g/HASH/s-l225.jpg. Look for these URLs in the listing page HTML/source. Include at least 1 real image URL if you can find it.

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
      "title": "full eBay listing title",
      "price": 245,
      "condition": "Used",
      "sold_date": "Mar 28, 2025",
      "variant": "64GB Black",
      "url": "https://www.ebay.com/itm/... or search URL fallback",
      "image_urls": ["https://i.ebayimg.com/images/g/.../s-l500.jpg"]
    }}
  ]
}}

Include 3 comparable listings. Every listing MUST have:
- A url field — real listing URL if found, otherwise https://www.ebay.com/sch/i.html?_nkw=DEVICE+MODEL&LH_Complete=1&LH_Sold=1
- An image_urls array — include up to 4 image URLs from the listing if you can find them on the listing page. eBay images follow the pattern https://i.ebayimg.com/images/g/HASH/s-l500.jpg. If you cannot find real image URLs, return an empty array [].
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
