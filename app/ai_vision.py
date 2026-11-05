import os
import json
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Se puede cambiar el modelo desde .env con GEMINI_MODEL=...
NOMBRE_MODELO = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")
model = genai.GenerativeModel(NOMBRE_MODELO)

MAX_PRODUCTOS = 40

PROMPT_MULTIPLE = (
    "Analiza esta foto de productos de despensa, supermercado o cocina. "
    "Lista CADA alimento o bebida distinto que se vea, uno por uno. "
    "Puede haber uno solo o muchos (hasta 40).\n\n"
    "Responde SOLO un JSON con este formato exacto, sin texto adicional ni "
    "bloque de código:\n"
    '{"productos": [{"nombre": "...", "cantidad": 1, "dias_vida_util": null}]}\n\n'
    "Reglas:\n"
    "- Enumera cada producto por separado. NUNCA agrupes varios productos "
    "bajo un nombre general como despensa, comida, alimentos, productos o "
    "abarrotes.\n"
    "- IGNORA todo lo que no se coma ni se beba: papel higiénico, pasta "
    "dental, jabón, detergente, shampoo, productos de limpieza o higiene, "
    "cajas de cartón, bolsas, platos, utensilios y cualquier otro objeto.\n"
    "- nombre: nombre genérico en español, en minúsculas, sin marca ni "
    "presentación (por ejemplo: arroz inflado, frijoles refritos, sal, atún, "
    "manzana, plátano).\n"
    "- cantidad: número entero de unidades de ese mismo producto que se ven, "
    "mínimo 1. Si hay tres frutas distintas, son tres productos distintos.\n"
    "- dias_vida_util: número entero de días que dura fresco a partir de hoy "
    "si es fruta, verdura, carne, pan u otro perecedero SIN fecha impresa; "
    "usa null si es un producto empaquetado, enlatado o embotellado que trae "
    "fecha de caducidad impresa.\n"
    "- No repitas el mismo producto en varias entradas."
)

# Nombres demasiado generales: el modelo a veces agrupa todo en uno solo.
GENERICOS = {
    "despensa", "comida", "alimentos", "alimento", "productos", "producto",
    "abarrotes", "víveres", "viveres", "canasta", "surtido", "mercancía",
    "mercancia", "compras", "mandado", "caja", "bolsa", "cartón", "carton",
}

# Palabras que delatan objetos que no se comen ni se beben.
NO_COMESTIBLES = {
    "papel", "higiénico", "higienico", "jabón", "jabon", "detergente",
    "shampoo", "champú", "champu", "suavizante", "cloro", "limpiador",
    "desodorante", "toalla", "toallas", "pañal", "pañales", "servilleta",
    "servilletas", "cepillo", "dentífrico", "dentifrico", "enjuague",
}


def _es_valido(nombre):
    if nombre in GENERICOS:
        return False

    if "pasta dental" in nombre or "crema dental" in nombre:
        return False

    return not (set(nombre.split()) & NO_COMESTIBLES)


def _normalizar(data):
    """Limpia la respuesta del modelo y devuelve una lista de productos válidos."""
    if isinstance(data, dict):
        data = data.get("productos", [])

    if not isinstance(data, list):
        return []

    vistos = {}

    for p in data:
        if not isinstance(p, dict):
            continue

        nombre = str(p.get("nombre", "")).strip().lower()

        if not nombre or not _es_valido(nombre):
            continue

        try:
            cantidad = max(1, int(p.get("cantidad", 1)))
        except (TypeError, ValueError):
            cantidad = 1

        try:
            dias = int(p.get("dias_vida_util"))
            dias = dias if dias > 0 else None
        except (TypeError, ValueError):
            dias = None

        if nombre in vistos:
            vistos[nombre]["cantidad"] += cantidad
        else:
            vistos[nombre] = {
                "nombre": nombre,
                "cantidad": cantidad,
                "dias_vida_util": dias,
            }

    return list(vistos.values())[:MAX_PRODUCTOS]


def detectar_productos(imagen_bytes: bytes, media_type: str = "image/jpeg"):
    """Detecta uno o varios productos en una misma foto."""
    response = model.generate_content(
        [
            {"mime_type": media_type, "data": imagen_bytes},
            PROMPT_MULTIPLE,
        ],
        generation_config={
            "response_mime_type": "application/json",
            "temperature": 0.2,
        },
    )

    try:
        data = json.loads(response.text)
    except (ValueError, TypeError):
        return []

    return _normalizar(data)


def detectar_producto(imagen_bytes: bytes, media_type: str = "image/jpeg"):
    """Versión de un solo producto (la usa el endpoint /pantry/detectar-foto)."""
    productos = detectar_productos(imagen_bytes, media_type)

    if not productos:
        return "", None

    primero = productos[0]
    return primero["nombre"], primero["dias_vida_util"]