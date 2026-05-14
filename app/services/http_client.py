import httpx
from app.config import get_settings

_client = None

def get_http_client():
    global _client
    if _client is None:
        settings = get_settings()
        token = settings.DIRECTUS_TOKEN
        if not token:
             import logging
             logging.error("DIRECTUS_TOKEN is empty! Directus API calls will fail with 401.")
        
        headers = {
            "Authorization": f"Bearer {token}"
        }
        _client = httpx.AsyncClient(
            base_url=settings.DIRECTUS_URL,
            headers=headers,
            timeout=30.0
        )
    return _client
