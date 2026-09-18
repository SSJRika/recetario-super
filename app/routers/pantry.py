from typing import List
from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.models import PantryItem, User, ProductCategory, ShoppingListItem
from app.schemas import PantryItemCreate, PantryItemUpdate, PantryItemOut
from app.dependencies import get_current_user
from app.utils_emoji import get_emoji

router = APIRouter(prefix="/pantry", tags=["pantry"])


@router.post("/", response_model=PantryItemOut)
def create_item(
    data: PantryItemCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    fecha_estimada = None
    if data.category_id and not data.fecha_caducidad_manual:
        category = session.get(ProductCategory, data.category_id)
        if category and category.dias_vida_util_promedio:
            fecha_estimada = date.today() + timedelta(days=category.dias_vida_util_promedio)

    item = PantryItem(
        user_id=current_user.id,
        nombre_detectado=data.nombre_detectado,
        cantidad=data.cantidad,
        unidad=data.unidad,
        category_id=data.category_id,
        fecha_caducidad_manual=data.fecha_caducidad_manual,
        fecha_caducidad_estimada=fecha_estimada,
        origen="manual",
    )
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@router.get("/", response_model=List[PantryItemOut])
def list_items(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    items = session.exec(
        select(PantryItem).where(PantryItem.user_id == current_user.id)
    ).all()
    return items


@router.get("/refri")
def get_refri(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    items = session.exec(
        select(PantryItem).where(
            PantryItem.user_id == current_user.id,
            PantryItem.estado == "activo",
        )
    ).all()

    resultado = []
    for item in items:
        fecha_relevante = item.fecha_caducidad_manual or item.fecha_caducidad_estimada
        estado_visual = "fresh"
        dias_restantes = None

        if fecha_relevante:
            dias_restantes = (fecha_relevante - date.today()).days
            if dias_restantes < 0:
                estado_visual = "expired"
            elif dias_restantes <= 3:
                estado_visual = "expiring"

        resultado.append({
            "id": item.id,
            "nombre": item.nombre_detectado,
            "emoji": get_emoji(item.nombre_detectado),
            "cantidad": item.cantidad,
            "unidad": item.unidad,
            "estado_visual": estado_visual,
            "dias_restantes": dias_restantes,
            "fecha_caducidad": fecha_relevante.isoformat() if fecha_relevante else None,
        })

    return resultado


@router.get("/{item_id}", response_model=PantryItemOut)
def get_item(
    item_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    item = session.get(PantryItem, item_id)
    if not item or item.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return item


@router.patch("/{item_id}", response_model=PantryItemOut)
def update_item(
    item_id: int,
    data: PantryItemUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    item = session.get(PantryItem, item_id)
    if not item or item.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(item, key, value)

    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@router.delete("/{item_id}")
def delete_item(
    item_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    item = session.get(PantryItem, item_id)
    if not item or item.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    session.delete(item)
    session.commit()
    return {"detail": "Producto eliminado"}


@router.post("/{item_id}/agotar")
def marcar_agotado(
    item_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    item = session.get(PantryItem, item_id)
    if not item or item.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    item.estado = "consumido"
    session.add(item)

    carrito_item = ShoppingListItem(
        user_id=current_user.id,
        nombre_producto=item.nombre_detectado,
        category_id=item.category_id,
        origen="agotado",
    )
    session.add(carrito_item)

    session.commit()
    return {"detail": f"{item.nombre_detectado} marcado como agotado y agregado al carrito"}
from fastapi import File, UploadFile
from app.ai_vision import detectar_producto

@router.post("/detectar-foto")
async def detectar_producto_foto(
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    contenido = await file.read()
    nombre_detectado, dias_vida_util = detectar_producto(contenido, media_type=file.content_type)

    fecha_estimada = None
    if dias_vida_util:
        fecha_estimada = date.today() + timedelta(days=dias_vida_util)

    item = PantryItem(
        user_id=current_user.id,
        nombre_detectado=nombre_detectado,
        cantidad=1,
        unidad="pieza",
        fecha_caducidad_estimada=fecha_estimada,
        origen="foto_ia",
    )
    session.add(item)
    session.commit()
    session.refresh(item)

    return {
        "id": item.id,
        "nombre_detectado": nombre_detectado,
        "dias_vida_util": dias_vida_util,
        "emoji": get_emoji(nombre_detectado),
    }