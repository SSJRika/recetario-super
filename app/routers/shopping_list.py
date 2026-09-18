from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.models import ShoppingListItem, User
from app.schemas import ShoppingListItemCreate, ShoppingListItemOut
from app.dependencies import get_current_user

router = APIRouter(prefix="/shopping-list", tags=["shopping-list"])


@router.post("/", response_model=ShoppingListItemOut)
def add_item(
    data: ShoppingListItemCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    item = ShoppingListItem(
        user_id=current_user.id,
        nombre_producto=data.nombre_producto,
        cantidad_sugerida=data.cantidad_sugerida,
        category_id=data.category_id,
        origen="manual",
    )
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@router.get("/", response_model=List[ShoppingListItemOut])
def list_items(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return session.exec(
        select(ShoppingListItem).where(ShoppingListItem.user_id == current_user.id)
    ).all()


@router.patch("/{item_id}/comprado", response_model=ShoppingListItemOut)
def marcar_comprado(
    item_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    item = session.get(ShoppingListItem, item_id)
    if not item or item.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Producto no encontrado en el carrito")

    item.estado = "comprado"
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
    item = session.get(ShoppingListItem, item_id)
    if not item or item.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Producto no encontrado en el carrito")

    session.delete(item)
    session.commit()
    return {"detail": "Eliminado del carrito"}