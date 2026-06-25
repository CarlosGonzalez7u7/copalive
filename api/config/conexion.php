<?php
// Ruta al archivo .env (ajusta el __DIR__ dependiendo de dónde coloques el .env)
$envPath = __DIR__ . '/../../.env'; 

if (!file_exists($envPath)) {
    die(json_encode(["error" => "Archivo de configuración no encontrado."]));
}

// Leer las variables del .env
$env = parse_ini_file($envPath);

$host     = $env['DB_HOST'];
$db       = $env['DB_NAME'];
$usuario  = $env['DB_USER'];
$password = $env['DB_PASS'];
$charset  = $env['DB_CHARSET'];

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";

try {
    $pdo = new PDO($dsn, $usuario, $password, $options);
} catch (\PDOException $e) {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(["error" => "Error de conexión", "detalle" => $e->getMessage()]);
    exit;
}