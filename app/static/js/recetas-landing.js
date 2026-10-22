
document.addEventListener("DOMContentLoaded", () => {

    const recetas = {
        ensalada: {
            titulo: "Ensalada fresca",
            tiempo: "15 minutos",
            imagen: "/static/img/receta-ensalada.jpg",
            descripcion:
                "Una ensalada ligera para aprovechar las verduras de casa.",
            ingredientes: [
                "1 lechuga pequeña",
                "2 tomates",
                "1 pepino",
                "1 zanahoria",
                "1 cucharada de aceite de oliva",
                "Jugo de medio limón",
                "Sal al gusto"
            ],
            pasos: [
                "Lava y desinfecta las verduras.",
                "Corta la lechuga, los tomates y el pepino.",
                "Ralla la zanahoria.",
                "Mezcla todo en un recipiente.",
                "Agrega aceite, limón y sal.",
                "Sirve inmediatamente."
            ]
        },

        pasta: {
            titulo: "Pasta con tomate",
            tiempo: "25 minutos",
            imagen: "/static/img/receta-pasta.jpg",
            descripcion:
                "Una receta práctica con ingredientes fáciles de conseguir.",
            ingredientes: [
                "200 g de pasta",
                "3 tomates",
                "1 diente de ajo",
                "1 cucharada de aceite de oliva",
                "Albahaca al gusto",
                "Sal al gusto"
            ],
            pasos: [
                "Hierve agua con un poco de sal.",
                "Cocina la pasta según las instrucciones del paquete.",
                "Pica los tomates y el ajo.",
                "Sofríe el ajo con aceite.",
                "Agrega el tomate y cocina hasta formar una salsa.",
                "Mezcla la pasta con la salsa.",
                "Sirve con albahaca."
            ]
        },

        desayuno: {
            titulo: "Desayuno saludable",
            tiempo: "20 minutos",
            imagen: "/static/img/receta-desayuno.jpg",
            descripcion:
                "Tostadas con aguacate y huevo para comenzar el día.",
            ingredientes: [
                "2 rebanadas de pan integral",
                "1 aguacate",
                "2 huevos",
                "Jugo de medio limón",
                "Sal y pimienta al gusto"
            ],
            pasos: [
                "Tuesta las rebanadas de pan.",
                "Machaca el aguacate con limón y sal.",
                "Cocina los huevos a tu gusto.",
                "Unta el aguacate sobre el pan.",
                "Coloca los huevos encima.",
                "Agrega pimienta y sirve."
            ]
        }
    };

    const dialogo = document.getElementById("detalle-receta");

    if (!dialogo) return;

    const titulo = document.getElementById("detalle-titulo");
    const tiempo = document.getElementById("detalle-tiempo");
    const descripcion = document.getElementById("detalle-descripcion");
    const imagen = document.getElementById("detalle-imagen");
    const ingredientes = document.getElementById("detalle-ingredientes");
    const pasos = document.getElementById("detalle-pasos");

    document.querySelectorAll(".receta-abrir").forEach(boton => {

        boton.addEventListener("click", () => {

            const receta = recetas[boton.dataset.receta];

            if (!receta) return;

            titulo.textContent = receta.titulo;
            tiempo.textContent = receta.tiempo;
            descripcion.textContent = receta.descripcion;

            imagen.src = receta.imagen;
            imagen.alt = receta.titulo;

            ingredientes.replaceChildren();
            pasos.replaceChildren();

            receta.ingredientes.forEach(item => {
                const li = document.createElement("li");
                li.textContent = item;
                ingredientes.appendChild(li);
            });

            receta.pasos.forEach(item => {
                const li = document.createElement("li");
                li.textContent = item;
                pasos.appendChild(li);
            });

            dialogo.showModal();
        });
    });

    document.getElementById("cerrar-receta")
        .addEventListener("click", () => {
            dialogo.close();
        });

    dialogo.addEventListener("click", (evento) => {
        if (evento.target === dialogo) {
            dialogo.close();
        }
    });
});