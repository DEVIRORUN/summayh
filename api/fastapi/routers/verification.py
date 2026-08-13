import os
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import date

router = APIRouter(prefix="/api/verification", tags=["verification"])

YOUVERIFY_BASE_URL = "https://api.sandbox.youverify.co"  # switch to live URL when ready
YOUVERIFY_API_KEY = os.environ["YOUVERIFY_API_KEY"]

MIN_AGE_YEARS = 18

class LivenessCheckRequest(BaseModel):
    userId: str
    nin: str
    selfeImageUrl: str

class LivenessCheckResult(BaseModel):
    userId: str
    livenessPassed: bool
    livenessScore: float | None
    ninMatchPassed: bool
    ageVerifiedAdult: bool
    dateOfBirth: str | None
    fullName: str | None
    failureReason: str | None
    providerRef: str | None

def calculate_age(dob_str: str) -> int:
    dob = date.fromisoformat(dob_str)
    today = date.today()
    age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
    return age

@router.post("/liveness/check", response_model=LivenessCheckResult)
async def check_liveness(payload: LivenessCheckRequest):
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            #  fetch the
            response = await client.post(
                f"{YOUVERIFY_BASE_URL}/v2/api/identity/ng/nin",
                headers={
                    "Content-Type": "application/json",
                    "token": YOUVERIFY_API_KEY
                },
                json={
                    "id": payload.nin,
                    "isSubjectConsent": True,
                    "premiumNin": {
                        "selfieImage": payload.selfeImageUrl,
                    }
                }
            )
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"Youverify request failed: {exc}")

    if response.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail=f"Youverify returned {response.status_code}: {response.text}",
        )

    body = response.json()
    if not body.get("success"):
        return LivenessCheckResult(
            userId=payload.userId,
            livenessPassed=False,
            livenessScore=None,
            ninMatchPassed=False,
            ageVerifiedAdult=False,
            dateOfBirth=None,
            fullName=None,
            failureReason=body.get("message", "Verification failed"),
            providerRef=None,
        )

    data = body.get("data", {})
    selfie = data.get("validations", {}).get("selfie", {}).get("selfieVerification", {})
    liveness_score = selfie.get("confidenceLevel")
    liveness_passed = bool(selfie.get("match"))

    dob_str = data.get("dateOfBirth")
    age_verified_adult = False
    if dob_str:
        try:
            age_verified_adult = calculate_age(dob_str) >= MIN_AGE_YEARS
        except ValueError:
            age_verified_adult = False

    nin_match_passed = data.get("status") == "found"

    full_name = " ".join(
        filter(None, [data.get("firstName"), data.get("middleName"), data.get("lastName")])
    ) or None

    failure_reason = None
    if not liveness_passed:
        faliure_reason = "Selfie does not match NIN photo"
    elif not nin_match_passed:
        failure_reason = "NIN could not be verified"
    elif not age_verified_adult:
        failure_reason = "User does not meet the minimum age requirement (18+)"

    return LivenessCheckResult(
        userId=payload.userId,
        livenessPassed=liveness_passed,
        livenessScore=liveness_score,
        ninMatchPassed=nin_match_passed,
        ageVerifiedAdult=age_verified_adult,
        dateOfBirth=dob_str,
        fullName=full_name,
        failureReason=failure_reason,
        providerRef=data.get("id"),
    )