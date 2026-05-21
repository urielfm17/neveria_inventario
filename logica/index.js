document.addEventListener("DOMContentLoaded", cargarPedido);

// ── Toast ──────────────────────────────────────────────────────────────────
function mostrarToastIndex(mensaje, color) {
    color = color || '#c62828';
    let toast = document.getElementById('toast-index');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-index';
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%) translateY(20px);
            color: #fff;
            padding: 14px 28px;
            border-radius: 8px;
            font-size: 15px;
            font-weight: 600;
            box-shadow: 0 4px 16px rgba(0,0,0,0.25);
            opacity: 0;
            transition: opacity 0.3s ease, transform 0.3s ease;
            z-index: 9999;
            pointer-events: none;
            max-width: 420px;
            text-align: center;
        `;
        document.body.appendChild(toast);
    }
    toast.textContent = mensaje;
    toast.style.backgroundColor = color;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
    }, 3000);
}

// ── Cargar y renderizar el pedido ──────────────────────────────────────────
function cargarPedido() {
    const tabla = document.getElementById("tablaPedido");
    if (!tabla) return;

    const pedido    = JSON.parse(localStorage.getItem("pedidoActual")) || {};
    const productos = Object.values(pedido);

    tabla.innerHTML = "";

    if (productos.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center;padding:20px;color:#888;">
                    No hay productos agregados.
                </td>
            </tr>`;
        return;
    }

    productos.forEach(producto => {
        const fila = document.createElement("tr");
        const key  = 'prod_' + producto.id_producto;
        const max  = producto.max_permitido;
        const enMax = max !== null && max !== undefined && producto.cantidad >= max;

        fila.dataset.key = key;
        fila.dataset.idProducto = producto.id_producto;
        
        fila.innerHTML = `
            <td>${producto.nombre}</td>
            <td><span class="tag">${producto.presentacion}</span></td>
            <td>
                <div class="cantidad">
                    <button class="menos" onclick="cambiarCantidad(${producto.id_producto}, -1)">−</button>
                    <span>${producto.cantidad}${max ? ' / ' + max : ''}</span>
                    <button class="mas" onclick="cambiarCantidad(${producto.id_producto}, 1)"
                        ${enMax ? 'disabled style="opacity:0.35;cursor:not-allowed;"' : ''}>+</button>
                </div>
            </td>
            <td>
                <button class="btn-eliminar" onclick="eliminarProducto(${producto.id_producto})"
                    title="Eliminar ${producto.nombre}">
                    🗑 Eliminar
                </button>
            </td>`;

        tabla.appendChild(fila);
    });
}

// ── Cambiar cantidad con validación de límite ──────────────────────────────
function cambiarCantidad(idProducto, cambio) {
    let pedido = JSON.parse(localStorage.getItem("pedidoActual")) || {};
    const key = 'prod_' + idProducto;
    
    if (!pedido[key]) return;

    const producto      = pedido[key];
    const nuevaCantidad = producto.cantidad + cambio;
    const maxPermitido  = producto.max_permitido;

    // Validar que no exceda el máximo al aumentar
    if (cambio > 0 && maxPermitido !== null && maxPermitido !== undefined && nuevaCantidad > maxPermitido) {
        mostrarToastIndex('⛔ Límite alcanzado: máximo ' + maxPermitido + ' para ' + producto.nombre, '#b71c1c');
        return;
    }

    // Validar que no sea menor a 1
    if (nuevaCantidad < 1) {
        // Opcional: eliminar el producto si la cantidad llega a 0
        delete pedido[key];
        mostrarToastIndex('🗑 ' + producto.nombre + ' eliminado del pedido', '#555');
    } else {
        pedido[key].cantidad = nuevaCantidad;
    }

    localStorage.setItem("pedidoActual", JSON.stringify(pedido));
    cargarPedido();
}

// ── Eliminar producto individual ───────────────────────────────────────────
function eliminarProducto(idProducto) {
    let pedido = JSON.parse(localStorage.getItem("pedidoActual")) || {};
    const key = 'prod_' + idProducto;
    
    if (!pedido[key]) return;
    
    const nombre = pedido[key].nombre;
    delete pedido[key];
    localStorage.setItem("pedidoActual", JSON.stringify(pedido));
    mostrarToastIndex('🗑 ' + nombre + ' eliminado del pedido', '#555');
    cargarPedido();
}

// ── Filtrar productos en la tabla ──────────────────────────────────────────
function filtrarProductos() {
    const texto = document.getElementById("buscador").value.toLowerCase();
    document.querySelectorAll("#tablaPedido tr").forEach(fila => {
        const nombre = fila.cells[0]?.textContent.toLowerCase() || "";
        fila.style.display = nombre.includes(texto) ? "" : "none";
    });
}