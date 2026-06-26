<?php
require_once '../config/conexion.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nombre = $_POST['nombre'] ?? '';
    $tipo_bandera = $_POST['tipo_bandera'] ?? '';
    $url_final = '';

    if (empty($nombre)) {
        echo json_encode(["status" => "error", "mensaje" => "El nombre del equipo es obligatorio."]);
        exit;
    }
    
    if ($tipo_bandera === 'archivo') {
        if (isset($_FILES['archivo']) && $_FILES['archivo']['error'] === UPLOAD_ERR_OK) {
            $directorio_destino = '../../public/assets/banderas/';
            
            if (!file_exists($directorio_destino)) {
                mkdir($directorio_destino, 0777, true);
            }

            $extension = pathinfo($_FILES['archivo']['name'], PATHINFO_EXTENSION);
            $nombre_archivo = time() . '_' . preg_replace('/[^a-zA-Z0-9_-]/', '', str_replace(' ', '_', $nombre)) . '.' . $extension;
            $ruta_fisica = $directorio_destino . $nombre_archivo;

            if (move_uploaded_file($_FILES['archivo']['tmp_name'], $ruta_fisica)) {
                $url_final = 'assets/banderas/' . $nombre_archivo;
            } else {
                echo json_encode(["status" => "error", "mensaje" => "Error al guardar la imagen en el servidor."]);
                exit;
            }
        } else {
            echo json_encode(["status" => "error", "mensaje" => "Error al subir el archivo de la bandera."]);
            exit;
        }
    } elseif ($tipo_bandera === 'url') {
        $url_final = $_POST['url'] ?? '';
        if (empty($url_final)) {
            echo json_encode(["status" => "error", "mensaje" => "La URL de la bandera no puede estar vacía."]);
            exit;
        }
        if (!filter_var($url_final, FILTER_VALIDATE_URL)) {
            echo json_encode(["status" => "error", "mensaje" => "La URL de la bandera no es válida."]);
            exit;
        }
    } else {
        echo json_encode(["status" => "error", "mensaje" => "Debe seleccionar un tipo de bandera (archivo o URL)."]);
        exit;
    }

    try {
        $sql = "INSERT INTO equipos (nombre, bandera_url) VALUES (:nombre, :bandera)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':nombre' => $nombre,
            ':bandera' => $url_final
        ]);

        echo json_encode([
            "status" => "success", 
            "mensaje" => "Equipo registrado exitosamente.",
            "id" => $pdo->lastInsertId(),
            "bandera_url" => $url_final
        ]);
    } catch (\PDOException $e) {
        echo json_encode(["status" => "error", "mensaje" => "Error en BD: " . $e->getMessage()]);
    }
}
?>