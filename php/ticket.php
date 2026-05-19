<?php
require_once __DIR__ . '/conexion.php';

$id_pedido = intval($_GET['id'] ?? 0);

if ($id_pedido <= 0) {
    die("Pedido no válido.");
}

// ── Datos del pedido + nombre del usuario ─────────────────────────────────
$stmt = $conn->prepare(
    "SELECT p.id_pedido, p.fecha_pedido, u.nombre_completo AS usuario
     FROM pedidos p
     LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
     WHERE p.id_pedido = ?"
);
$stmt->bind_param("i", $id_pedido);
$stmt->execute();
$pedido = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$pedido) {
    die("Pedido no encontrado.");
}

// ── Productos del pedido ───────────────────────────────────────────────────
$stmt2 = $conn->prepare(
    "SELECT pr.nombre_sabor, pres.nombre AS presentacion, dp.cantidad
     FROM detalles_pedido dp
     INNER JOIN productos pr        ON dp.id_producto      = pr.id_producto
     INNER JOIN presentaciones pres ON pr.id_presentacion  = pres.id_presentacion
     WHERE dp.id_pedido = ?
     ORDER BY pr.nombre_sabor ASC"
);
$stmt2->bind_param("i", $id_pedido);
$stmt2->execute();
$detalles = $stmt2->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt2->close();

$total_piezas = array_sum(array_column($detalles, 'cantidad'));
$fecha        = date('d/m/Y H:i', strtotime($pedido['fecha_pedido']));
$usuario      = htmlspecialchars($pedido['usuario'] ?? 'Uriel García');
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Pedido #<?= $id_pedido ?> — Helados Luz del Día</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background: #f5f5f5;
            display: flex;
            justify-content: center;
            padding: 30px 16px;
        }

        .ticket {
            background: #fff;
            width: 680px;
            border-radius: 10px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.12);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #1565c0, #0d47a1);
            color: #fff;
            padding: 28px 32px;
            text-align: center;
        }
        .header h1 { font-size: 26px; letter-spacing: 1px; }
        .header p  { font-size: 13px; opacity: .85; margin-top: 4px; }

        .meta {
            display: flex;
            justify-content: space-between;
            padding: 16px 32px;
            background: #e3f2fd;
            font-size: 13px;
            color: #1565c0;
            font-weight: 600;
        }

        .tabla-wrap { padding: 24px 32px; }

        table { width: 100%; border-collapse: collapse; }

        thead th {
            background: #1565c0;
            color: #fff;
            padding: 10px 14px;
            text-align: left;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: .5px;
        }
        thead th:last-child { text-align: center; }

        tbody tr:nth-child(even) { background: #f0f7ff; }

        tbody td {
            padding: 10px 14px;
            font-size: 14px;
            color: #333;
            border-bottom: 1px solid #e0e0e0;
        }
        tbody td:last-child { text-align: center; font-weight: 700; }

        .total-row td {
            background: #1565c0 !important;
            color: #fff !important;
            font-weight: 700;
            font-size: 15px;
            padding: 12px 14px;
            border: none !important;
        }

        .footer {
            text-align: center;
            padding: 20px 32px 28px;
            color: #888;
            font-size: 12px;
            border-top: 1px dashed #ddd;
        }
        .footer strong { color: #1565c0; }

        .btn-print {
            display: block;
            margin: 0 auto 24px;
            padding: 10px 32px;
            background: #1565c0;
            color: #fff;
            border: none;
            border-radius: 6px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
        }
        .btn-print:hover { background: #0d47a1; }

        @media print {
            body { background: #fff; padding: 0; }
            .ticket { box-shadow: none; border-radius: 0; width: 100%; }
            .btn-print { display: none; }
        }
    </style>
</head>
<body>

<div class="ticket">

    <div class="header">
        <h1>🍦 Helados Luz del Día</h1>
        <p>Comprobante de pedido</p>
    </div>

    <div class="meta">
        <span>Pedido #<?= $id_pedido ?></span>
        <span>Atendido por: <?= $usuario ?></span>
        <span><?= $fecha ?></span>
    </div>

    <div class="tabla-wrap">

        <button class="btn-print" onclick="window.print()">
            🖨️ Imprimir / Guardar como PDF
        </button>

        <table>
            <thead>
                <tr>
                    <th>Producto</th>
                    <th>Presentación</th>
                    <th style="text-align:center">Cantidad</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($detalles as $d): ?>
                <tr>
                    <td><?= htmlspecialchars($d['nombre_sabor']) ?></td>
                    <td><?= htmlspecialchars($d['presentacion']) ?></td>
                    <td><?= $d['cantidad'] ?></td>
                </tr>
                <?php endforeach; ?>

                <tr class="total-row">
                    <td colspan="2">TOTAL DE PIEZAS</td>
                    <td><?= $total_piezas ?></td>
                </tr>
            </tbody>
        </table>

    </div>

    <div class="footer">
        <p>Generado el <?= date('d/m/Y \a \l\a\s H:i:s') ?></p>
        <p style="margin-top: 6px;">Gracias por su pedido — <strong>Helados Luz del Día</strong></p>
    </div>

</div>

<script>
    window.addEventListener('load', () => window.print());
</script>

</body>
</html>