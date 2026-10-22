
(() => {
    "use strict";

    const CLAVE = "food-raneo-refrigerador-demo-v1";

    const $ = id => document.getElementById(id);

    /* EMOJIS DE ALIMENTOS */

    const emojis = {
        jitomate: "🍅",
        tomate: "🍅",
        cebolla: "🧅",
        papa: "🥔",
        zanahoria: "🥕",
        lechuga: "🥬",
        huevo: "🥚",
        queso: "🧀",
        leche: "🥛",
        pollo: "🍗",
        arroz: "🍚",
        pasta: "🍝",
        aguacate: "🥑",
        manzana: "🍎",
        pepino: "🥒",
        pan: "🍞",
        ajo: "🧄",
        platano: "🍌",
        limon: "🍋",
        fresa: "🍓",
        brocoli: "🥦",
        carne: "🥩"
    };

    function normalizar(texto) {
        return texto
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();
    }

    function emojiDe(nombre) {
        return emojis[normalizar(nombre)] || "🥫";
    }

    
/* ==========================================
   CLASIFICACIÓN POR CADUCIDAD
========================================== */

const DIAS_AVISO = 3;

function obtenerEstadoCaducidad(fecha) {

    if (!fecha) {
        return {
            tipo: "sin-fecha",
            texto: "Sin fecha",
            dias: null
        };
    }

    const partes = fecha.split("-").map(Number);

    if (
        partes.length !== 3 ||
        partes.some(numero => !Number.isInteger(numero))
    ) {
        return {
            tipo: "sin-fecha",
            texto: "Sin fecha válida",
            dias: null
        };
    }

    const [anio, mes, dia] = partes;

    const fechaUTC = Date.UTC(anio, mes - 1, dia);
    const comprobacion = new Date(fechaUTC);

    if (
        comprobacion.getUTCFullYear() !== anio ||
        comprobacion.getUTCMonth() !== mes - 1 ||
        comprobacion.getUTCDate() !== dia
    ) {
        return {
            tipo: "sin-fecha",
            texto: "Sin fecha válida",
            dias: null
        };
    }

    const hoy = new Date();

    const hoyUTC = Date.UTC(
        hoy.getFullYear(),
        hoy.getMonth(),
        hoy.getDate()
    );

    const dias = Math.round(
        (fechaUTC - hoyUTC) / 86400000
    );

    if (dias < 0) {
        return {
            tipo: "caducado",
            texto: "Caducado",
            dias
        };
    }

    if (dias === 0) {
        return {
            tipo: "hoy",
            texto: "Caduca hoy",
            dias
        };
    }

    if (dias <= DIAS_AVISO) {
        return {
            tipo: "proximo",
            texto: `Caduca en ${dias} día${dias === 1 ? "" : "s"}`,
            dias
        };
    }

    return {
        tipo: "fresco",
        texto: `Fresco · ${dias} días`,
        dias
    };
}

function fechaLegible(fecha) {
    if (!fecha) return "Sin fecha";

    const [anio, mes, dia] = fecha.split("-");

    return `${dia}/${mes}/${anio}`;
}


    /* CATÁLOGO DE RECETAS */

    const recetas = [
        {
            nombre: "Ensalada fresca",
            emoji: "🥗",
            tiempo: "15 min",
            ingredientes: [
                "jitomate",
                "lechuga",
                "pepino"
            ],
            pasos: [
                "Lava y desinfecta las verduras.",
                "Corta los ingredientes.",
                "Mézclalos y sazona al gusto."
            ]
        },
        {
            nombre: "Huevos con jitomate",
            emoji: "🍳",
            tiempo: "15 min",
            ingredientes: [
                "huevo",
                "jitomate",
                "cebolla"
            ],
            pasos: [
                "Pica jitomate y cebolla.",
                "Sofríe las verduras.",
                "Agrega los huevos y cocina hasta que estén listos."
            ]
        },
        {
            nombre: "Pasta con tomate",
            emoji: "🍝",
            tiempo: "25 min",
            ingredientes: [
                "pasta",
                "jitomate",
                "ajo"
            ],
            pasos: [
                "Cuece la pasta.",
                "Sofríe ajo y jitomate para hacer la salsa.",
                "Mezcla con la pasta y sirve."
            ]
        },
        {
            nombre: "Sándwich de queso",
            emoji: "🥪",
            tiempo: "10 min",
            ingredientes: [
                "pan",
                "queso",
                "jitomate"
            ],
            pasos: [
                "Corta el pan.",
                "Añade queso y jitomate.",
                "Tuesta si lo prefieres y sirve."
            ]
        },
        {
            nombre: "Arroz con pollo",
            emoji: "🍚",
            tiempo: "35 min",
            ingredientes: [
                "arroz",
                "pollo",
                "zanahoria"
            ],
            pasos: [
                "Cuece el arroz.",
                "Cocina el pollo completamente.",
                "Agrega la zanahoria y mezcla."
            ]
        },
        {
            nombre: "Tostada de aguacate",
            emoji: "🥑",
            tiempo: "10 min",
            ingredientes: [
                "pan",
                "aguacate",
                "huevo"
            ],
            pasos: [
                "Tuesta el pan.",
                "Machaca el aguacate.",
                "Cocina el huevo y coloca todo sobre el pan."
            ]
        },
        {
            nombre: "Papas con cebolla",
            emoji: "🥔",
            tiempo: "25 min",
            ingredientes: [
                "papa",
                "cebolla"
            ],
            pasos: [
                "Lava y corta las papas.",
                "Cocina las papas hasta que estén suaves.",
                "Sofríe la cebolla y mezcla."
            ]
        }
    ];

    /* INVENTARIO LOCAL */

    let productos = [];

    try {
        const datos = JSON.parse(
            localStorage.getItem(CLAVE) || "[]"
        );

        if (Array.isArray(datos)) {
            productos = datos.filter(
                item =>
                    item &&
                    typeof item.nombre === "string" &&
                    Number.isFinite(item.cantidad)
            );
        }
    } catch (error) {
        productos = [];
    }

    function guardar() {
        try {
            localStorage.setItem(
                CLAVE,
                JSON.stringify(productos)
            );
            return true;
        } catch (error) {
            return false;
        }
    }

    function elemento(etiqueta, clase, texto) {
        const el = document.createElement(etiqueta);

        if (clase) {
            el.className = clase;
        }

        if (texto !== undefined) {
            el.textContent = texto;
        }

        return el;
    }

    const formulario = $("form-alimento");
    const inputFoto = $("foto-alimento");

    let urlFoto = null;

    /* FOTOGRAFÍA */

    function limpiarFoto() {
        if (urlFoto) {
            URL.revokeObjectURL(urlFoto);
        }

        urlFoto = null;

        $("imagen-previa").removeAttribute("src");
        $("vista-foto").hidden = true;
        inputFoto.value = "";
    }

    inputFoto.addEventListener("change", () => {
        if (urlFoto) {
            URL.revokeObjectURL(urlFoto);
            urlFoto = null;
        }

        $("vista-foto").hidden = true;

        const archivo = inputFoto.files[0];

        if (!archivo) return;

        const tiposPermitidos = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (
            !tiposPermitidos.includes(archivo.type) ||
            archivo.size > 3 * 1024 * 1024
        ) {
            $("registro-mensaje").textContent =
                "Usa una imagen JPG, PNG o WEBP de máximo 3 MB.";

            inputFoto.value = "";
            return;
        }

        urlFoto = URL.createObjectURL(archivo);

        $("imagen-previa").src = urlFoto;
        $("vista-foto").hidden = false;

        $("registro-mensaje").textContent =
            "Foto seleccionada. Escribe el nombre y la cantidad.";
    });

    $("quitar-foto").addEventListener(
        "click",
        limpiarFoto
    );

    /* AGREGAR ALIMENTO */

    formulario.addEventListener("submit", evento => {
        evento.preventDefault();

        const nombre = $("nombre-alimento").value.trim();

        const cantidad = Number(
            $("cantidad-alimento").value
        );

        const unidad = $("unidad-alimento").value;
        const caducidad = $("caducidad-alimento").value;

        if (
            !nombre ||
            !Number.isFinite(cantidad) ||
            cantidad <= 0 ||
            cantidad > 9999
        ) {
            $("registro-mensaje").textContent =
                "Escribe un alimento y una cantidad válida.";
            return;
        }

        const unidades = ["pzs", "kg", "g", "L", "ml"];

        if (!unidades.includes(unidad)) return;

        const id =
            typeof crypto !== "undefined" &&
            crypto.randomUUID
                ? crypto.randomUUID()
                : String(Date.now()) + "-" + Math.random();


        productos.push({
            id,
            nombre,
            cantidad,
            unidad,
            caducidad
        });

        const persistido = guardar();

        formulario.reset();
        $("cantidad-alimento").value = "1";

        limpiarFoto();
        renderizar();

        $("registro-mensaje").textContent =
            persistido
                ? "Alimento agregado a tu refrigerador."
                : "Alimento agregado temporalmente; no se pudo guardar en este navegador.";
    });

    /* DIBUJAR REFRIGERADOR */

    function renderizar() {
            
/* CALCULAR RESUMEN DE CADUCIDAD */

const resumen = {
    fresco: 0,
    proximo: 0,
    hoy: 0,
    caducado: 0
};

productos.forEach(producto => {
    const estado = obtenerEstadoCaducidad(
        producto.caducidad
    );

    if (estado.tipo in resumen) {
        resumen[estado.tipo]++;
    }
});

$("total-frescos").textContent = resumen.fresco;

$("total-proximos").textContent =
    resumen.proximo + resumen.hoy;

$("total-caducados").textContent =
    resumen.caducado;

/* FILTRAR INVENTARIO */

const filtro = $("filtro-caducidad").value;

const productosVisibles = productos.filter(producto => {
    if (filtro === "todos") return true;

    return obtenerEstadoCaducidad(
        producto.caducidad
    ).tipo === filtro;
});

        const estantes = $("refri-estantes");
        const lista = $("lista-alimentos");

        estantes.replaceChildren();
        lista.replaceChildren();

        $("contador-refri").textContent =
            productos.length +
            (productos.length === 1
                ? " producto"
                : " productos");

        if (productosVisibles.length === 0) {
            estantes.append(
                elemento(
                    "p",
                    "refri-vacio",
                    "Tu refrigerador está vacío. ¡Agrega tu primer alimento!"
                )
            );

            lista.append(
                elemento(
                    "p",
                    "refri-sub",
                    "Todavía no tienes alimentos registrados."
                )
            );
        }

        productosVisibles.forEach(producto => {
            const tarjeta = elemento(
                "div",
                "refri-producto"
            );


            const estado = obtenerEstadoCaducidad(
                producto.caducidad
            );

            tarjeta.classList.add(
                "estado-" + estado.tipo
            );

            tarjeta.append(
                elemento(
                    "span",
                    "emoji",
                    emojiDe(producto.nombre)
                ),

                elemento(
                    "strong",
                    "",
                    producto.nombre
                ),

                elemento(
                    "small",
                    "",
                    `${producto.cantidad} ${producto.unidad}`
                ),

                elemento(
                    "span",
                    "refri-etiqueta estado-" + estado.tipo,
                    estado.texto
                )
            );


            estantes.append(tarjeta);

            /* FILA DEL INVENTARIO */

            const fila = elemento("div", "refri-fila");
            const datos = elemento("div", "datos");

            const quitar = elemento(
                "button",
                "",
                "Quitar"
            );

            quitar.type = "button";

            quitar.setAttribute(
                "aria-label",
                `Quitar ${producto.nombre}`
            );

            quitar.addEventListener("click", () => {
                productos = productos.filter(
                    item => item.id !== producto.id
                );

                guardar();
                renderizar();
            });

          
            datos.append(
                elemento(
                    "strong",
                    "",
                    producto.nombre
                ),

                elemento(
                    "small",
                    "",
                    `${producto.cantidad} ${producto.unidad}`
                ),

                elemento(
                    "small",
                    "",
                    `Caducidad: ${fechaLegible(producto.caducidad)}`
                ),

                elemento(
                    "span",
                    "refri-etiqueta estado-" + estado.tipo,
                    estado.texto
                )
            );


const consumido = elemento(
    "button",
    "refri-btn-consumido",
    "🛒 Consumido"
);

consumido.type = "button";

consumido.addEventListener("click", async () => {

    if (consumido.disabled) return;

    consumido.disabled = true;
    consumido.textContent = "Enviando...";

    try {
        if (typeof apiFetch !== "function") {
            throw new Error(
                "No está disponible la conexión con el carrito."
            );
        }

        const respuesta = await apiFetch("/shopping-list/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nombre_producto: producto.nombre
            })
        });

        if (!respuesta || !respuesta.ok) {
            throw new Error(
                "No se pudo agregar el producto al carrito."
            );
        }

        productos = productos.filter(
            item => item.id !== producto.id
        );

        guardar();
        renderizar();

        $("registro-mensaje").textContent =
            `${producto.nombre} se agregó al carrito de compras.`;

    } catch (error) {
        $("registro-mensaje").textContent =
            error.message;

        consumido.disabled = false;
        consumido.textContent = "🛒 Consumido";
    }
});

        const acciones = elemento(
            "div",
            "refri-acciones"
        );

        acciones.append(
            consumido,
            quitar
        );

        fila.append(
            elemento(
                "span",
                "mini-emoji",
                emojiDe(producto.nombre)
            ),
            datos,
            acciones
        );

            lista.append(fila);
        });

        mostrarRecetas();
    }

    /* RECOMENDAR RECETAS */

    function mostrarRecetas() {
        const salida = $("resultado-recetas");

        salida.replaceChildren();

        if (productos.length === 0) {
            salida.append(
                elemento(
                    "p",
                    "refri-sin-recetas",
                    "Registra algunos alimentos para descubrir recetas."
                )
            );

            return;
        }


        const disponibles = new Set(
            productos
                .filter(producto => {
                    const estado = obtenerEstadoCaducidad(
                        producto.caducidad
                    );

                    return estado.tipo !== "caducado" &&
                        estado.tipo !== "hoy";
                })
                .map(producto => {

                const nombre = normalizar(producto.nombre);

                return nombre === "tomate"
                    ? "jitomate"
                    : nombre;
            })
        );

        const coincidencias = recetas
            .map(receta => ({
                ...receta,

                coinciden: receta.ingredientes.filter(
                    ingrediente => disponibles.has(ingrediente)
                ),

                faltan: receta.ingredientes.filter(
                    ingrediente => !disponibles.has(ingrediente)
                )
            }))
            .filter(receta => receta.coinciden.length > 0)
            .sort((a, b) =>
                b.coinciden.length / b.ingredientes.length -
                a.coinciden.length / a.ingredientes.length
            );

        if (coincidencias.length === 0) {
            salida.append(
                elemento(
                    "p",
                    "refri-sin-recetas",
                    "Aún no hay coincidencias. Prueba agregar jitomate, huevo, papa o arroz."
                )
            );

            return;
        }

        coincidencias.slice(0, 6).forEach(receta => {
            const tarjeta = elemento(
                "article",
                "refri-receta"
            );

            const boton = elemento(
                "button",
                "refri-secondary",
                "Ver preparación →"
            );

            boton.type = "button";

            boton.addEventListener(
                "click",
                () => abrirReceta(receta)
            );

            tarjeta.append(
                elemento(
                    "span",
                    "receta-emoji",
                    receta.emoji
                ),

                elemento(
                    "h3",
                    "",
                    receta.nombre
                ),

                elemento(
                    "span",
                    "coincidencia",
                    `${receta.coinciden.length} de ${receta.ingredientes.length} ingredientes registrados`
                ),

                elemento(
                    "p",
                    "",
                    receta.faltan.length
                        ? `Te falta: ${receta.faltan.join(", ")}.`
                        : "¡Tienes todos los ingredientes principales!"
                ),

                elemento(
                    "p",
                    "",
                    `⏱️ ${receta.tiempo}`
                ),

                boton
            );

            salida.append(tarjeta);
        });
    }

    /* DETALLE DE RECETA */

    function abrirReceta(receta) {
        $("dialogo-emoji").textContent = receta.emoji;

        $("dialogo-titulo").textContent =
            receta.nombre;

        $("dialogo-tiempo").textContent =
            `Tiempo estimado: ${receta.tiempo}`;

        const ingredientes = $("dialogo-ingredientes");
        const pasos = $("dialogo-pasos");

        ingredientes.replaceChildren();
        pasos.replaceChildren();

        receta.ingredientes.forEach(ingrediente => {
            ingredientes.append(
                elemento("li", "", ingrediente)
            );
        });

        receta.pasos.forEach(paso => {
            pasos.append(
                elemento("li", "", paso)
            );
        });

        $("receta-dialogo").showModal();
    }

    $("cerrar-dialogo").addEventListener(
        "click",
        () => $("receta-dialogo").close()
    );

    $("receta-dialogo").addEventListener(
        "click",
        evento => {
            if (evento.target === $("receta-dialogo")) {
                $("receta-dialogo").close();
            }
        }
    );

    $("actualizar-recetas").addEventListener(
        "click",
        mostrarRecetas
    );

    $("filtro-caducidad").addEventListener(
    "change",
    renderizar
    );

    /* INICIAR */

    renderizar();

})();
