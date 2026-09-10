from pydantic import BaseModel, EmailStr


class UserRegister(BaseModel):
    nombre: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    nombre: str
    email: str

    class Config:
        from_attributes = True

from datetime import date
from typing import Optional


class PantryItemCreate(BaseModel):
    nombre_detectado: str
    cantidad: float
    unidad: str
    category_id: Optional[int] = None
    fecha_caducidad_manual: Optional[date] = None


class PantryItemUpdate(BaseModel):
    nombre_detectado: Optional[str] = None
    cantidad: Optional[float] = None
    unidad: Optional[str] = None
    estado: Optional[str] = None
    fecha_caducidad_manual: Optional[date] = None


class PantryItemOut(BaseModel):
    id: int
    nombre_detectado: str
    cantidad: float
    unidad: str
    fecha_compra: date
    fecha_caducidad_estimada: Optional[date]
    fecha_caducidad_manual: Optional[date]
    origen: str
    estado: str

    class Config:
        from_attributes = True

class ProductCategoryCreate(BaseModel):
    nombre: str
    tipo: str  # "perecedero_fresco" o "empaquetado"
    dias_vida_util_promedio: Optional[int] = None


class ProductCategoryOut(BaseModel):
    id: int
    nombre: str
    tipo: str
    dias_vida_util_promedio: Optional[int]

    class Config:
        from_attributes = True


class NotificationOut(BaseModel):
    id: int
    tipo: str
    mensaje: str
    leida: bool

    class Config:
        from_attributes = True