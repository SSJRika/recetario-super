from typing import Optional
from datetime import date, datetime
from sqlmodel import SQLModel, Field, Relationship


class PantryItem(SQLModel, table=True):
    __tablename__ = "pantry_items"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    category_id: Optional[int] = Field(default=None, foreign_key="product_categories.id")

    nombre_detectado: str
    cantidad: float
    unidad: str  # "pieza", "kg", "paquete", etc.

    fecha_compra: date = Field(default_factory=date.today)
    fecha_caducidad_estimada: Optional[date] = None
    fecha_caducidad_manual: Optional[date] = None

    origen: str  # "foto_ia" o "manual"
    estado: str = Field(default="activo")  # "activo", "consumido", "caducado"

    creado_en: datetime = Field(default_factory=datetime.utcnow)

    user: Optional["User"] = Relationship(back_populates="pantry_items")
    category: Optional["ProductCategory"] = Relationship(back_populates="pantry_items")