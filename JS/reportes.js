console.log('✓ Script de reportes.js cargado');

// Función principal para buscar y filtrar pedidos
function buscarPedidos() {
    console.log('=== Buscando Pedidos en Historial ===');
    
    const fechaInicioInput = document.getElementById('fechaInicio').value;
    const fechaFinInput = document.getElementById('fechaFin').value;
    const tablaPedidos = document.getElementById('tablaPedidos');
    const totalPedidosBadge = document.getElementById('totalPedidos');
    const noResultadosDiv = document.getElementById('noResultados');

    // Obtener el historial del localStorage
    const historial = JSON.parse(localStorage.getItem('historialPedidos')) || [];
    console.log('Historial completo encontrado:', historial);

    // Limpiar tabla antes de mostrar resultados
    tablaPedidos.innerHTML = '';

    // Filtrar el historial según las fechas ingresadas
    const pedidosFiltrados = historial.filter(pedido => {
        // Si no se pone fecha de inicio ni de fin, se muestran todos
        if (!fechaInicioInput && !fechaFinInput) return true;
        
        // Si se pone rango de fechas, validamos que esté en medio
        if (fechaInicioInput && pedido.fecha < fechaInicioInput) return false;
        if (fechaFinInput && pedido.fecha > fechaFinInput) return false;
        
        return true;
    });

    console.log('Pedidos que cumplen el filtro:', pedidosFiltrados);

    // Actualizar el contador de pedidos encontrados
    totalPedidosBadge.textContent = `${pedidosFiltrados.length} pedido(s)`;

    // Si no hay resultados, mostrar el mensaje de alerta visual
    if (pedidosFiltrados.length === 0) {
        noResultadosDiv.style.display = 'block';
        return;
    } else {
        noResultadosDiv.style.display = 'none';
    }

    // Dibujar las filas en la tabla de reportes
    pedidosFiltrados.forEach(pedido => {
        const fila = document.createElement('tr');

        // Formatear la lista de productos para que se vea bonita en una sola celda
        const detalleProductos = pedido.productos.map(p => 
            `${p.nombre} (${p.cantidad})`
        ).join(', ');

        fila.innerHTML = `
            <td><strong>${pedido.id}</strong></td>
            <td>${pedido.fecha}</td>
            <td>${pedido.proveedor}</td>
            <td style="max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${detalleProductos}">
                ${detalleProductos}
            </td>
            <td><span class="tag" style="background-color: #e3f2fd; color: #0d47a1; font-weight: bold;">${pedido.total} pzas</span></td>
            <td><span style="background-color: #e8f5e9; color: #2e7d32; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${pedido.estado}</span></td>
            <td>
                <button class="nav-btn" style="padding: 5px 10px; font-size: 12px; background-color: #ff9800; border: none; color: white; border-radius: 4px; cursor: pointer;" 
                        onclick="recarfgarTxt('${pedido.id}')">
                    <i class="fas fa-file-download"></i> Ver TXT
                </button>
            </td>
        `;

        tablaPedidos.appendChild(fila);
    });
}

// Función extra: Por si quieren volver a descargar el archivo .txt desde el historial de reportes
function recarfgarTxt(pedidoId) {
    const historial = JSON.parse(localStorage.getItem('historialPedidos')) || [];
    const pedido = historial.find(p => p.id === pedidoId);

    if (pedido && pedido.contenidoTxt) {
        const blob = new Blob([pedido.contenidoTxt], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `pedido_${pedidoId.replace('PED-', '')}.txt`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        alert('No se encontró el archivo de texto para este pedido.');
    }
}

// Inicializar la tabla cargando todos los registros al abrir la página de Reportes
window.addEventListener('DOMContentLoaded', () => {
    buscarPedidos();
});