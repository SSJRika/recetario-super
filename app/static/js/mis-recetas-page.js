/* ==========================================
   FOOD-RANEO - PÁGINA MIS RECETAS (IA)
   Las recetas las genera la IA con lo que hay
   en el refrigerador del usuario.
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    const CLAVE_FAVORITOS = "food-raneo-recetas-favoritas-ia";
    const CLAVE_ULTIMAS = "food-raneo-recetas-ia-ultimas";

    const $ = id => document.getElementById(id);

    function crear(tipo, clase, texto) {
        const elemento = document.createElement(tipo);

        if (clase) elemento.className = clase;

        if (texto !== undefined) {
            elemento.textContent = texto;
        }

        return elemento;
    }

    function esReceta(dato) {
        return (
            dato &&
            typeof dato.id === "string" &&
            typeof dato.nombre === "string" &&
            Array.isArray(dato.ingredientes) &&
            Array.isArray(dato.pasos)
        );
    }

    function leer(clave) {
        try {
            const datos = JSON.parse(
                localStorage.getItem(clave) || "[]"
            );

            return Array.isArray(datos)
                ? datos.filter(esReceta)
                : [];

        } catch {
            return [];
        }
    }

    function guardar(clave, valor) {
        try {
            localStorage.setItem(clave, JSON.stringify(valor));
        } catch {
            /* sin espacio o navegador restringido */
        }
    }

    let recetas = leer(CLAVE_ULTIMAS);
    let favoritos = leer(CLAVE_FAVORITOS);

    const esFavorita = id => favoritos.some(r => r.id === id);

    function faltantes(receta) {
        return receta.ingredientes.filter(i => !i.en_refri);
    }

    function cambiarFavorito(receta) {
        if (esFavorita(receta.id)) {
            favoritos = favoritos.filter(r => r.id !== receta.id);
        } else {
            favoritos.push(receta);
        }

        guardar(CLAVE_FAVORITOS, favoritos);
        renderizar();
    }

    /* DETALLE */

    function abrirDetalle(receta) {
        $("detalle-receta-emoji").textContent = receta.emoji || "🍽️";
        $("detalle-receta-titulo").textContent = receta.nombre;

        $("detalle-receta-tiempo").textContent =
            "Tiempo estimado: " + receta.tiempo +
            (receta.porciones
                ? " · " + receta.porciones + " porciones"
                : "");

        const ingredientes = $("detalle-receta-ingredientes");
        const pasos = $("detalle-receta-pasos");
        const acciones = $("detalle-receta-acciones");

        ingredientes.replaceChildren();
        pasos.replaceChildren();
        acciones.replaceChildren();

        receta.ingredientes.forEach(item => {
            const fila = crear("li", "", item.nombre);

            if (!item.en_refri) {
                const aviso = crear("span", "", " · te falta");

                aviso.style.cssText =
                    "color:#b98a3e;font-weight:600;";

                fila.append(aviso);
            }

            ingredientes.append(fila);
        });

        receta.pasos.forEach(paso => {
            pasos.append(crear("li", "", paso));
        });

        const faltan = faltantes(receta);

        if (faltan.length > 0) {
            const aviso = crear(
                "p",
                "",
                "Te falta: " +
                    faltan.map(i => i.nombre).join(", ") +
                    ". ¿Quieres añadirlo al carrito?"
            );

            aviso.style.cssText =
                "margin:16px 0 8px;font-weight:600;color:#7a5a1e;";

            const boton = crear(
                "button",
                "extra-boton",
                "🛒 Sí, agregar al carrito"
            );

            boton.type = "button";

            boton.addEventListener("click", async () => {
                boton.disabled = true;
                boton.textContent = "Agregando...";

                let agregados = 0;

                for (const item of faltan) {
                    const respuesta = await apiFetch("/shopping-list/", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            nombre_producto: item.nombre
                        })
                    });

                    if (respuesta && respuesta.ok) agregados++;
                }

                if (agregados === faltan.length) {
                    boton.textContent = "✓ Agregado al carrito";
                    aviso.textContent =
                        "Listo, lo agregamos a tu carrito.";
                } else {
                    boton.disabled = false;
                    boton.textContent =
                        "Reintentar (" + agregados + " de " +
                        faltan.length + " agregados)";
                }
            });

            acciones.append(aviso, boton);
        } else {
            const completo = crear(
                "p",
                "",
                "✅ Tienes todos los ingredientes."
            );

            completo.style.cssText =
                "margin:16px 0 0;font-weight:600;color:#2f5233;";

            acciones.append(completo);
        }

        $("detalle-receta-extra").showModal();
    }

    /* TARJETAS */

    function crearTarjeta(receta) {
        const tarjeta = crear("article", "extra-receta-card");

        const ver = crear("button", "extra-boton", "Ver receta");

        ver.type = "button";
        ver.addEventListener("click", () => abrirDetalle(receta));

        const favorito = crear(
            "button",
            "extra-boton-secundario",
            esFavorita(receta.id)
                ? "♥ Quitar favorito"
                : "♡ Guardar receta"
        );

        favorito.type = "button";
        favorito.addEventListener("click", () => cambiarFavorito(receta));

        const acciones = crear("div", "extra-acciones");

        acciones.append(ver, favorito);

        const faltan = faltantes(receta).length;

        tarjeta.append(
            crear("div", "extra-receta-emoji", receta.emoji || "🍽️"),
            crear("h3", "", receta.nombre),
            crear("p", "", receta.descripcion || ""),
            crear("span", "extra-tiempo", "⏱ " + receta.tiempo),
            crear(
                "span",
                "extra-tiempo",
                faltan === 0
                    ? "✅ Tienes todo"
                    : "🛒 Te faltan " + faltan
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

        if (recetas.length === 0) {
            catalogo.append(
                crear(
                    "p",
                    "extra-vacio",
                    "Todavía no has generado recetas. " +
                    "Toca «Generar recetas» para crear ideas " +
                    "con lo que tienes en tu refrigerador."
                )
            );
        } else {
            recetas.forEach(receta => {
                catalogo.append(crearTarjeta(receta));
            });
        }

        $("contador-favoritos").textContent =
            favoritos.length +
            (favoritos.length === 1 ? " favorita" : " favoritas");

        if (favoritos.length === 0) {
            guardadas.append(
                crear(
                    "p",
                    "extra-vacio",
                    "Todavía no tienes recetas favoritas. " +
                    "Guarda alguna de las generadas."
                )
            );
        } else {
            favoritos.forEach(receta => {
                guardadas.append(crearTarjeta(receta));
            });
        }
    }

    /* GENERAR CON IA */

    async function generar() {
        const boton = $("generar-recetas");
        const estado = $("estado-recetas");

        if (typeof apiFetch !== "function") {
            estado.textContent =
                "Inicia sesión para generar recetas.";
            return;
        }

        boton.disabled = true;
        estado.textContent =
            "Generando recetas con lo que tienes en tu refrigerador...";

        try {
            const respuesta = await apiFetch("/recetas/generar", {
                method: "POST"
            });

            if (!respuesta) return;

            if (!respuesta.ok) {
                let detalle = "";

                try {
                    detalle = (await respuesta.json()).detail || "";
                } catch {
                    /* sin detalle */
                }

                throw new Error(
                    detalle ||
                    "No se pudieron generar las recetas. " +
                    "Intenta de nuevo en un momento."
                );
            }

            const datos = await respuesta.json();
            const nuevas = (datos.recetas || []).filter(esReceta);

            if (nuevas.length === 0) {
                estado.textContent =
                    datos.mensaje ||
                    "No se pudieron generar recetas esta vez.";
                return;
            }

            recetas = nuevas;
            guardar(CLAVE_ULTIMAS, recetas);
            estado.textContent = "";
            renderizar();

        } catch (error) {
            estado.textContent = error.message;

        } finally {
            boton.disabled = false;
        }
    }

    $("generar-recetas").addEventListener("click", generar);

    $("cerrar-receta-extra").addEventListener(
        "click",
        () => $("detalle-receta-extra").close()
    );

    $("detalle-receta-extra").addEventListener(
        "click",
        evento => {
            if (evento.target === $("detalle-receta-extra")) {
                $("detalle-receta-extra").close();
            }
        }
    );

    if (typeof requireAuth === "function") {
        requireAuth();
    }

    renderizar();

});