from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.models import PantryItem, User
from app.schemas import PantryItemCreate, PantryItemUpdate, PantryItemOut
from app.dependencies import get_current_user

router = APIRouter(prefix="/pantry", tags=["pantry"])


from datetime import date, timedelta
from app.models import ProductCategory

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