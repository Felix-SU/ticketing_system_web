<?php
session_start();
include '../../db.php'; // Подключаем базу данных
// Проверяем, авторизован ли пользователь
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}
$admin_id = $_SESSION['user_id']; // ID текущего админа
// Получаем все тикеты (чтобы можно было проверить новые)
$sql = "SELECT t.id, t.title, t.description, t.status, t.created_at, t.updated_at, 
               u.username, u.position
        FROM tickets t 
        JOIN users u ON t.user_id = u.id
        WHERE t.assigned_admin = ?
        ORDER BY t.created_at DESC";
$stmt = $pdo->prepare($sql);
$stmt->execute([$admin_id]);
$tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);
// Отправляем JSON-ответ с актуальными данными
header('Content-Type: application/json');
echo json_encode($tickets);
?>
