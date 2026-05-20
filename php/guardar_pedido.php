<?php
session_start();
// ── Este archivo es: php/guardar_pedido.php ────────────────────────────────
include("conexion.php");

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['productos']) || empty($input['productos'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No se recibieron productos.']);
    exit();
}

if (!isset($_SESSION['id_usuario'])) {
    echo json_encode([
        "success" => false,
        "message" => "No hay sesión iniciada"
    ]);
    exit;
}

$id_usuario = $_SESSION['id_usuario'];

$productos = $input['productos'];

$conn->begin_transaction();

try {
    // 1. Crear el pedido
    $stmtPedido = $conn->prepare("INSERT INTO pedidos (id_usuario) VALUES (?)");
    $stmtPedido->bind_param("i", $id_usuario);
    $stmtPedido->execute();
    $id_pedido = $conn->insert_id;
    $stmtPedido->close();

    // 2. Preparar inserts de detalles y update de existencias
    $stmtDetalle = $conn->prepare(
        "INSERT INTO detalles_pedido (id_pedido, id_producto, cantidad) VALUES (?, ?, ?)"
    );
    $stmtStock = $conn->prepare(
        "UPDATE productos SET existencia = existencia + ? WHERE id_producto = ?"
    );

    foreach ($productos as $prod) {
        $id_producto = intval($prod['id_producto'] ?? 0);
        $cantidad = intval($prod['cantidad'] ?? 0);

        if ($id_producto > 0 && $cantidad > 0) {
            // Insertar detalle del pedido
            $stmtDetalle->bind_param("iii", $id_pedido, $id_producto, $cantidad);
            $stmtDetalle->execute();

            // Sumar a existencias
            $stmtStock->bind_param("ii", $cantidad, $id_producto);
            $stmtStock->execute();
        }
    }

    $stmtDetalle->close();
    $stmtStock->close();
    $conn->commit();

    echo json_encode([
        'success' => true,
        'id_pedido' => $id_pedido,
        'pdf' => '../php/ticket.php?id=' . $id_pedido
    ]);

} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>