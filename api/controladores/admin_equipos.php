<?php
require_once '../config/conexion.php';
header('Content-Type: application/json');

$datos = json_decode(file_get_contents("php://input"), true);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nombre = $datos['nombre'] ?? '';
    $bandera_url = $datos['bandera_url'] ?? ''; // En una versión avanzada, aquí manejaríamos la subida del archivo real
    $codigo_iso = $datos['codigo_iso'] ?? '';

    if (empty($nombre) || empty($bandera_url)) {
        echo json_encode(["status" => "error", "mensaje" => "Nombre y bandera son obligatorios."]);
        exit;
    }

    try {
        $sql = "INSERT INTO equipos (nombre, bandera_url, codigo_iso) VALUES (:nombre, :bandera, :iso)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':nombre' => $nombre,
            ':bandera' => $bandera_url,
            ':iso' => $codigo_iso
        ]);

        echo json_encode([
            "status" => "success", 
            "mensaje" => "Equipo registrado exitosamente."
        ]);
    } catch (\PDOException $e) {
        echo json_encode(["status" => "error", "mensaje" => "Error en BD: " . $e->getMessage()]);
    }
}
?>