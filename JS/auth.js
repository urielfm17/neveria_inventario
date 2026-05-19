// ================================================
//  auth.js — Protección de páginas
//  Incluye este script en TODAS las páginas que
//  requieran sesión iniciada (index, helados, etc.)
// ================================================

(function () {
    var sesion = JSON.parse(localStorage.getItem('sesionActual'));

    // Si no hay sesión activa, manda al login
    if (!sesion) {
        window.location.replace('login.html');
    }
})();

// Función global para cerrar sesión (úsala en cualquier página)
function cerrarSesion() {
    localStorage.removeItem('sesionActual');
    window.location.replace('login.html');
}

// Función global para obtener el usuario actual
function obtenerUsuario() {
    return JSON.parse(localStorage.getItem('sesionActual'));
}