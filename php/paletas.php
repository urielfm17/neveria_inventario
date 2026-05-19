<?php
require_once __DIR__ . '/conexion.php';

$sql = "SELECT 
            p.id_producto,
            p.nombre_sabor,
            pr.nombre AS presentacion
        FROM productos p
        INNER JOIN presentaciones pr
            ON p.id_presentacion = pr.id_presentacion
        WHERE p.id_presentacion = 2
        ORDER BY p.nombre_sabor ASC";

$resultado = $conn->query($sql);

if (!$resultado) {
    die("Error en la consulta: " . $conn->error);
}

$cards = '';

if ($resultado->num_rows > 0) {
    while ($fila = $resultado->fetch_assoc()) {

        $nombre_js       = htmlspecialchars(json_encode('Paleta de ' . $fila['nombre_sabor']), ENT_QUOTES);
        $presentacion_js = htmlspecialchars(json_encode('Paleta'), ENT_QUOTES);

        $cards .= '
        <div class="card" data-id="' . $fila['id_producto'] . '">
            <h3>' . htmlspecialchars($fila['nombre_sabor']) . '</h3>
            <p>Presentación: Paleta</p>
            <input type="number" class="cantidad-input" value="1" min="1">
            <button type="button" class="btn-seleccionar"
                onclick="agregarProducto(' . $nombre_js . ', ' . $presentacion_js . ', this)">
                Seleccionar
            </button>
        </div>';
    }
} else {
    $cards = '<p>No hay productos registrados.</p>';
}
?>