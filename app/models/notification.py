from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship


class Notification(SQLModel, table=True):
    __tablename__ = "notifications"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    pantry_item_id: Optional[int] = Field(default=None, foreign_key="pantry_items.id")

    tipo: str  # "por_caducar" o "agotado"
    mensaje: str
    leida: bool = Field(default=False)
    fecha_creada: datetime = Field(default_factory=datetime.utcnow)

    user: Optional["User"] = Relationship(back_populates="notifications")
    