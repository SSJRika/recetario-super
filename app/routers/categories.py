from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.models import ProductCategory
from app.schemas import ProductCategoryCreate, ProductCategoryOut
from app.dependencies import get_current_user

router = APIRouter(prefix="/categories", tags=["categories"])


@router.post("/", response_model=ProductCategoryOut)
def create_category(
    data: ProductCategoryCreate,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user),
):
    existing = session.exec(
        select(ProductCategory).where(ProductCategory.nombre == data.nombre)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Esa categoría ya existe")

    category = ProductCategory(**data.model_dump())
    session.add(category)
    session.commit()
    session.refresh(category)
    return category


@router.get("/", response_model=List[ProductCategoryOut])
def list_categories(
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user),
):
    return session.exec(select(ProductCategory)).all()