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
// Generar TXT y respaldar en el historial de reportes
function generarPDF() {
    console.log('Generando archivo y guardando en historial...');
    
    // Leer el pedido que se está armando en la pantalla principal
    const pedidoJSON = localStorage.getItem('pedidoActual');
    let pedido = {};
    
    try {
        pedido = pedidoJSON ? JSON.parse(pedidoJSON) : {};
    } catch (error) {
        console.error('ERROR al parsear JSON:', error);
        return;
    }

    if (Object.keys(pedido).length === 0) {
        alert('No hay productos para generar la orden.');
        return;
    }

    // 1. CREACIÓN DEL TEXTO PARA EL ARCHIVO
    let contenido = 'PEDIDO - Helados Luz del Día\n';
    contenido += '=============================\n\n';
    let totalProductos = 0;
    let listaProductosEstructurada = [];

    for (const key in pedido) {
        const producto = pedido[key];
        if (producto && producto.nombre) {
            contenido += `${producto.nombre} (${producto.presentacion}): ${producto.cantidad}\n`;
            totalProductos += producto.cantidad;
            
            // Guardamos el producto estructurado para el reporte histórico
            listaProductosEstructurada.push({
                nombre: producto.nombre,
                presentacion: producto.presentacion,
                cantidad: producto.cantidad
            });
        }
    }

    contenido += '\n=============================\n';
    contenido += `Total de productos: ${totalProductos}`;

    // Descargar el archivo .txt
    const idPedidoUnico = Math.floor(100000 + Math.random() * 900000); // ID de 6 dígitos
    try {
        const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `pedido_${idPedidoUnico}.txt`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log('Archivo descargado con éxito');
    } catch (error) {
        console.error('ERROR al descargar archivo:', error);
        alert('Error al generar el archivo');
        return;
    }

    // 2. GUARDAR EN EL ARREGLO DE HISTORIAL PARA REPORTES
    try {
        // Obtener lo que ya esté guardado en el historial o iniciar un arreglo vacío
        let historial = JSON.parse(localStorage.getItem('historialPedidos')) || [];

        // Creamos el objeto del reporte con la fecha de hoy
        const nuevoReporte = {
            id: 'PED-' + idPedidoUnico,
            fecha: new Date().toISOString().split('T')[0], // Guarda en formato AAAA-MM-DD
            proveedor: 'General', 
            productos: listaProductosEstructurada,
            total: totalProductos,
            estado: 'Completado',
            contenidoTxt: contenido // Guardamos el texto por si quieres reimprimirlo o consultarlo
        };

        // Lo agregamos al arreglo
        historial.push(nuevoReporte);

        // Lo devolvemos al localStorage bajo su propia clave "historialPedidos"
        localStorage.setItem('historialPedidos', JSON.stringify(historial));
        console.log('✓ Pedido registrado en el historial de reportes');

        // 3. LIMPIAR PANTALLA PRINCIPAL
        localStorage.removeItem('pedidoActual');
        cargarProductos();
        
        alert('✓ ¡Pedido procesado, TXT generado y guardado en Reportes!');

    } catch (error) {
        console.error('Error al guardar en el historial:', error);
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

//Al cargar la página: verificar sesión y mostrar nombre
        var sesion = JSON.parse(localStorage.getItem('sesionActual'));

        if (!sesion) {
            // Si no hay sesión, redirige al login automáticamente
            window.location.href = 'login.html';
        } else {
            document.getElementById('nombreUsuario').textContent = sesion.nombre;
        }

        //Función cerrar sesión
        function cerrarSesion() {
            localStorage.removeItem('sesionActual');
            window.location.href = 'login.html';
        }