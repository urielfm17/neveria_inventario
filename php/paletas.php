<?php
require_once __DIR__ . '/conexion.php';

$limites = [
    1 => [1 => 10, 2 => 20, 3 => 30, 4 => 40, 5 => 50],
    2 => [1 => 15, 2 => 25, 3 => 40, 4 => 55, 5 => 70],
    3 => [1 => 2,  2 => 4,  3 => 6,  4 => 8,  5 => 10],
];

$sql = "SELECT 
            p.id_producto,
            p.nombre_sabor,
            p.nivel_importancia,
            pr.id_presentacion,
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
        $nivel     = (int)$fila['nivel_importancia'];
        $tipo      = (int)$fila['id_presentacion'];
        $max       = $limites[$tipo][$nivel];

        $nombre_js       = htmlspecialchars(json_encode('Paleta de ' . $fila['nombre_sabor']), ENT_QUOTES);
        $presentacion_js = htmlspecialchars(json_encode('Paleta'), ENT_QUOTES);

        $estrellas = str_repeat('★', $nivel) . str_repeat('☆', 5 - $nivel);

        $cards .= '
        <div class="card"
             data-id="'    . $fila['id_producto'] . '"
             data-nivel="' . $nivel . '"
             data-max="'   . $max . '"
             data-tipo="'  . $tipo . '">
            <div class="card-top">
                <h3>' . htmlspecialchars($fila['nombre_sabor']) . '</h3>
                <span class="nivel-badge nivel-' . $nivel . '" title="Nivel de importancia ' . $nivel . '">'
                    . $estrellas .
                '</span>
            </div>
            <p>Presentación: Paleta</p>
            <p class="max-info">Máx. pedido: <strong>' . $max . '</strong> unidades</p>
            <input type="text" inputmode="numeric" pattern="[0-9]*" class="cantidad-input" value="1" onkeydown="return soloNumeros(event)" oninput="clampInput(this)">
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