from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship


class ShoppingListItem(SQLModel, table=True):
    __tablename__ = "shopping_list"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    category_id: Optional[int] = Field(default=None, foreign_key="product_categories.id")

    nombre_producto: str
    cantidad_sugerida: Optional[float] = None
    origen: str  # "agotado", "sugerencia_ia", "manual"
    estado: str = Field(default="pendiente")  # "pendiente", "comprado"
    fecha_agregado: datetime = Field(default_factory=datetime.utcnow)

    user: Optional["User"] = Relationship(back_populates="shopping_list_items")
    category: Optional["ProductCategory"] = Relationship(back_populates="shopping_list_items")