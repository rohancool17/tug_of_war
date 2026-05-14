from fastapi import FastAPI, Request, responses, status
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.middleware.sessions import SessionMiddleware
from app.routes import auth, game
from pathlib import Path
import os
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s:     %(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Tug of War")

# Add Session Middleware
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SECRET_KEY", "tug-of-war-secret-key-123"),
)

# Mount static files
app.mount("/static", StaticFiles(directory=Path(__file__).parent / "static"), name="static")

# Setup templates
templates = Jinja2Templates(directory=Path(__file__).parent / "templates")

@app.middleware("http")
async def log_requests(request: Request, call_next):
    if request.method == "POST" and "/api/game/save" in request.url.path:
        logger.info(f"Incoming game data save request for: {request.url.path}")
    
    response = await call_next(request)
    return response

# Include routers
app.include_router(auth.router)
app.include_router(game.router, prefix="/api/game")

@app.get("/")
async def root(request: Request):
    if not request.session.get("user_id"):
        return responses.RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)
    return templates.TemplateResponse("index.html", {"request": request})

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
