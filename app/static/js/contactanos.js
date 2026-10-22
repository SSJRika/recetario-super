
/* ==========================================
   FOOD-RANEO - CONTACTO
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    const formulario = document.getElementById(
        "form-contacto"
    );

    const estado = document.getElementById(
        "contacto-estado"
    );

    formulario.addEventListener("submit", evento => {

        evento.preventDefault();

        if (!formulario.reportValidity()) {
            return;
        }

        const nombre = document.getElementById(
            "contacto-nombre"
        ).value.trim();

        const correo = document.getElementById(
            "contacto-correo"
        ).value.trim();

        const asunto = document.getElementById(
            "contacto-asunto"
        ).value;

        const mensaje = document.getElementById(
            "contacto-mensaje"
        ).value.trim();

        if (!nombre || !correo || !asunto || !mensaje) {
            estado.textContent =
                "Completa todos los campos.";
            return;
        }

        const asuntoCorreo = encodeURIComponent(
            "Food-raneo - " + asunto
        );

        const cuerpoCorreo = encodeURIComponent(
            "Nombre: " + nombre + "\n" +
            "Correo: " + correo + "\n" +
            "Asunto: " + asunto + "\n\n" +
            "Mensaje:\n" + mensaje
        );

        const destino =
            "mailto:food-raneo@alumnos.uaq.mx" +
            "?subject=" + asuntoCorreo +
            "&body=" + cuerpoCorreo;

        estado.textContent =
            "Se abrirá tu aplicación de correo. " +
            "Revisa el mensaje y presiona Enviar.";

        window.location.href = destino;

    });

});
