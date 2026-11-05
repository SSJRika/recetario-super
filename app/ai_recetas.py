import json
import re
import uuid

from app.ai_vision import model

# Ingredientes que se asume que siempre hay en casa
BASICOS = {"sal", "agua", "aceite", "pimienta", "sal al gusto", "pimienta al gusto"}

INTENTOS = 3


def _prompt(ingredientes, cantidad):
    lineas = []

    for i in ingredientes:
        extra = ""

        if i["dias_restantes"] is not None:
            extra = f" (caduca en {i['dias_restantes']} día(s))"

        lineas.append(f"- {i['nombre']}: {i['cantidad']:g} {i['unidad']}{extra}")

    lista = "\n".join(lineas)

    return (
        "Eres un cocinero casero mexicano. Estos son los ingredientes que la "
        "persona tiene en su refrigerador y despensa:\n"
        f"{lista}\n\n"
        f"SIEMPRE crea exactamente {cantidad} recetas distintas, realistas y "
        "fáciles de preparar, aunque haya pocos ingredientes o sean productos "
        "enlatados o empaquetados. Usa principalmente esos ingredientes y da "
        "prioridad a los que caducan primero; los que no dicen fecha también "
        "se pueden usar. Las cantidades son aproximadas: asume que alcanza "
        "para cocinar al menos una porción con cada producto. Puedes suponer "
        "que siempre hay agua, sal, pimienta y aceite. Cada receta puede "
        "incluir como máximo 3 ingredientes que NO estén en la lista (son "
        "los que le faltan a la persona).\n\n"
        "Responde SOLO un JSON con este formato exacto, sin texto adicional "
        "ni bloque de código:\n"
        '{"recetas": [{"titulo": "...", "emoji": "🍳", '
        '"descripcion": "una frase corta", "tiempo_minutos": 20, '
        '"porciones": 2, '
        '"ingredientes": [{"nombre": "huevo", "en_refri": true}], '
        '"pasos": ["..."]}]}\n\n'
        "Reglas:\n"
        "- nombre de cada ingrediente: simple, en español y en minúsculas, "
        "sin cantidades.\n"
        "- en_refri es true solo si el ingrediente está en la lista de arriba "
        "o es agua, sal, pimienta o aceite; false si le falta.\n"
        "- pasos: entre 4 y 8 pasos cortos y claros.\n"
        "- emoji: uno solo que represente el platillo."
    )


def _coincide(nombre, nombres_refri):
    if nombre in BASICOS:
        return True

    for n in nombres_refri:
        if len(n) >= 3 and (n in nombre or nombre in n):
            return True

    return False


def _primero(diccionario, claves, defecto=None):
    for clave in claves:
        if diccionario.get(clave) not in (None, "", []):
            return diccionario[clave]

    return defecto


def _entero(valor, defecto):
    coincidencia = re.search(r"\d+", str(valor))

    if not coincidencia:
        return defecto

    return max(1, int(coincidencia.group()))


def _normalizar(data, nombres_refri):
    if isinstance(data, dict):
        data = _primero(data, ["recetas", "recipes"], [])

    if not isinstance(data, list):
        return []

    resultado = []

    for r in data:
        if not isinstance(r, dict):
            continue

        titulo = str(
            _primero(r, ["titulo", "título", "nombre", "title"], "")
        ).strip()

        pasos_crudos = _primero(
            r,
            ["pasos", "preparacion", "preparación", "instrucciones", "steps"],
            [],
        )

        if isinstance(pasos_crudos, str):
            pasos_crudos = [
                p for p in re.split(r"\n+|(?<=\.)\s+", pasos_crudos) if p
            ]

        pasos = [
            re.sub(r"^\s*\d+[\.\)]\s*", "", str(p)).strip()
            for p in pasos_crudos
            if str(p).strip()
        ]

        ingredientes = []

        for ing in _primero(r, ["ingredientes", "ingredients"], []):
            if isinstance(ing, dict):
                nombre = str(
                    _primero(ing, ["nombre", "ingrediente", "name"], "")
                ).strip().lower()
                declarado = bool(ing.get("en_refri"))
            else:
                nombre = str(ing).strip().lower()
                declarado = False

            if not nombre:
                continue

            ingredientes.append({
                "nombre": nombre,
                "en_refri": declarado or _coincide(nombre, nombres_refri),
            })

        if not titulo or not pasos or not ingredientes:
            continue

        minutos = _entero(
            _primero(r, ["tiempo_minutos", "tiempo", "minutos"], 30), 30
        )
        porciones = _entero(_primero(r, ["porciones", "raciones"], 2), 2)

        resultado.append({
            "id": uuid.uuid4().hex[:10],
            "nombre": titulo,
            "emoji": str(r.get("emoji") or "🍽️").strip()[:4] or "🍽️",
            "descripcion": str(r.get("descripcion", "")).strip(),
            "tiempo": f"{minutos} minutos",
            "porciones": porciones,
            "ingredientes": ingredientes,
            "pasos": pasos,
        })

    return resultado


def _extraer_json(texto):
    """Obtiene el JSON aunque venga con ```json o con texto alrededor."""
    texto = texto.strip()
    texto = re.sub(r"^```(?:json)?\s*|\s*```$", "", texto)

    try:
        return json.loads(texto)
    except ValueError:
        pass

    inicio = min(
        (i for i in (texto.find("{"), texto.find("[")) if i != -1),
        default=-1,
    )
    fin = max(texto.rfind("}"), texto.rfind("]"))

    if inicio == -1 or fin <= inicio:
        raise ValueError("la respuesta no contiene JSON")

    return json.loads(texto[inicio:fin + 1])


def _leer_texto(respuesta):
    """Devuelve (texto, motivo). El texto va vacío si la IA no respondió."""
    try:
        return respuesta.text, ""
    except Exception:
        pass

    motivo = "respuesta vacía"

    try:
        candidato = respuesta.candidates[0]
        motivo = f"finish_reason={candidato.finish_reason}"
        partes = "".join(
            getattr(p, "text", "") for p in candidato.content.parts
        )

        if partes:
            return partes, motivo

    except Exception:
        pass

    try:
        if respuesta.prompt_feedback:
            motivo += f" · {respuesta.prompt_feedback}"
    except Exception:
        pass

    return "", motivo


def generar_recetas(ingredientes, cantidad=3):
    """ingredientes: lista de dicts con nombre, cantidad, unidad, dias_restantes."""
    nombres = [i["nombre"].strip().lower() for i in ingredientes]
    prompt = _prompt(ingredientes, cantidad)
    motivo = ""

    for intento in range(1, INTENTOS + 1):
        try:
            respuesta = model.generate_content(
                prompt,
                generation_config={
                    "response_mime_type": "application/json",
                    "temperature": 0.7,
                    "max_output_tokens": 8192,
                },
            )
        except Exception as error:
            motivo = f"error de la IA: {str(error)[:160]}"
            print(f"[recetas] intento {intento}: {motivo}")
            continue

        texto, motivo = _leer_texto(respuesta)

        if not texto:
            print(f"[recetas] intento {intento}: sin texto ({motivo})")
            continue

        try:
            recetas = _normalizar(_extraer_json(texto), nombres)
        except ValueError as error:
            motivo = f"JSON inválido ({error})"
            print(f"[recetas] intento {intento}: {motivo}")
            print(f"[recetas] respuesta cruda: {texto[:400]!r}")
            continue

        if recetas:
            return recetas

        motivo = "la IA respondió pero sin recetas válidas"
        print(f"[recetas] intento {intento}: {motivo}")
        print(f"[recetas] respuesta cruda: {texto[:400]!r}")

    raise RuntimeError(motivo or "la IA no devolvió recetas")