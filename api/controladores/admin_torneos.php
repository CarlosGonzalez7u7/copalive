<?php
require_once '../config/conexion.php';
header('Content-Type: application/json');

// Leer los datos JSON que enviará el JavaScript del frontend
$datos = json_decode(file_get_contents("php://input"), true);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nombre = $datos['nombre'] ?? '';
    $año = $datos['año'] ?? '';
    $tipo = $datos['tipo'] ?? '';

    if (empty($nombre) || empty($año) || empty($tipo)) {
        echo json_encode(["status" => "error", "mensaje" => "Faltan datos requeridos."]);
        exit;
    }

    try {
        $sql = "INSERT INTO torneos (nombre, año, tipo) VALUES (:nombre, :ano, :tipo)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':nombre' => $nombre,
            ':ano' => $año,
            ':tipo' => $tipo
        ]);

        echo json_encode([
            "status" => "success", 
            "mensaje" => "Torneo creado exitosamente.",
            "id" => $pdo->lastInsertId()
        ]);
    } catch (\PDOException $e) {
        echo json_encode(["status" => "error", "mensaje" => "Error en BD: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "mensaje" => "Método no permitido."]);
}
?>