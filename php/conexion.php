<?php
$host = "localhost";
$usuario = "root";
$contrasena = "NuevaClave";
$base_datos = "heladosluzdeldia";

$conn = new mysqli($host, $usuario, $contrasena, $base_datos);

if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}

$conn->set_charset("utf8");
?>