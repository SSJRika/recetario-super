import os
import json
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-3.5-flash-lite")


def detectar_producto(imagen_bytes: bytes, media_type: str = "image/jpeg"):
    response = model.generate_content(
        [
            {"mime_type": media_type, "data": imagen_bytes},
            (
                "Identifica el producto principal de esta foto de un producto de supermercado o cocina. "
                "Responde SOLO un JSON con este formato exacto, sin texto adicional ni bloque de código: "
                '{"nombre": "<nombre del producto en español, minúsculas, sin marca>", '
                '"dias_vida_util": <número entero de días que dura fresco a partir de hoy si es una fruta, '
                'verdura, o producto perecedero sin fecha impresa; usa null si es un producto empaquetado '
                'que normalmente trae fecha de caducidad impresa (como lácteos, conservas, condimentos)>}'
            ),
        ],
        generation_config={"response_mime_type": "application/json"},
    )
    data = json.loads(response.text)
    nombre = data.get("nombre", "").strip().lower()
    dias_vida_util = data.get("dias_vida_util")
    return nombre, dias_vida_util