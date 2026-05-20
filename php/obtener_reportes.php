<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/conexion.php';

$fechaInicio = $_GET['fechaInicio'] ?? '';
$fechaFin    = $_GET['fechaFin'] ?? '';

if (empty($fechaInicio) || empty($fechaFin)) {
    echo json_encode([]);
    exit;
}

$sql = "SELECT 
            p.id_pedido,
            p.fecha_pedido,
            u.nombre_completo AS encargado,
            COUNT(dp.id_detalle) AS total_productos,
            COALESCE(SUM(dp.cantidad), 0) AS total_unidades
        FROM pedidos p
        INNER JOIN usuarios u
            ON p.id_usuario = u.id_usuario
        LEFT JOIN detalles_pedido dp
            ON p.id_pedido = dp.id_pedido
        WHERE DATE(p.fecha_pedido) BETWEEN ? AND ?
        GROUP BY p.id_pedido, p.fecha_pedido, u.nombre_completo
        ORDER BY p.fecha_pedido DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $fechaInicio, $fechaFin);
$stmt->execute();
$resultado = $stmt->get_result();

$datos = [];

while ($fila = $resultado->fetch_assoc()) {
    $datos[] = [
        'id_pedido' => $fila['id_pedido'],
        'fecha'     => date('d/m/Y H:i', strtotime($fila['fecha_pedido'])),
        'encargado' => $fila['encargado'],
        'productos' => $fila['total_productos'] . ' productos',
        'total'     => $fila['total_unidades'] . ' unidades',
        'estado'    => 'Completado',
        // CORRECCIÓN: antes siempre era '#', ahora apunta al ticket real
        'pdf'       => '../php/ticket.php?id=' . $fila['id_pedido']
    ];
}

echo json_encode($datos, JSON_UNESCAPED_UNICODE);