<?php
session_start();
include '../../db.php';
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $title = $_POST['title'] ?? '';
    $description = $_POST['description'] ?? '';
    $assigned_to = $_POST['assigned_admin'] ?? '';
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['status' => 'error', 'message' => 'Ошибка: пользователь не авторизован.']);
        exit;
    }
    $user_id = $_SESSION['user_id'];
    if (!empty($title) && !empty($description) && !empty($assigned_to)) {
        try {
            $sql = "INSERT INTO tickets (user_id, title, description, status, assigned_admin) 
                    VALUES (?, ?, ?, 'open', ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$user_id, $title, $description, $assigned_to]);

            echo json_encode(['status' => 'success', 'message' => 'Заявка отправленна!']);
        } catch (PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => 'Ошибка базы данных: ' . $e->getMessage()]);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Заполните все поля!']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Некорректный запрос.']);
}
?>