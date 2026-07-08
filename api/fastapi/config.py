from dotenv import load_dotenv
import os

load_dotenv(dotenv_path="../../.env")


GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
NODE_API_URL = os.getenv("NODE_API_URL", "http://localhost:3000")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is not set in `.env`")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in .env")