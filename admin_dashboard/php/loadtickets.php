<?php
session_start();
include '../../db.php'; // Подключаем базу данных
// Проверяем, авторизован ли пользователь
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}
$admin_id = $_SESSION['user_id']; // ID текущего админа
$status = $_GET['status'] ?? 'open'; // По умолчанию открытые тикеты
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$tickets_per_page = 20;
$offset = ($page - 1) * $tickets_per_page;
// Определяем поле сортировки в зависимости от статуса
$order_by = ($status === 'closed') ? 't.updated_at' : 't.created_at';
// Запрос к базе для получения тикетов по странице и статусу
$sql = "SELECT t.id, t.title, t.description, t.status, t.created_at, t.updated_at, 
               u.username, u.position
        FROM tickets t 
        JOIN users u ON t.user_id = u.id
        WHERE t.assigned_admin = :admin_id AND t.status = :status
        ORDER BY $order_by DESC
        LIMIT :limit OFFSET :offset";
$stmt = $pdo->prepare($sql);
$stmt->bindValue(':admin_id', $admin_id, PDO::PARAM_INT);
$stmt->bindValue(':status', $status, PDO::PARAM_STR);
$stmt->bindValue(':limit', $tickets_per_page, PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
$stmt->execute();
$tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);
// Отправляем JSON-ответ с актуальными данными  
header('Content-Type: application/json');
echo json_encode($tickets);
?>
