from fastapi import APIRouter, Request
from fastapi.templating import Jinja2Templates

router = APIRouter(tags=["web"])
templates = Jinja2Templates(directory="app/templates")


@router.get("/")
def home_page(request: Request):
    return templates.TemplateResponse(request, "home.html")


@router.get("/login")
def login_page(request: Request):
    return templates.TemplateResponse(request, "login.html")


@router.get("/carrito")
def carrito_page(request: Request):
    return templates.TemplateResponse(request, "carrito.html")


@router.get("/perfil")
def perfil_page(request: Request):
    return templates.TemplateResponse(request, "perfil.html")