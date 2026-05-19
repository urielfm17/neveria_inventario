<?php
// ── Este archivo es: php/guardar_pedido.php ────────────────────────────────
include("conexion.php");

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['productos']) || empty($input['productos'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No se recibieron productos.']);
    exit();
}

$id_usuario = intval($input['id_usuario'] ?? 1);
$productos  = $input['productos'];

$conn->begin_transaction();

try {
    $stmtPedido = $conn->prepare("INSERT INTO pedidos (id_usuario) VALUES (?)");
    $stmtPedido->bind_param("i", $id_usuario);
    $stmtPedido->execute();
    $id_pedido = $conn->insert_id;
    $stmtPedido->close();

    $stmtDetalle = $conn->prepare(
        "INSERT INTO detalles_pedido (id_pedido, id_producto, cantidad) VALUES (?, ?, ?)"
    );

    foreach ($productos as $prod) {
        $id_producto = intval($prod['id_producto'] ?? 0);
        $cantidad    = intval($prod['cantidad']    ?? 0);

        if ($id_producto > 0 && $cantidad > 0) {
            $stmtDetalle->bind_param("iii", $id_pedido, $id_producto, $cantidad);
            $stmtDetalle->execute();
        }
    }

    $stmtDetalle->close();
    $conn->commit();

    echo json_encode([
        'success'   => true,
        'id_pedido' => $id_pedido,
        'pdf'       => '../php/ticket.php?id=' . $id_pedido
    ]);

} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>