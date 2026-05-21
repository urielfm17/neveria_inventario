console.log('✓ Script de producto cargado');

// ── Límites por tipo y nivel (iguales que en PHP) ───────────────────────────
const LIMITES = {
    1: { 1: 10, 2: 20, 3: 30, 4: 40, 5: 50 },  // Helados (Litro)
    2: { 1: 15, 2: 25, 3: 40, 4: 55, 5: 70 },  // Paletas
    3: { 1: 2,  2: 4,  3: 6,  4: 8,  5: 10 }   // Helados 15L
};

// ── Al cargar la página: bloquear botones de productos ya en su máximo ─────
document.addEventListener('DOMContentLoaded', function () {
    const pedido = JSON.parse(localStorage.getItem('pedidoActual')) || {};

    document.querySelectorAll('.card').forEach(function (card) {
        const idProducto = parseInt(card.dataset.id);
        const max        = parseInt(card.dataset.max);
        const boton      = card.querySelector('.btn-seleccionar');
        const input      = card.querySelector('.cantidad-input');
        
        if (!boton || !input || isNaN(max) || isNaN(idProducto)) return;

        // Buscar cantidad actual por id_producto (más confiable que por nombre)
        let cantidadActual = 0;
        Object.values(pedido).forEach(function (p) {
            if (p.id_producto === idProducto) {
                cantidadActual = p.cantidad;
            }
        });

        if (cantidadActual >= max) {
            bloquearBoton(boton, input, max);
        }
    });
});

// ── Bloquear visualmente el botón cuando se alcanza el máximo ─────────────
function bloquearBoton(boton, input, max) {
    boton.textContent  = '⛔ Máximo alcanzado (' + max + ')';
    boton.style.backgroundColor = '#e53935';
    boton.style.color  = 'white';
    boton.style.border = '1px solid #e53935';
    boton.style.cursor = 'not-allowed';
    boton.disabled     = true;
    if (input) input.disabled = true;
}

// ── Clamp del input AL ESCRIBIR (llamado inline con oninput) ──────────────
function clampInput(input) {
    const card = input.closest('.card');
    if (!card) return;

    const max = parseInt(card.dataset.max);
    let   val = parseInt(input.value);

    if (isNaN(val) || val < 1) {
        input.value = 1;
        return;
    }

    if (!isNaN(max) && val > max) {
        input.value = max;
        mostrarToast('⚠ Máximo permitido: ' + max + ' unidades', '#e65100');
    }
}

// ── Toast ─────────────────────────────────────────────────────────────────
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

// ── Agregar producto con validación de límite ─────────────────────────────
function agregarProducto(nombre, presentacion, boton) {
    try {
        const input        = boton.previousElementSibling;
        const cantidad     = parseInt(input.value) || 1;
        const card         = boton.closest('.card');
        const id_producto  = card ? parseInt(card.dataset.id)   : null;
        const maxPermitido = card ? parseInt(card.dataset.max)  : null;
        const nivel        = card ? parseInt(card.dataset.nivel): null;
        const tipo         = card ? parseInt(card.dataset.tipo) : null;

        // ── Validar que tenemos datos válidos ────────────────────────────
        if (!id_producto || isNaN(id_producto)) {
            mostrarToast('❌ Error: producto no identificado', '#c62828');
            return;
        }

        // ── Validar cantidad ingresada vs max ────────────────────────────
        if (!isNaN(maxPermitido) && cantidad > maxPermitido) {
            mostrarToast('⚠ Máximo permitido: ' + maxPermitido + ' unidades', '#c62828');
            input.value = maxPermitido;
            return;
        }

        let pedido = JSON.parse(localStorage.getItem('pedidoActual')) || {};

        // ── Usar id_producto como key (más confiable) ────────────────────
        const key = 'prod_' + id_producto;

        // ── Validar acumulado en el pedido ───────────────────────────────
        const cantidadActual = pedido[key] ? pedido[key].cantidad : 0;
        const cantidadTotal  = cantidadActual + cantidad;

        if (!isNaN(maxPermitido) && cantidadTotal > maxPermitido) {
            const restante = maxPermitido - cantidadActual;
            if (restante <= 0) {
                mostrarToast('⛔ Ya alcanzaste el máximo de ' + maxPermitido + ' para ' + nombre, '#b71c1c');
                bloquearBoton(boton, input, maxPermitido);
            } else {
                mostrarToast('⚠ Solo puedes agregar ' + restante + ' más de ' + nombre + ' (límite: ' + maxPermitido + ')', '#e65100');
                input.value = restante;
            }
            return;
        }

        // ── Guardar en pedido ────────────────────────────────────────────
        if (pedido[key]) {
            pedido[key].cantidad += cantidad;
        } else {
            pedido[key] = {
                id_producto:   id_producto,
                nombre:        nombre,
                presentacion:  presentacion,
                cantidad:      cantidad,
                max_permitido: maxPermitido,
                nivel:         nivel,
                tipo:          tipo
            };
        }

        localStorage.setItem('pedidoActual', JSON.stringify(pedido));

        // Feedback botón
        boton.textContent = '✓ Agregado';
        boton.style.backgroundColor = '#4CAF50';
        boton.style.color  = 'white';
        boton.disabled = true;

        setTimeout(() => {
            // Si ya está en el máximo después de agregar, bloquear permanentemente
            const nuevoAcumulado = pedido[key] ? pedido[key].cantidad : cantidadTotal;
            if (!isNaN(maxPermitido) && nuevoAcumulado >= maxPermitido) {
                bloquearBoton(boton, input, maxPermitido);
            } else {
                boton.textContent = 'Seleccionar';
                boton.style.backgroundColor = '';
                boton.style.color = '';
                boton.disabled = false;
            }
        }, 1200);

        input.value = 1;
        mostrarToast('✓ ' + nombre + ' agregado (' + cantidadTotal + '/' + maxPermitido + ')');

    } catch (error) {
        console.error('ERROR:', error);
        mostrarToast('Error: ' + error.message, '#c62828');
    }
}