<?php
require_once '../config/conexion.php';
header('Content-Type: application/json');

try {
    // Obtenemos el torneo más reciente
    $sql = "SELECT id, nombre, año, tipo, estado FROM torneos ORDER BY id DESC LIMIT 1";
    $stmt = $pdo->query($sql);
    $torneo = $stmt->fetch();

    if ($torneo) {
        echo json_encode(["status" => "success", "torneo" => $torneo]);
    } else {
        echo json_encode(["status" => "vacio", "mensaje" => "No hay torneos registrados."]);
    }
} catch (\PDOException $e) {
    echo json_encode(["status" => "error", "mensaje" => $e->getMessage()]);
}
?>