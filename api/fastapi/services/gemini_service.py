import httpx
import os
import json
import re # for mardown blocks
from config import GEMINI_API_KEY


GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"




def clean_json(text: str) -> str:
    text = re.sub(r"```json\s*", "", text)
    text = re.sub(r"```\s*", "", text)
    return text.strip()

async def call_gemini(prompt: str) -> str:
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            GEMINI_URL,
            params={"key": GEMINI_API_KEY},
            json={"contents": [{"parts": [{"text": prompt}]}]}
        )

        response.raise_for_status()
        data = response.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]
    
async def analyze_dispute(dispute_reason: str, order_details: dict, evidence_urls: list) -> dict:
    prompt = f"""
You are a neutral dispute mediator for SUMMAYH, a Nigerian student freelance marketplace.

Analyze this dispute and return a JSON object with exactly these fields:
- aiSummary: A clear 2-3 sentence plain English summary of what happened
- aiRecommendation: One of exactly: "favour_buyer", "favour_seller", or "escalate"
- aiConfidence: A float betwen 0.0 and 1.0

DISPUTE DETAILS:
Reason stated by buyer: {dispute_reason}

ORDER CONTEXT
- Gig: {order_details.get("gig_title", "Unknown")}
- Tier ordered: {order_details.get("tier_label", "Unknown")}
- Amount paid: {order_details.get("total_price", 0):,.2f}
- Order status: {order_details.get("status", "Unknown")}
- Delivery days promised: {order_details.get("delivery_days", "Unknown")}
- Requirements submitted: {order_details.get("requirements_submitted", False)}

EVIDENCE SUBMITTED: {len(evidence_urls)} file(s)

RULES:
- favour_buyer: seller failed to deliver, ghosted, or delivered unrelated work
- favour_seller: buyer disputing in bad faith, work was delivered per brief
- escalate: ambiguous, needs human admin review

Return ONLY valid JSON, no markdown fences:
{{
    "aiSummary": "...",
    "aiRecommendation": "favour_buyer | favour_seller | escalate",
    "aiConfidence": 0.0
}}
"""
    try: 
        text = await call_gemini(prompt)
        result = json.loads(clean_json(text))
        assert result["aiRecommendation"] in ["favour_buyer", "favour_seller", "escalate"]
        assert 0.0 <= float(result["aiConfidence"] <= 1.0)
        return result
    except Exception as e:
        print("[Gemini] Dispute analysis failed: {e}")
        return {
            "aiSummary": "Automated analysis could not be completed",
            "aiRecommendation": "escalte",
            "aiConfidence": 0.0
        }
    
async def detect_review_spam(review_text: str, reviewr_info: dict) -> dict:
    prompt = f"""
You are a spam detection system for SUMMAYH, a Nigerian student freelance marketplace.

Analyze this review and return a JSON object:
- spamScore: float 0.0 (genuine) to 1.0 (spam)
- reasoning: one sentence explaining your score

REVIEW: "{review_text}"

REVIEWER CONTEXT:
- Account age (days): {reviewr_info.get('account_age_days', 0)}
- Reviews in last 7 days: {reviewr_info.get('recent_review_count', 0)}
- Has ordered from this seller before: {reviewr_info.get('has_previous_ordered', False)}

Return ONLY valid JSON:
{{
    "spamScore": 0.0
    "reasoning": "..."
}}
"""
    try: 
        text = await call_gemini(prompt)
        result = json.loads(clean_json(text))
        assert 0.0 <= float(result["spamScore"]) <= 1.0
        return result
    except Exception as e:
        print("[Gemini] Spam detection failed: {e}")
        return {"spamScore": 0.0, "reasoning": "Analysis failed, defaulting to safe"}
    
async def run_agentic_search(query: str, filters: dict) -> dict:
    prompt = f"""
You are an intelligent search assistant for SUMMAYH, a Nigerian student freelance marketplace

A user typed this search query: "{query}"

Extract the following and return as JSON:
- extractedSkill: the core skill or servuce being requested (e.g. "logo design", "mathematics tutoring", "birthday cake", "note writer)
- gigType: "DIGITAL" if it can be done remotely, "PHYSICAL" if it reuires in-person presence
- urgency: "HIGH", "MEDIUM", or "LOW" based on language cues
- searchTerms: array of 3-5 keywords to search the database with
- rewrittenQuery: a clean, professional rewrite of the searchfor database matching (postgreSQL)

Budget filtering provided: {filters.get('budgetMax', 'None')}
Location filter provided: {filters.get('location', 'None')}


Return ONLY valid JSON:
{{
    "extractedSkill": "...",
    "gigType": "DIGITAL | PHYSICAL",
    "urgency": "HIGH | MEDIUM | LOW"
    "searchTerms": ["...", "..."],
    "rewrittenQuery": "..."
}}
"""
    try:
        text = await call_gemini(prompt)
        result = json.loads(clean_json(text))
        return result
    except Exception as e:
        print("[Gemini] Agentic search extraction failed: {e}")
        return {
            "extractedSkill": query,
            "gigType": "DIGITAL",
            "urgency": "MEDIUM",
            "searchTerms": [query],
            "rewrittenQuery": query
        }

# receives userId, 
# fetches seller's skills + \
# university + order count + portfolio count
async def bio_generation(user_info: str) -> dict:
    prompt = f"""
You are an expert profile copywriter for SUMMAYH, a premier Nigerian marketplace freelance and on-site services.
Your task is to write a compelling, professional, and natural-sounding biography for a seller's profile page.

USER CONTEXT:
 - Skills: [{user_info.get("skills"), "Not specified"}]
 - University: {user_info.get("university", "Not specified")}
 - Order count: {user_info.get("order_count", 0)}
 - Portfolio count: {user_info.get("portfolio_count", 0)}



WRITING RULES:
 1. Tone: Professional, welcoming, and confident, Avoidoverly complex jargon or robotic enthusiasm.
 2. Perspective: Write strictly in the first-person ("I am a...", "I specialize in...").
 3. Logic & Edge Cases:
      - If "Completed Orders" or "Portfolio Items" are 0, DO NOT mention them. instead, focus entirely on their specific Skills and University background.
      - If the numbers are high, originally highlight them as proof of reliability and experience.
      - If a field says "Not specified" or "Unknown", ignore if completely in the biography.
 4. Length: Keep it concise and impactful (2-3 maximum).
 5. reasoning: should be why you think this biography is excellent
 6. confidence: How confident are you this is PERFECT?? explictly from range of 0.0 - 1.0

OUTPUT FORMAT:
Return Only a valid JSON object. Do not include markdown formatting, conversational filler, or code blocks.
 {{
    "aiBio": "<the generated biography string>"
    "reasoning": "..."
    "confidence": 0.87
 }}
"""
    try:
        text = await call_gemini(prompt)
        result = json.loads(clean_json(text))
        return result
    except Exception as e:
        print("[Gemini]")
        return {
            "aiBio": "Could not generate bio"
        }
# Marketplaces must protect the buyer's experience above all else, because buyers bring the liquidity.