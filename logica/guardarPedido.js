async function guardarPedidoEnBD() {
    const pedido    = JSON.parse(localStorage.getItem("pedidoActual")) || {};
    const productos = Object.values(pedido);

    if (productos.length === 0) {
        alert("No hay productos en el pedido.");
        return;
    }

    const btn = document.querySelector(".btn-pdf");
    if (btn) { btn.disabled = true; btn.textContent = "⏳ Guardando..."; }

    try {
        const respuesta = await fetch("../php/guardar_pedido.php", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productos })
        });

        // Leer texto crudo ANTES de parsear — así vemos el error exacto de PHP
        const textoRaw = await respuesta.text();
        console.log("Respuesta del servidor:", textoRaw);

        let resultado;
        try {
            resultado = JSON.parse(textoRaw);
        } catch (parseErr) {
            alert("El servidor devolvió una respuesta inválida.\nRevisa la Consola (F12) para ver el error exacto de PHP.");
            console.error("No es JSON:", textoRaw);
            if (btn) { btn.disabled = false; btn.innerHTML = '<i class="bi bi-file-earmark-pdf"></i> Guardar y generar PDF'; }
            return;
        }

        if (resultado.success) {
            if (resultado.pdf) window.open(resultado.pdf, "_blank");
            localStorage.removeItem("pedidoActual");
            location.reload();
        } else {
            alert("Error al guardar: " + resultado.message);
            if (btn) { btn.disabled = false; btn.innerHTML = '<i class="bi bi-file-earmark-pdf"></i> Guardar y generar PDF'; }
        }

    } catch (error) {
        console.error("Error de red:", error);
        alert("No se pudo conectar al servidor.\n\n¿Estás abriendo la página desde XAMPP?\n(debe ser http://localhost/... no file:///...)");
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="bi bi-file-earmark-pdf"></i> Guardar y generar PDF'; }
    }
}