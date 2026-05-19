console.log('✓ Script de producto cargado');

// ── Toast de confirmación ──────────────────────────────────────────────────
function mostrarToast(mensaje, color) {
    color = color || '#2e7d32';
    let toast = document.getElementById('toast-helado');

    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-helado';
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%) translateY(20px);
            color: #fff;
            padding: 12px 26px;
            border-radius: 8px;
            font-size: 15px;
            font-weight: 600;
            box-shadow: 0 4px 16px rgba(0,0,0,0.25);
            opacity: 0;
            transition: opacity 0.3s ease, transform 0.3s ease;
            z-index: 9999;
            pointer-events: none;
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
    }, 2200);
}

// ── Agregar producto al pedido ─────────────────────────────────────────────
function agregarProducto(nombre, presentacion, boton) {
    console.log('=== AGREGANDO PRODUCTO ===', nombre);

    try {
        const input  = boton.previousElementSibling;
        const cantidad = parseInt(input.value) || 1;

        // Leer id_producto del atributo data-id de la card padre
        const card = boton.closest('.card');
        const id_producto = card ? parseInt(card.dataset.id) : null;

        let pedido = JSON.parse(localStorage.getItem('pedidoActual')) || {};

        const key = nombre.toLowerCase().replace(/\s+/g, '_');

        if (pedido[key]) {
            pedido[key].cantidad += cantidad;
        } else {
            pedido[key] = {
                id_producto:  id_producto,   // ← necesario para guardar en BD
                nombre:       nombre,
                presentacion: presentacion,
                cantidad:     cantidad
            };
        }

        localStorage.setItem('pedidoActual', JSON.stringify(pedido));
        console.log('✓ Guardado:', localStorage.getItem('pedidoActual'));

        // Feedback en botón
        boton.textContent = '✓ Agregado';
        boton.style.backgroundColor = '#4CAF50';
        boton.disabled = true;

        setTimeout(() => {
            boton.textContent = 'Seleccionar';
            boton.style.backgroundColor = '';
            boton.disabled = false;
        }, 1500);

        input.value = 1;

        // Toast
        mostrarToast('✓ ' + nombre + ' agregado al pedido');

    } catch (error) {
        console.error('ERROR:', error);
        mostrarToast('Error: ' + error.message, '#c62828');
    }
}