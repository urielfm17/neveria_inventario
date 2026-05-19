document.addEventListener("DOMContentLoaded", cargarPedido);

// ── Cargar y renderizar el pedido ──────────────────────────────────────────
function cargarPedido() {
    const tabla = document.getElementById("tablaPedido");

    if (!tabla) {
        console.error('No se encontró #tablaPedido');
        return;
    }

    const pedido   = JSON.parse(localStorage.getItem("pedidoActual")) || {};
    const productos = Object.values(pedido);

    console.log('Productos en pedido:', productos.length, productos);

    tabla.innerHTML = "";

    if (productos.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="3" style="text-align:center;padding:20px;color:#888;">
                    No hay productos agregados.
                </td>
            </tr>
        `;
        return;
    }

    productos.forEach(producto => {
        const fila = document.createElement("tr");

        // Guardamos la key como atributo data para no depender del nombre en el onclick
        // (evita bugs con nombres que tengan apostrofes u otros caracteres especiales)
        const key = producto.nombre.toLowerCase().replace(/\s+/g, '_');

        fila.dataset.key = key;

        fila.innerHTML = `
            <td>${producto.nombre}</td>
            <td><span class="tag">${producto.presentacion}</span></td>
            <td>
                <div class="cantidad">
                    <button class="menos" onclick="cambiarCantidad('${key}', -1)">−</button>
                    <span>${producto.cantidad}</span>
                    <button class="mas"  onclick="cambiarCantidad('${key}', 1)">+</button>
                </div>
            </td>
        `;

        tabla.appendChild(fila);
    });
}

// ── Cambiar cantidad — recibe la KEY, no el nombre ─────────────────────────
function cambiarCantidad(key, cambio) {
    let pedido = JSON.parse(localStorage.getItem("pedidoActual")) || {};

    if (!pedido[key]) return;

    pedido[key].cantidad += cambio;

    if (pedido[key].cantidad <= 0) {
        delete pedido[key];
    }

    localStorage.setItem("pedidoActual", JSON.stringify(pedido));
    cargarPedido();
}

// ── Filtrar productos en la tabla ──────────────────────────────────────────
function filtrarProductos() {
    const texto = document.getElementById("buscador").value.toLowerCase();
    const filas = document.querySelectorAll("#tablaPedido tr");

    filas.forEach(fila => {
        const nombre = fila.cells[0]?.textContent.toLowerCase() || "";
        fila.style.display = nombre.includes(texto) ? "" : "none";
    });
}