
/* ==========================================
   FOOD-RANEO - PÁGINA MIS RECETAS
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    const CLAVE = "food-raneo-recetas-favoritas";

    const recetas = [
        {
            id: "ensalada",
            nombre: "Ensalada fresca",
            emoji: "🥗",
            tiempo: "15 minutos",
            descripcion: "Una ensalada sencilla con verduras frescas.",
            ingredientes: [
                "Lechuga",
                "Jitomate",
                "Pepino",
                "Limón",
                "Sal al gusto"
            ],
            pasos: [
                "Lava y desinfecta las verduras.",
                "Corta el jitomate, la lechuga y el pepino.",
                "Coloca los ingredientes en un recipiente.",
                "Agrega limón y sal al gusto.",
                "Mezcla y sirve."
            ]
        },
        {
            id: "pasta",
            nombre: "Pasta con tomate",
            emoji: "🍝",
            tiempo: "25 minutos",
            descripcion: "Pasta con salsa casera de jitomate.",
            ingredientes: [
                "Pasta",
                "Jitomate",
                "Ajo",
                "Aceite",
                "Sal al gusto"
            ],
            pasos: [
                "Hierve agua y cocina la pasta.",
                "Pica el ajo y el jitomate.",
                "Sofríe el ajo y agrega el jitomate.",
                "Cocina hasta formar una salsa.",
                "Mezcla con la pasta y sirve."
            ]
        },
        {
            id: "desayuno",
            nombre: "Desayuno saludable",
            emoji: "🥑",
            tiempo: "20 minutos",
            descripcion: "Pan tostado con aguacate y huevo.",
            ingredientes: [
                "Pan",
                "Aguacate",
                "Huevo",
                "Sal",
                "Pimienta"
            ],
            pasos: [
                "Tuesta el pan.",
                "Machaca el aguacate.",
                "Cocina el huevo completamente.",
                "Coloca el aguacate sobre el pan.",
                "Agrega el huevo y sazona."
            ]
        },
        {
            id: "huevos",
            nombre: "Huevos con jitomate",
            emoji: "🍳",
            tiempo: "15 minutos",
            descripcion: "Desayuno rápido con huevo y verduras.",
            ingredientes: [
                "Huevo",
                "Jitomate",
                "Cebolla",
                "Aceite",
                "Sal"
            ],
            pasos: [
                "Lava y pica las verduras.",
                "Sofríe la cebolla y el jitomate.",
                "Agrega los huevos.",
                "Cocina completamente y sirve."
            ]
        },
        {
            id: "papas",
            nombre: "Papas con cebolla",
            emoji: "🥔",
            tiempo: "30 minutos",
            descripcion: "Una guarnición económica y deliciosa.",
            ingredientes: [
                "Papa",
                "Cebolla",
                "Aceite",
                "Sal"
            ],
            pasos: [
                "Lava y corta las papas.",
                "Cocínalas hasta que estén suaves.",
                "Corta la cebolla.",
                "Sofríe la cebolla y agrega las papas.",
                "Sazona y sirve."
            ]
        },
        {
            id: "sandwich",
            nombre: "Sándwich de queso",
            emoji: "🥪",
            tiempo: "10 minutos",
            descripcion: "Un sándwich sencillo para cualquier momento.",
            ingredientes: [
                "Pan",
                "Queso",
                "Jitomate",
                "Lechuga"
            ],
            pasos: [
                "Lava las verduras.",
                "Corta el jitomate.",
                "Coloca el queso y las verduras sobre el pan.",
                "Cierra el sándwich y sirve."
            ]
        }
    ];

    const $ = id => document.getElementById(id);

    function leerFavoritos() {
        try {
            const datos = JSON.parse(
                localStorage.getItem(CLAVE) || "[]"
            );

            return Array.isArray(datos)
                ? [...new Set(datos.filter(
                    id => recetas.some(r => r.id === id)
                ))]
                : [];

        } catch {
            return [];
        }
    }

    let favoritos = leerFavoritos();

    function guardarFavoritos() {
        try {
            localStorage.setItem(
                CLAVE,
                JSON.stringify(favoritos)
            );
        } catch {
            alert(
                "No se pudieron guardar los favoritos en este navegador."
            );
        }
    }

    function crear(tipo, clase, texto) {
        const elemento = document.createElement(tipo);

        if (clase) elemento.className = clase;

        if (texto !== undefined) {
            elemento.textContent = texto;
        }

        return elemento;
    }

    function cambiarFavorito(id) {
        if (favoritos.includes(id)) {
            favoritos = favoritos.filter(
                favorito => favorito !== id
            );
        } else {
            favoritos.push(id);
        }

        guardarFavoritos();
        renderizar();
    }

    function abrirDetalle(receta) {
        $("detalle-receta-emoji").textContent =
            receta.emoji;

        $("detalle-receta-titulo").textContent =
            receta.nombre;

        $("detalle-receta-tiempo").textContent =
            "Tiempo estimado: " + receta.tiempo;

        const ingredientes = $(
            "detalle-receta-ingredientes"
        );

        const pasos = $("detalle-receta-pasos");

        ingredientes.replaceChildren();
        pasos.replaceChildren();

        receta.ingredientes.forEach(item => {
            ingredientes.append(
                crear("li", "", item)
            );
        });

        receta.pasos.forEach(paso => {
            pasos.append(
                crear("li", "", paso)
            );
        });

        $("detalle-receta-extra").showModal();
    }

    function crearTarjeta(receta) {
        const tarjeta = crear(
            "article",
            "extra-receta-card"
        );

        const guardada = favoritos.includes(
            receta.id
        );

        const ver = crear(
            "button",
            "extra-boton",
            "Ver receta"
        );

        ver.type = "button";

        ver.addEventListener("click", () => {
            abrirDetalle(receta);
        });

        const favorito = crear(
            "button",
            "extra-boton-secundario",
            guardada
                ? "♥ Quitar favorito"
                : "♡ Guardar receta"
        );

        favorito.type = "button";

        favorito.addEventListener("click", () => {
            cambiarFavorito(receta.id);
        });

        const acciones = crear(
            "div",
            "extra-acciones"
        );

        acciones.append(ver, favorito);

        tarjeta.append(
            crear(
                "div",
                "extra-receta-emoji",
                receta.emoji
            ),

            crear(
                "h3",
                "",
                receta.nombre
            ),

            crear(
                "p",
                "",
                receta.descripcion
            ),

            crear(
                "span",
                "extra-tiempo",
                "⏱ " + receta.tiempo
            ),

            acciones
        );

        return tarjeta;
    }

    function renderizar() {
        const catalogo = $("catalogo-recetas");
        const guardadas = $("recetas-favoritas");

        catalogo.replaceChildren();
        guardadas.replaceChildren();

        recetas.forEach(receta => {
            catalogo.append(
                crearTarjeta(receta)
            );
        });

        const lista = recetas.filter(
            receta => favoritos.includes(receta.id)
        );

        $("contador-favoritos").textContent =
            lista.length +
            (lista.length === 1
                ? " favorita"
                : " favoritas");

        if (lista.length === 0) {
            guardadas.append(
                crear(
                    "p",
                    "extra-vacio",
                    "Todavía no tienes recetas favoritas. Guarda alguna del catálogo."
                )
            );
        } else {
            lista.forEach(receta => {
                guardadas.append(
                    crearTarjeta(receta)
                );
            });
        }
    }

    $("cerrar-receta-extra").addEventListener(
        "click",
        () => $("detalle-receta-extra").close()
    );

    $("detalle-receta-extra").addEventListener(
        "click",
        evento => {
            if (
                evento.target ===
                $("detalle-receta-extra")
            ) {
                $("detalle-receta-extra").close();
            }
        }
    );

    renderizar();

});
