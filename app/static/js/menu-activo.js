
document.addEventListener("DOMContentLoaded", function () {

    const rutaActual =
        window.location.pathname.replace(/\/+$/, "") || "/";

    const enlaces = document.querySelectorAll(
        ".menu a[href]"
    );

    enlaces.forEach(function (enlace) {

        const rutaEnlace = new URL(
            enlace.getAttribute("href"),
            window.location.origin
        ).pathname.replace(/\/+$/, "") || "/";

        const activo = rutaActual === rutaEnlace;

        enlace.classList.toggle("activo", activo);

        if (activo) {
            enlace.setAttribute("aria-current", "page");
        } else {
            enlace.removeAttribute("aria-current");
        }

    });

});
