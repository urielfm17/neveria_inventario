<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Existencias - Helados Luz del Día</title>

    <link rel="stylesheet" href="../CSS/existencias.css">

    <!-- Bootstrap Icons -->
    <link rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
</head>

<body>

    <div class="contenedor">

        <!-- ENCABEZADO -->
        <div class="top-bar">
            <h1>Existencias</h1>
            <button class="btn-cerrar" onclick="window.location.href='index.html'">
                <i class="bi bi-arrow-left"></i> Menú Principal
            </button>
        </div>

        <!-- TARJETAS RESUMEN -->
        <div class="resumen-cards">
            <div class="card-resumen">
                <span class="card-icon"><i class="bi bi-box-seam"></i></span>
                <div>
                    <p class="card-label">Total Productos</p>
                    <p class="card-valor" id="totalProductos">—</p>
                </div>
            </div>
            <div class="card-resumen verde">
                <span class="card-icon"><i class="bi bi-check-circle"></i></span>
                <div>
                    <p class="card-label">En Stock</p>
                    <p class="card-valor" id="enStock">—</p>
                </div>
            </div>
            <div class="card-resumen amarillo">
                <span class="card-icon"><i class="bi bi-exclamation-triangle"></i></span>
                <div>
                    <p class="card-label">Stock Bajo (&lt;5)</p>
                    <p class="card-valor" id="stockBajo">—</p>
                </div>
            </div>
            <div class="card-resumen rojo">
                <span class="card-icon"><i class="bi bi-x-circle"></i></span>
                <div>
                    <p class="card-label">Sin Existencias</p>
                    <p class="card-valor" id="sinStock">—</p>
                </div>
            </div>
        </div>

        <!-- FILTROS Y BUSCADOR -->
        <div class="buscador">

            <input
                type="text"
                id="inputBuscar"
                placeholder="Buscar por sabor..."
                oninput="cargarExistencias()"
            >

            <div class="filtros-tipo">
                <button class="btn-filtro activo" data-tipo="" onclick="seleccionarFiltro(this)">
                    Todos
                </button>
                <button class="btn-filtro" data-tipo="1" onclick="seleccionarFiltro(this)">
                    <i class="bi bi-cup-straw"></i> Helados
                </button>
                <button class="btn-filtro" data-tipo="2" onclick="seleccionarFiltro(this)">
                    <i class="bi bi-thermometer-snow"></i> Paletas
                </button>
                <button class="btn-filtro" data-tipo="3" onclick="seleccionarFiltro(this)">
                    <i class="bi bi-bucket"></i> Helados 15L
                </button>
            </div>

        </div>

        <!-- TABLA -->
        <div class="tabla-contenedor">

            <div class="tabla-header">
                <h3>Inventario de Productos</h3>
                <span class="total-count" id="conteoResultados">Cargando...</span>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Sabor</th>
                        <th>Presentación</th>
                        <th>Existencias</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody id="tablaExistencias">
                    <tr>
                        <td colspan="5" class="cargando">
                            <i class="bi bi-hourglass-split"></i> Cargando...
                        </td>
                    </tr>
                </tbody>
            </table>

            <div class="sin-resultados" id="sinResultados" style="display:none;">
                <i class="bi bi-search"></i>
                <p>No se encontraron productos con ese criterio.</p>
            </div>

        </div>

    </div>

    <script src="../logica/existencias.js"></script>

</body>

</html>