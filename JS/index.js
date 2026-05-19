console.log('✓ Script de index.html cargado con pedidoActual');

// Cargar y mostrar productos al abrir la página
function cargarProductos() {
    console.log('=== Ejecutando cargarProductos ===');
    
    const tablaBody = document.getElementById('tablaProductos');
    
    if (!tablaBody) {
        console.error('ERROR: No se encontró el elemento tablaProductos');
        return;
    }

    // CAMBIO: Leer de 'pedidoActual'
    const pedidoJSON = localStorage.getItem('pedidoActual');
    
    console.log('localStorage.getItem("pedidoActual"):', pedidoJSON);
    
    let pedido = {};
    try {
        pedido = pedidoJSON ? JSON.parse(pedidoJSON) : {};
    } catch (error) {
        console.error('ERROR al parsear JSON:', error);
        pedido = {};
    }
    
    console.log('Pedido parseado:', pedido);
    console.log('Cantidad de productos:', Object.keys(pedido).length);

    tablaBody.innerHTML = '';

    if (Object.keys(pedido).length === 0) {
        tablaBody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px; color: #999;">No hay productos seleccionados</td></tr>';
        console.log('Tabla vacía: no hay productos');
        return;
    }

    for (const key in pedido) {
        try {
            console.log('Creando fila para:', key);
            const producto = pedido[key];
            
            if (!producto || !producto.nombre || !producto.presentacion) {
                console.warn('Producto inválido:', producto);
                continue;
            }

            const fila = document.createElement('tr');

            fila.innerHTML = `
                <td>${producto.nombre}</td>
                <td><span class="tag">${producto.presentacion}</span></td>
                <td>
                    <div class="cantidad">
                        <button class="menos" onclick="cambiarCantidad('${key}', -1)">-</button>
                        <span id="cantidad-${key}">${producto.cantidad}</span>
                        <button class="mas" onclick="cambiarCantidad('${key}', 1)">+</button>
                    </div>
                </td>
                <td>
                    <button class="btn-eliminar" onclick="eliminarProducto('${key}')">
                        🗑️ Eliminar
                    </button>
                </td>
            `;

            tablaBody.appendChild(fila);
        } catch (error) {
            console.error('ERROR al crear fila para:', key, error);
        }
    }

    console.log('=== Fin cargarProductos ===');
}

// Cambiar cantidad de un producto
function cambiarCantidad(key, cambio) {
    console.log('Cambiando cantidad de:', key, 'cambio:', cambio);
    
    // CAMBIO: Leer de 'pedidoActual'
    const pedidoJSON = localStorage.getItem('pedidoActual');
    let pedido = {};
    
    try {
        pedido = pedidoJSON ? JSON.parse(pedidoJSON) : {};
    } catch (error) {
        console.error('ERROR al parsear JSON:', error);
        return;
    }

    if (pedido[key]) {
        pedido[key].cantidad += cambio;

        if (pedido[key].cantidad < 1) {
            pedido[key].cantidad = 1;
        }

        try {
            // CAMBIO: Guardar en 'pedidoActual'
            localStorage.setItem('pedidoActual', JSON.stringify(pedido));
            console.log('Cantidad actualizada:', pedido[key]);
            cargarProductos();
        } catch (error) {
            console.error('ERROR al guardar:', error);
        }
    } else {
        console.warn('Producto no encontrado:', key);
    }
}

// Eliminar producto de la tabla
function eliminarProducto(key) {
    console.log('Eliminando producto:', key);
    
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
        // CAMBIO: Leer de 'pedidoActual'
        const pedidoJSON = localStorage.getItem('pedidoActual');
        let pedido = {};
        
        try {
            pedido = pedidoJSON ? JSON.parse(pedidoJSON) : {};
        } catch (error) {
            console.error('ERROR al parsear JSON:', error);
            return;
        }

        delete pedido[key];
        
        try {
            // CAMBIO: Guardar en 'pedidoActual'
            localStorage.setItem('pedidoActual', JSON.stringify(pedido));
            console.log('Producto eliminado. Pedido actual:', pedido);
            cargarProductos();
        } catch (error) {
            console.error('ERROR al guardar:', error);
        }
    }
}

// Limpiar todo el pedido actual
function limpiarCarrito() {
    console.log('Limpiando pedido actual');
    
    if (confirm('¿Estás seguro de que deseas limpiar toda la selección?')) {
        try {
            // CAMBIO: Remover 'pedidoActual'
            localStorage.removeItem('pedidoActual');
            console.log('localStorage (pedidoActual) limpiado');
            cargarProductos();
        } catch (error) {
            console.error('ERROR al limpiar:', error);
        }
    }
}

// Generar PDF
function generarPDF() {
    console.log('Generando PDF desde pedidoActual');
    
    // CAMBIO: Leer de 'pedidoActual'
    const pedidoJSON = localStorage.getItem('pedidoActual');
    let pedido = {};
    
    try {
        pedido = pedidoJSON ? JSON.parse(pedidoJSON) : {};
    } catch (error) {
        console.error('ERROR al parsear JSON:', error);
        return;
    }

    if (Object.keys(pedido).length === 0) {
        alert('No hay productos para generar PDF');
        return;
    }

    let contenido = 'PEDIDO - Helados Luz del Día\n';
    contenido += '=============================\n\n';
    let total = 0;

    for (const key in pedido) {
        const producto = pedido[key];
        if (producto && producto.nombre) {
            contenido += `${producto.nombre} (${producto.presentacion}): ${producto.cantidad}\n`;
            total++;
        }
    }

    contenido += '\n=============================\n';
    contenido += `Total de productos: ${total}`;

    try {
        const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'pedido.txt');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log('PDF generado');
    } catch (error) {
        console.error('ERROR al generar PDF:', error);
        alert('Error al generar PDF: ' + error.message);
    }
}

// Cargar productos cuando la página carga
window.addEventListener('DOMContentLoaded', function() {
    cargarProductos();
});

// Cargar cuando la ventana obtiene foco
window.addEventListener('focus', function() {
    cargarProductos();
});