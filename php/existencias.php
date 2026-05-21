<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/conexion.php';

$tipo     = $_GET['tipo']   ?? '';
$busqueda = $_GET['buscar'] ?? '';

$sql = "SELECT 
            p.id_producto,
            p.nombre_sabor,
            p.existencia,
            p.nivel_importancia,
            pr.nombre          AS presentacion,
            pr.id_presentacion AS tipo
        FROM productos p
        INNER JOIN presentaciones pr
            ON p.id_presentacion = pr.id_presentacion
        WHERE 1=1";

$params = [];
$types  = '';

if (!empty($tipo)) {
    $sql    .= " AND pr.id_presentacion = ?";
    $params[] = (int)$tipo;
    $types   .= 'i';
}

if (!empty($busqueda)) {
    $sql    .= " AND p.nombre_sabor LIKE ?";
    $params[] = '%' . $busqueda . '%';
    $types   .= 's';
}

$sql .= " ORDER BY pr.id_presentacion ASC, p.nivel_importancia DESC, p.nombre_sabor ASC";

$stmt = $conn->prepare($sql);

if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}

$stmt->execute();
$resultado = $stmt->get_result();

$datos = [];

while ($fila = $resultado->fetch_assoc()) {
    $datos[] = [
        'id_producto'      => $fila['id_producto'],
        'sabor'            => $fila['nombre_sabor'],
        'presentacion'     => $fila['presentacion'],
        'tipo'             => (int)$fila['tipo'],
        'existencia'       => (int)$fila['existencia'],
        'nivel_importancia'=> (int)$fila['nivel_importancia']
    ];
}

echo json_encode($datos, JSON_UNESCAPED_UNICODE);