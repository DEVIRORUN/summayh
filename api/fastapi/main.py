from fastapi import FastAPI
from routers import dispute, review, health, search, embeddings, verification
import logging


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)




app = FastAPI(
    title="SUMMAYH",
    summary="built by Abdulmalik Ahmad",
    description="Gemini-powered AI backend for SUMMAYH marketplace",
    version="1.0.0",
)


app.include_router(health.router)
app.include_router(search.router)
app.include_router(review.router)
app.include_router(dispute.router)
app.include_router(embeddings.router)
app.include_router(verification.router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
