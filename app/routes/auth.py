from fastapi import APIRouter, Request, Form, responses, status
from fastapi.templating import Jinja2Templates
from pathlib import Path
from app.services.directus import DirectusService

router = APIRouter()
templates = Jinja2Templates(directory=Path(__file__).parent.parent / "templates")

@router.get("/login")
async def login_get(request: Request):
    if request.session.get("user_id"):
        return responses.RedirectResponse(url="/", status_code=status.HTTP_302_FOUND)
    
    error = request.query_params.get("error")
    return templates.TemplateResponse("login.html", {"request": request, "error": error})

@router.post("/login")
async def login_post(request: Request, username: str = Form(...), password: str = Form(...)):
    user = await DirectusService.authenticate_user(username, password)
    
    if user:
        request.session["user_id"] = str(user.get("id"))
        request.session["user_name"] = user.get("name")
        request.session["user_code"] = user.get("code")
        return responses.RedirectResponse(url="/", status_code=status.HTTP_302_FOUND)
    
    return responses.RedirectResponse(url="/login?error=invalid", status_code=status.HTTP_302_FOUND)

@router.get("/logout")
async def logout(request: Request):
    request.session.clear()
    return responses.RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)
