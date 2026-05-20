function buscarPedidos() {
    const fechaInicio = document.getElementById("fechaInicio").value;
    const fechaFin = document.getElementById("fechaFin").value;

    if (!fechaInicio || !fechaFin) {
        alert("Selecciona ambas fechas.");
        return;
    }

    fetch(`../php/obtener_reportes.php?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`)
        .then(response => response.json())
        .then(data => {
            const tabla = document.getElementById("tablaPedidos");
            const totalPedidos = document.getElementById("totalPedidos");
            const noResultados = document.getElementById("noResultados");

            tabla.innerHTML = "";

            if (data.length === 0) {
                totalPedidos.textContent = "0 pedidos";
                noResultados.style.display = "block";
                return;
            }

            noResultados.style.display = "none";
            totalPedidos.textContent = `${data.length} pedidos`;

            data.forEach(pedido => {
                const fila = `
                    <tr>
                        <td>${pedido.id_pedido}</td>
                        <td>${pedido.fecha}</td>
                        <td>${pedido.encargado}</td>
                        <td>${pedido.productos}</td>
                        <td>${pedido.total}</td>
                        <td>
                            <span style="color: green; font-weight: bold;">
                                ${pedido.estado}
                            </span>
                        </td>
                        <td>
                            <a href="${pedido.pdf}" target="_blank">
                                <i class="fas fa-file-pdf" style="color:red;"></i>
                            </a>
                        </td>
                    </tr>
                `;
                tabla.innerHTML += fila;
            });
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Ocurrió un error al obtener los reportes.");
        });
}