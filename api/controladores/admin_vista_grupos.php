<?php
require_once '../config/conexion.php';
header('Content-Type: application/json');

$torneo_id = $_GET['torneo_id'] ?? null;

if (!$torneo_id) {
    echo json_encode(["status" => "error", "mensaje" => "ID de torneo no proporcionado."]);
    exit;
}

try {
    // 1. Obtener grupos y sus equipos
    $sql_grupos = "
        SELECT 
            te.grupo, 
            e.id, 
            e.nombre, 
            e.bandera_url 
        FROM torneo_equipos te
        JOIN equipos e ON te.equipo_id = e.id
        WHERE te.torneo_id = :torneo_id
        ORDER BY te.grupo, e.nombre
    ";
    $stmt_grupos = $pdo->prepare($sql_grupos);
    $stmt_grupos->execute([':torneo_id' => $torneo_id]);
    $equipos_con_grupo = $stmt_grupos->fetchAll();

    $grupos = [];
    foreach ($equipos_con_grupo as $equipo) {
        if (!isset($grupos[$equipo['grupo']])) {
            $grupos[$equipo['grupo']] = [];
        }
        $grupos[$equipo['grupo']][] = $equipo;
    }

    // 2. Obtener equipos sin grupo en este torneo
    $sql_sin_grupo = "
        SELECT 
            e.id, 
            e.nombre, 
            e.bandera_url 
        FROM equipos e
        LEFT JOIN torneo_equipos te ON e.id = te.equipo_id AND te.torneo_id = :torneo_id
        WHERE te.id IS NULL
        ORDER BY e.nombre
    ";
    $stmt_sin_grupo = $pdo->prepare($sql_sin_grupo);
    $stmt_sin_grupo->execute([':torneo_id' => $torneo_id]);
    $equipos_sin_grupo = $stmt_sin_grupo->fetchAll();

    echo json_encode([
        "status" => "success",
        "data" => ["grupos" => $grupos, "equiposSinGrupo" => $equipos_sin_grupo]
    ]);
} catch (\PDOException $e) {
    echo json_encode(["status" => "error", "mensaje" => "Error en BD: " . $e->getMessage()]);
}