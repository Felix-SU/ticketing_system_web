<?php
// Обработка входа
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    include '../db.php';  // Подключаем базу данных
    $username = $_POST['username'];
    $password = $_POST['password'];
    try {
        // Проверка существования пользователя
        $sql = "SELECT * FROM users WHERE username = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$username]);
        $user = $stmt->fetch();
        if ($user && password_verify($password, $user['password'])) {
            // Авторизация успешна
            session_start();
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['role'] = $user['role'];

            // Генерация токена для куки
            $token = bin2hex(random_bytes(32)); // Генерация случайного токена

            // Сохраняем токен в базе данных
            $sql = "UPDATE users SET remember_token = ? WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$token, $user['id']]);

            // Сохраняем токен в куки (срок жизни 30 дней)
            setcookie('remember_token', $token, time() + (30 * 24 * 60 * 60), '/', '', true, true); // secure и httponly

            // Перенаправление в зависимости от роли
            if ($user['role'] == 'admin' || $user['role'] == 'root') {
                header('Location: ../admin_dashboard/index.php');
            } else {
                header('Location: ../user_dashboard/index.php');
            }
            exit;
        } else {
            echo "Неверное имя пользователя или пароль!";
        }
    } catch (PDOException $e) {
        echo "Ошибка при входе: " . $e->getMessage();
    }
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Вход</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
<h2>Вход</h2>
<div class="form-container">
    <form method="POST">
        <div class="form-group">
            <label for="username">Имя пользователя:</label>
            <input type="text" id="username" name="username" required>
        </div>
        <div class="form-group">
            <label for="password">Пароль:</label>
            <input type="password" id="password" name="password" required>
        </div>
        <div class="form-group">
            <button type="submit">Войти</button>
        </div>
    </form>
</div>
</body>
</html>
