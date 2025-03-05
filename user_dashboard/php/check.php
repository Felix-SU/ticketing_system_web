<?php
session_start();
include '../../db.php'; // Подключаем базу данных
// Проверяем, авторизован ли пользователь
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}
$user_id = $_SESSION['user_id'];
// Запрос к базе для получения актуальных данных тикетов с позицией назначенного администратора
$sql = "SELECT t.id, t.title, t.description, t.assigned_admin, 
       u.position AS admin_position, t.created_at, t.updated_at, t.status 
FROM tickets t
LEFT JOIN users u ON t.assigned_admin = u.id
WHERE t.user_id = ?
";
$stmt = $pdo->prepare($sql);
$stmt->execute([$user_id]);
$tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);
// Отправляем JSON-ответ с актуальными данными  
header('Content-Type: application/json');
echo json_encode($tickets);
?>
