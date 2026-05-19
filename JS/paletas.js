console.log('✓ Script de producto cargado');

function agregarProducto(nombre, presentacion, boton) {
    console.log('=== AGREGANDO PRODUCTO ===');
    console.log('Nombre:', nombre);
    
    try {
        const input = boton.previousElementSibling;
        const cantidad = parseInt(input.value) || 1;
        console.log('Cantidad:', cantidad);

        // CAMBIO AQUÍ: Ahora leemos de 'pedidoActual'
        let pedido = JSON.parse(localStorage.getItem('pedidoActual')) || {};
        console.log('Pedido actual:', pedido);

        const key = nombre.toLowerCase().replace(/\s+/g, '_');
        console.log('Clave:', key);

        if (pedido[key]) {
            pedido[key].cantidad += cantidad;
            console.log('Producto actualizado');
        } else {
            pedido[key] = {
                nombre: nombre,
                presentacion: presentacion,
                cantidad: cantidad
            };
            console.log('Producto nuevo agregado');
        }

        // CAMBIO AQUÍ: Ahora guardamos en 'pedidoActual'
        localStorage.setItem('pedidoActual', JSON.stringify(pedido));
        console.log('✓ Guardado en localStorage (pedidoActual)');
        console.log('Datos guardados:', localStorage.getItem('pedidoActual'));

        boton.textContent = '✓ Agregado';
        boton.style.backgroundColor = '#4CAF50';
        setTimeout(() => {
            boton.textContent = 'Seleccionar';
            boton.style.backgroundColor = '';
        }, 1500);

        input.value = 1;

    } catch (error) {
        console.error('ERROR:', error);
        alert('Error: ' + error.message);
    }
}