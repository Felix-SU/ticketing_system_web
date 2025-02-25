<?php
session_start();
include 'db.php'; // Подключаем базу данных
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Получаем данные из формы
    $title = $_POST['title'];
    $description = $_POST['description'];
    $user_id = $_SESSION['user_id']; // Сохраняем идентификатор пользователя

    try {
        // Добавление тикета в базу данных
        $sql = "INSERT INTO tickets (title, description, user_id, status) VALUES (?, ?, ?, 'open')";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$title, $description, $user_id]);

        echo "Тикет успешно отправлен!";
    } catch (PDOException $e) {
        echo "Ошибка при отправке тикета: " . $e->getMessage();
    }
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Отправить тикет</title>
</head>
<body>
<h2>Отправить новый тикет</h2>
<form method="POST">
    <label for="title">Заголовок:</label>
    <input type="text" id="title" name="title" required><br><br>
    <label for="description">Описание:</label><br>
    <textarea id="description" name="description" rows="4" required></textarea><br><br>
    <button type="submit">Отправить тикет</button>
</form>
</body>
</html>
