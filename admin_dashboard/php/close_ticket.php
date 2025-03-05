<?php
include '../../db.php';
if (isset($_GET['id']) && isset($_GET['status'])) {
    $ticket_id = (int) $_GET['id']; // Приводим ID к числу
    $new_status = trim($_GET['status']); // Убираем пробелы по краям
    // Проверяем допустимые статусы
    $allowed_statuses = ['open', 'closed'];
    if (in_array($new_status, $allowed_statuses, true)) {
        $sql = "UPDATE tickets SET status = ? WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$new_status, $ticket_id]);

        echo "Успех"; // AJAX проверяет ответ
        exit;
    } else {
        echo "Ошибка: недопустимый статус ($new_status).";
    }
} else {
    echo "Ошибка: отсутствуют параметры 'id' или 'status'.";
}
?>
