<?php
include '../../db.php';
// Проверяем, существуют ли параметры id и status
if (isset($_GET['id']) && isset($_GET['status'])) {
    $ticket_id = $_GET['id'];
    $new_status = $_GET['status'];
    // Проверяем, что статус имеет допустимое значение
    if (in_array($new_status, ['Новый', 'В процессе', 'Закрыт'])) {
        // Обновляем статус тикета
        $sql = "UPDATE tickets SET status = ? WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$new_status, $ticket_id]);

        header('Location: index.php'); // Перенаправляем на главную страницу
        exit;
    } else {
        // Если статус недопустим
        echo "Ошибка: недопустимый статус.";
    }
} else {
    // Если параметры отсутствуют
    echo "Ошибка: отсутствуют параметры 'id' или 'status'.";
}
?>
