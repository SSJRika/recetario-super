
document.addEventListener("DOMContentLoaded", () => {

    /* ======================================
       1. PESTAÑAS
    ====================================== */

    const pestanas = document.querySelectorAll(".perfil-tab");
    const paneles = document.querySelectorAll(".perfil-panel");

    pestanas.forEach(pestana => {

        pestana.addEventListener("click", () => {

            const panelSeleccionado = pestana.dataset.panel;

            pestanas.forEach(boton => {
                const activa = boton === pestana;

                boton.classList.toggle("activo", activa);
                boton.setAttribute("aria-selected", String(activa));
            });

            paneles.forEach(panel => {
                panel.hidden = panel.id !== "panel-" + panelSeleccionado;
            });
        });

    });


    /* ======================================
       2. CARGAR DATOS VISIBLES DEL PERFIL
       El script original consulta /auth/me.
       Aquí solamente leemos el resultado.
    ====================================== */

    const nombreVisible = document.getElementById("perfil-nombre");
    const correoVisible = document.getElementById("perfil-correo");

    const campoNombre = document.getElementById("editar-nombre");
    const campoCorreo = document.getElementById("editar-correo");

    function copiarDatosOriginales() {

        const nombre = nombreVisible.textContent.trim();
        const correo = correoVisible.textContent.trim();

        if (nombre && nombre !== "Cargando...") {
            if (!campoNombre.dataset.inicializado) {
                campoNombre.value = nombre;
                campoNombre.dataset.inicializado = "true";
            }
        }

        if (correo) {
            if (!campoCorreo.dataset.inicializado) {
                campoCorreo.value = correo;
                campoCorreo.dataset.inicializado = "true";
            }
        }
    }

    copiarDatosOriginales();

    const observador = new MutationObserver(() => {
        copiarDatosOriginales();

        if (
            campoNombre.dataset.inicializado &&
            campoCorreo.dataset.inicializado
        ) {
            observador.disconnect();
        }
    });

    if (
        !campoNombre.dataset.inicializado ||
        !campoCorreo.dataset.inicializado
    ) {
        observador.observe(nombreVisible, {
            childList: true,
            characterData: true,
            subtree: true
        });

        observador.observe(correoVisible, {
            childList: true,
            characterData: true,
            subtree: true
        });
    }


    /* ======================================
       3. PREVISUALIZAR FOTOGRAFÍA
       No se sube al servidor.
    ====================================== */

    const subirFoto = document.getElementById("subir-foto");
    const foto = document.getElementById("perfil-foto");
    const avatar = document.getElementById("avatar-iniciales");

    let fotoTemporal = null;

    subirFoto.addEventListener("change", () => {

        const archivo = subirFoto.files[0];

        if (!archivo) return;

        const tiposPermitidos = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!tiposPermitidos.includes(archivo.type)) {
            alert("Selecciona una imagen JPG, PNG o WEBP.");
            subirFoto.value = "";
            return;
        }

        if (archivo.size > 2 * 1024 * 1024) {
            alert("La imagen debe pesar menos de 2 MB.");
            subirFoto.value = "";
            return;
        }

        if (fotoTemporal) {
            URL.revokeObjectURL(fotoTemporal);
        }

        fotoTemporal = URL.createObjectURL(archivo);

        foto.src = fotoTemporal;
        foto.hidden = false;
        avatar.hidden = true;

    });


    /* ======================================
       4. VALIDAR DATOS PERSONALES
       Sin guardado permanente.
    ====================================== */

    const formDatos = document.getElementById("form-datos");
    const mensajeDatos = document.getElementById("mensaje-datos");

    formDatos.addEventListener("submit", evento => {

        evento.preventDefault();

        const nombre = campoNombre.value.trim();
        const correo = campoCorreo.value.trim();

        if (!nombre || !correo) {
            mensajeDatos.textContent =
                "Completa tu nombre y correo electrónico.";
            return;
        }

        mensajeDatos.textContent =
            "Datos revisados correctamente. " +
            "Los cambios aún no se guardan en tu cuenta.";
    });


    /* ======================================
       5. VALIDAR DIRECCIÓN
       Sin guardado permanente.
    ====================================== */

    const formDireccion = document.getElementById("form-direccion");
    const mensajeDireccion = document.getElementById("mensaje-direccion");

    formDireccion.addEventListener("submit", evento => {

        evento.preventDefault();

        const codigoPostal = document
            .getElementById("direccion-cp")
            .value.trim();

        if (codigoPostal && !/^\d{5}$/.test(codigoPostal)) {
            mensajeDireccion.textContent =
                "El código postal debe tener 5 dígitos.";
            return;
        }

        mensajeDireccion.textContent =
            "Dirección revisada. " +
            "Todavía no se guarda en la base de datos.";
    });


    /* ======================================
       6. VALIDAR NUEVA CONTRASEÑA
       
    ====================================== */

    const formSeguridad = document.getElementById("form-seguridad");
    const mensajeSeguridad = document.getElementById("mensaje-seguridad");

    formSeguridad.addEventListener("submit", evento => {

        evento.preventDefault();

        const actual = document
            .getElementById("clave-actual").value;

        const nueva = document
            .getElementById("clave-nueva").value;

        const confirmar = document
            .getElementById("clave-confirmar").value;

        if (!actual) {
            mensajeSeguridad.textContent =
                "Ingresa tu contraseña actual.";
            return;
        }

        if (nueva.length < 8) {
            mensajeSeguridad.textContent =
                "La nueva contraseña debe tener al menos 8 caracteres.";
            return;
        }

        if (nueva !== confirmar) {
            mensajeSeguridad.textContent =
                "Las contraseñas nuevas no coinciden.";
            return;
        }

        if (actual === nueva) {
            mensajeSeguridad.textContent =
                "La contraseña nueva debe ser diferente de la actual.";
            return;
        }

        mensajeSeguridad.textContent =
            "Formato válido. Tu contraseña NO ha sido cambiada.";

        formSeguridad.reset();
    });

});
