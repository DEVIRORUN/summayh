import httpx
import logging
import os
import math
from config import GEMINI_API_KEY


logger = logging.getLogger(__name__)

GEMINI_EMBEDDING_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent"
EMBEDDING_DIMENSIONS = 768 # best according to Google


def _normalize(vector: list[float]) -> list[float]:
    """
    Non-default output dimensions (anything other than 3072) are NOT
    pre-normalized by the API, so cosine similarity would be inaccurate
    without this step. Normalizes to unit length (L2 norm = 1.0).
    """
    norm = math.sqrt(sum(x * x for x in vector))
    if norm == 0:
        return vector
    return [x / norm for x in vector]


async def generate_embedding(text: str) -> list[float]:
    """
    Generate a 768-dimensional normalized embedding for the given text.
    No prompt/reasoning involved - directly encodes text into a vector
    representing semantic meaning. User for Pro gig similarity search.
    """
    async with httpx.AsyncClient(timeout=30) as client:
        try:
            response = await client.post(
                GEMINI_EMBEDDING_URL,
                params={"key": GEMINI_API_KEY},
                json={
                    "model": "models/gemini-embedding-001",
                    "content": {"parts": [{"text": text}]},
                    "outputDimensionality": EMBEDDING_DIMENSIONS
                    }
            )
            response.raise_for_status()
            data = response.json()
            raw_vector = data["embedding"]["values"]
            return _normalize(raw_vector)
        except Exception as e:
            logger.error(f"[Embedding] Failed to generate embedding: {e}")
            raise
