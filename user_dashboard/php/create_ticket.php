<?php
include 'db.php';
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $description = $_POST['description'];
    $assigned_to = $_POST['assigned_to'];

    if (!empty($description) && !empty($assigned_to)) {
        // Добавляем тикет в базу данных
        $sql = "INSERT INTO tickets (description, status, assigned_to) VALUES (?, 'Новый', ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$description, $assigned_to]);

        header('Location: index.php'); // Перенаправляем на главную страницу
        exit;
    } else {
        $error = "Пожалуйста, заполните все поля!";
    }
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Создать тикет</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Создание нового тикета</h1>
    <form action="create_ticket.php" method="post">
        <label for="description">Описание тикета:</label>
        <textarea id="description" name="description" required></textarea>

        <label for="assigned_to">Кому назначен:</label>
        <input type="text" id="assigned_to" name="assigned_to" required>

        <button type="submit">Создать тикет</button>

        <?php if (isset($error)): ?>
            <p class="error"><?php echo $error; ?></p>
        <?php endif; ?>
    </form>
    <a href="index.php">Назад</a>
</body>
</html>