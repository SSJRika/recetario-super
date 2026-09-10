from typing import Optional, List
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    email: str = Field(unique=True, index=True)
    password_hash: str
    fecha_registro: datetime = Field(default_factory=datetime.utcnow)

    pantry_items: List["PantryItem"] = Relationship(back_populates="user")
    shopping_list_items: List["ShoppingListItem"] = Relationship(back_populates="user")
    notifications: List["Notification"] = Relationship(back_populates="user")
    