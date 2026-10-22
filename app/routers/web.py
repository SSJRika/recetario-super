from fastapi import APIRouter, Request
from fastapi.templating import Jinja2Templates

router = APIRouter(tags=["web"])
templates = Jinja2Templates(directory="app/templates")


@router.get("/")
def home_page(request: Request):
    return templates.TemplateResponse(request, "landing.html")


@router.get("/inicio")
def inicio_page(request: Request):
    return templates.TemplateResponse(request, "landing.html")


@router.get("/login")
def login_page(request: Request):
    return templates.TemplateResponse(request, "login.html")


@router.get("/carrito")
def carrito_page(request: Request):
    return templates.TemplateResponse(request, "carrito.html")


@router.get("/perfil")
def perfil_page(request: Request):
    return templates.TemplateResponse(request, "perfil.html")


@router.get("/refrigerador")
def refrigerador_page(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="refrigerador.html"
    )



@router.get("/mis-recetas")
def mis_recetas_page(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="mis-recetas.html"
    )



@router.get("/contactanos")
def contactanos_page(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="contactanos.html"
    )
