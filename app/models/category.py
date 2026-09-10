from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship


class ProductCategory(SQLModel, table=True):
    __tablename__ = "product_categories"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(unique=True, index=True)
    tipo: str  # "perecedero_fresco" o "empaquetado"
    dias_vida_util_promedio: Optional[int] = None  # solo aplica a perecederos

    pantry_items: List["PantryItem"] = Relationship(back_populates="category")
    shopping_list_items: List["ShoppingListItem"] = Relationship(back_populates="category")
    