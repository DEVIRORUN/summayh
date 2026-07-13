import psycopg2
import time
import logging

logger = logging.getLogger(__name__)

from config import DATABASE_URL

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)


def get_db_connection_with_retry(max_retries=3, delay=1):
    last_error = None
    for attempt in range(max_retries):
        try:
            return get_db_connection()
        except Exception as e:
            last_error = e
            logger.warning(f"[DB] Connection attempt {attempt + 1} failed: {e}")
            time.sleep(delay)
    raise last_error
