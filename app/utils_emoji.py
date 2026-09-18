EMOJI_MAP = {
    "manzana": "🍎", "plátano": "🍌", "platano": "🍌", "leche": "🥛",
    "mayonesa": "🫙", "huevo": "🥚", "huevos": "🥚", "queso": "🧀",
    "pan": "🍞", "pollo": "🍗", "carne": "🥩", "tomate": "🍅",
    "jitomate": "🍅", "cebolla": "🧅", "papa": "🥔", "zanahoria": "🥕",
    "espinaca": "🥬", "espinacas": "🥬", "naranja": "🍊", "limón": "🍋",
    "limon": "🍋", "yogurt": "🥣", "mantequilla": "🧈", "arroz": "🍚",
    "frijoles": "🫘", "aguacate": "🥑", "uva": "🍇", "uvas": "🍇",
    "fresa": "🍓", "fresas": "🍓", "pescado": "🐟", "agua": "💧",
    "jugo": "🧃", "refresco": "🥤", "cereal": "🥣",
}

def get_emoji(nombre_producto: str) -> str:
    return EMOJI_MAP.get(nombre_producto.strip().lower(), "📦")