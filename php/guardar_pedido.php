<?php
include("conexion.php");

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['productos']) || empty($input['productos'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No se recibieron productos.']);
    exit();
}

$id_usuario = intval($input['id_usuario'] ?? 1);
$productos  = $input['productos'];

// ── Límites servidor (mismos que en PHP de vistas) ────────────────────────
$limites = [
    1 => [1 => 10, 2 => 20, 3 => 30, 4 => 40, 5 => 50],
    2 => [1 => 15, 2 => 25, 3 => 40, 4 => 55, 5 => 70],
    3 => [1 => 2,  2 => 4,  3 => 6,  4 => 8,  5 => 10],
];

// ── Validación server-side antes de tocar la BD ───────────────────────────
foreach ($productos as $prod) {
    $id_producto = intval($prod['id_producto'] ?? 0);
    $cantidad    = intval($prod['cantidad']    ?? 0);

    if ($id_producto <= 0 || $cantidad <= 0) continue;

    $stmt = $conn->prepare(
        "SELECT p.nivel_importancia, p.id_presentacion, p.nombre_sabor
         FROM productos p WHERE p.id_producto = ?"
    );
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error interno del servidor.']);
        exit();
    }
    $stmt->bind_param("i", $id_producto);
    $stmt->execute();
    $res = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$res) continue;

    $nivel = (int)$res['nivel_importancia'];
    $tipo  = (int)$res['id_presentacion'];
    $max   = $limites[$tipo][$nivel] ?? 999;

    if ($cantidad > $max) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Límite excedido: "' . $res['nombre_sabor'] . '" tiene un máximo de ' . $max . ' unidades (nivel ' . $nivel . '). Enviaste ' . $cantidad . '.'
        ]);
        exit();
    }
}

// ── Todo válido: guardar pedido ───────────────────────────────────────────
$conn->begin_transaction();

try {
    $stmtPedido = $conn->prepare("INSERT INTO pedidos (id_usuario) VALUES (?)");
    if (!$stmtPedido) throw new Exception("Error prepare pedido: " . $conn->error);
    $stmtPedido->bind_param("i", $id_usuario);
    $stmtPedido->execute();
    $id_pedido = $conn->insert_id;
    $stmtPedido->close();

    $stmtDetalle = $conn->prepare(
        "INSERT INTO detalles_pedido (id_pedido, id_producto, cantidad) VALUES (?, ?, ?)"
    );
    if (!$stmtDetalle) throw new Exception("Error prepare detalle: " . $conn->error);

    $stmtStock = $conn->prepare(
        "UPDATE productos SET existencia = existencia + ? WHERE id_producto = ?"
    );
    if (!$stmtStock) throw new Exception("Error prepare stock: " . $conn->error);

    foreach ($productos as $prod) {
        $id_producto = intval($prod['id_producto'] ?? 0);
        $cantidad    = intval($prod['cantidad']    ?? 0);

        if ($id_producto > 0 && $cantidad > 0) {
            $stmtDetalle->bind_param("iii", $id_pedido, $id_producto, $cantidad);
            $stmtDetalle->execute();

            $stmtStock->bind_param("ii", $cantidad, $id_producto);
            $stmtStock->execute();
        }
    }

    $stmtDetalle->close();
    $stmtStock->close();
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