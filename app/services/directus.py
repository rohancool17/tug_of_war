import logging
from app.services.http_client import get_http_client

logger = logging.getLogger(__name__)

class DirectusService:
    @staticmethod
    async def get_items(collection: str, params: dict = None):
        """Fetches items from a collection."""
        try:
            client = get_http_client()
            headers = {"Cache-Control": "no-cache"}
            resp = await client.get(f"/items/{collection}", params=params, headers=headers)
            resp.raise_for_status()
            return resp.json().get("data", [])
        except Exception as e:
            logger.error(f"Error fetching items from {collection}: {e}")
            return []

    @staticmethod
    async def authenticate_user(username: str, password: str):
        """Authenticates a user against the magnus_employee collection."""
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        
        params = {
            "filter[code][_eq]": username,
            "filter[is_active][_eq]": True,
            "limit": 1
        }
        
        employees = await DirectusService.get_items("magnus_employee", params=params)
        
        if not employees:
            logger.warning(f"Authentication failed: User {username} not found.")
            return None
            
        employee = employees[0]
        hashed_password = employee.get("password")
        
        try:
            if not hashed_password or not pwd_context.verify(password, hashed_password):
                logger.warning(f"Authentication failed: Invalid password for user {username}.")
                return None
        except Exception as verify_err:
            logger.error(f"Error during password verification for {username}: {verify_err}")
            return None
            
        return employee
