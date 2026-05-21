<?php
session_start();
require_once __DIR__ . '/conexion.php';

header('Content-Type: application/json; charset=utf-8');

// Leer JSON enviado desde fetch()
$input = json_decode(file_get_contents('php://input'), true);

$email    = trim($input['email'] ?? '');
$password = trim($input['password'] ?? '');

// Validar campos
if ($email === '' || $password === '') {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Completa todos los campos.'
    ]);
    exit;
}

// Buscar usuario por correo
$sql = "SELECT id_usuario, username, nombre_completo, password
        FROM usuarios
        WHERE email = ?
        LIMIT 1";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al preparar la consulta.'
    ]);
    exit;
}

$stmt->bind_param("s", $email);
$stmt->execute();

$resultado = $stmt->get_result();
$usuario = $resultado->fetch_assoc();

$stmt->close();

if (!$usuario || $password !== $usuario['password']) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Correo o contraseña incorrectos.'
    ]);
    exit;
}

// Guardar variables de sesión
$_SESSION['id_usuario'] = $usuario['id_usuario'];
$_SESSION['username'] = $usuario['username'];
$_SESSION['nombre_completo'] = $usuario['nombre_completo'];

// Respuesta exitosa
echo json_encode([
    'success' => true,
    'redirect' => '../vistas/index.html'
]);