<?php
require_once '../config/conexion.php';
header('Content-Type: application/json');

$datos = json_decode(file_get_contents("php://input"), true);

$torneo_id = $datos['torneo_id'] ?? null;
$grupos = $datos['grupos'] ?? null;

if (!$torneo_id || !is_array($grupos)) {
    echo json_encode(["status" => "error", "mensaje" => "Faltan datos requeridos (torneo_id, grupos)."]);
    exit;
}

try {
    $pdo->beginTransaction();

    // 1. Eliminar TODAS las asignaciones previas para este torneo
    $sql_delete = "DELETE FROM torneo_equipos WHERE torneo_id = :torneo_id";
    $stmt_delete = $pdo->prepare($sql_delete);
    $stmt_delete->execute([':torneo_id' => $torneo_id]);

    // 2. Insertar las nuevas asignaciones
    $sql_insert = "INSERT INTO torneo_equipos (torneo_id, equipo_id, grupo) VALUES (:torneo_id, :equipo_id, :grupo)";
    $stmt_insert = $pdo->prepare($sql_insert);

    foreach ($grupos as $letraGrupo => $equipos) {
        // Solo procesamos si el grupo tiene equipos. Los grupos vacíos no se guardan.
        if (empty($equipos)) continue; 

        foreach ($equipos as $equipo) {
            $stmt_insert->execute([
                ':torneo_id' => $torneo_id,
                ':equipo_id' => $equipo['id'],
                ':grupo' => $letraGrupo
            ]);
        }
    }

    $pdo->commit();
    echo json_encode(["status" => "success", "mensaje" => "Asignaciones guardadas correctamente."]);

} catch (\Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(["status" => "error", "mensaje" => "Error en la operación de base de datos: " . $e->getMessage()]);
}
?>