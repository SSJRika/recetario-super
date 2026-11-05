from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.models import PantryItem, User
from app.dependencies import get_current_user
from app.ai_recetas import generar_recetas

router = APIRouter(prefix="/recetas", tags=["recetas"])


@router.post("/generar")
def generar(
    cantidad: int = 3,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    cantidad = max(1, min(cantidad, 5))

    items = session.exec(
        select(PantryItem).where(
            PantryItem.user_id == current_user.id,
            PantryItem.estado == "activo",
        )
    ).all()

    hoy = date.today()
    por_nombre = {}

    for item in items:
        fecha = item.fecha_caducidad_manual or item.fecha_caducidad_estimada
        dias = (fecha - hoy).days if fecha else None

        # Los productos ya caducados no se usan en recetas
        if dias is not None and dias < 0:
            continue

        nombre = item.nombre_detectado.strip().lower()

        if nombre in por_nombre:
            por_nombre[nombre]["cantidad"] += item.cantidad

            if dias is not None and (
                por_nombre[nombre]["dias_restantes"] is None
                or dias < por_nombre[nombre]["dias_restantes"]
            ):
                por_nombre[nombre]["dias_restantes"] = dias
        else:
            por_nombre[nombre] = {
                "nombre": nombre,
                "cantidad": item.cantidad,
                "unidad": item.unidad,
                "dias_restantes": dias,
            }

    ingredientes = list(por_nombre.values())

    if len(ingredientes) < 2:
        return {
            "recetas": [],
            "mensaje": "Agrega al menos 2 productos a tu refrigerador para generar recetas.",
        }

    # Primero lo que caduca antes; lo que no tiene fecha, al final
    ingredientes.sort(
        key=lambda i: (i["dias_restantes"] is None, i["dias_restantes"] or 0)
    )
    ingredientes = ingredientes[:30]

    try:
        recetas = generar_recetas(ingredientes, cantidad)
    except Exception as error:
        print(f"[recetas] fallo final: {error}")
        raise HTTPException(
            status_code=502,
            detail=f"No se pudieron generar las recetas ({str(error)[:140]}).",
        )

    return {"recetas": recetas, "mensaje": ""}