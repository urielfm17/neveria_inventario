<?php include("../php/helados.php"); ?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Helados</title>
    <link rel="stylesheet" href="../CSS/helados.css">
</head>

<body>

    <div class="contenedor">

        <h1>Helados</h1>

        <div class="grid-productos">
            <?php echo $cards; ?>
        </div>

        <div class="acciones">
            <button class="guardar" onclick="window.location.href='index.html'">
                Ver Pedido
            </button>

            <button class="inicio" onclick="window.location.href='index.html'">
                MENÚ PRINCIPAL
            </button>
        </div>

    </div>

    <script src="../logica/helados.js"></script>

</body>

</html>