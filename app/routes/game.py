from fastapi import APIRouter, Request, HTTPException
from app.services.directus import DirectusService
from pydantic import BaseModel
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

print(">>> GAME DATA ROUTER LOADED SUCCESSFULLY <<<")

logger.info("Game data router successfully loaded.")

class GameData(BaseModel):
    hcp_name: str
    hcp_code: str
    time_spent: float
    winner: str

@router.get("/test-ping")
async def test_ping(request: Request):
    """Verifies Directus connectivity and session."""
    user_id = request.session.get("user_id")
    mr_name = request.session.get("user_name")
    
    try:
        from app.services.http_client import get_http_client
        client = get_http_client()
        resp = await client.get("/collections")
        return {
            "status": "success",
            "logged_in_as": mr_name,
            "directus_status": resp.status_code,
            "message": "Directus is reachable"
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.post("/save")
async def save_game_data(request: Request, data: GameData):
    user_id = request.session.get("user_id")
    if not user_id:
        logger.warning("Attempted to save game data without active session.")
        raise HTTPException(status_code=401, detail="Unauthorized")

    mr_name = request.session.get("user_name")
    mr_code = request.session.get("user_code")

    payload = {
        "mr_code": mr_code,
        "mr_name": mr_name,
        "hcp_name": data.hcp_name,
        "hcp_code": data.hcp_code,
        "time_spent": f"{data.time_spent:.2f}s",
        "winner": data.winner
    }

    logger.info(f"Attempting to save game data to Directus: {payload}")

    try:
        from app.services.http_client import get_http_client
        client = get_http_client()
        resp = await client.post("/items/TOW_Data", json=payload)
        
        if resp.status_code >= 400:
            logger.error(f"Directus API error ({resp.status_code}): {resp.text}")
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
            
        logger.info("Successfully saved game data to Directus.")
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Unexpected error saving game data: {e}")
        raise HTTPException(status_code=500, detail=str(e))
