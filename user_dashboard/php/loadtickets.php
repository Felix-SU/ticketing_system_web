<?php
session_start();
include '../../db.php'; // Подключаем базу данных
// Проверяем, авторизован ли пользователь
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}
$user_id = $_SESSION['user_id'];
$status = $_GET['status'] ?? 'open'; // По умолчанию открытые тикеты
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$tickets_per_page = 9;
$offset = ($page - 1) * $tickets_per_page;
// Определяем поле сортировки в зависимости от статуса
$order_by = ($status === 'closed') ? 't.updated_at' : 't.created_at';
// Запрос к базе для получения тикетов по странице и статусу
$sql = "SELECT t.id, t.title, t.description, t.assigned_admin, 
               u.position AS admin_position, t.created_at, t.updated_at, t.status 
        FROM tickets t
        LEFT JOIN users u ON t.assigned_admin = u.id
        WHERE t.user_id = :user_id AND t.status = :status
        ORDER BY $order_by DESC
        LIMIT :limit OFFSET :offset";
$stmt = $pdo->prepare($sql);
$stmt->bindValue(':user_id', $user_id, PDO::PARAM_INT);
$stmt->bindValue(':status', $status, PDO::PARAM_STR);
$stmt->bindValue(':limit', $tickets_per_page, PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
$stmt->execute();
$tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);
// Отправляем JSON-ответ с актуальными данными  
header('Content-Type: application/json');
echo json_encode($tickets);
?>
