<?php
require '../../db.php'; // Подключаемся к БД
// Получаем время последней заявки в таблице на клиенте
$lastTicketTime = isset($_GET['last_ticket_time']) ? $_GET['last_ticket_time'] : '2000-01-01 00:00:00';
// Запрашиваем новые заявки
$sql = "SELECT * FROM tickets WHERE created_at > ? ORDER BY created_at ASC";
$stmt = $pdo->prepare($sql);
$stmt->execute([$lastTicketTime]);
$newTickets = $stmt->fetchAll(PDO::FETCH_ASSOC);
// Отправляем JSON-ответ
echo json_encode($newTickets);
exit;