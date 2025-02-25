<?php
header('Content-Type: application/json');
include '../../db.php';  // Подключаем базу данных
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $username = $_POST['login']; // Получаем логин
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT); // Хешируем пароль
    $role = 'user'; // Роль по умолчанию
    $position = $_POST['position']; // Получаем имя
    try {
        // Проверка, существует ли уже пользователь
        $sql = "SELECT * FROM users WHERE username = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$username]);
        $existingUser = $stmt->fetch();
        if ($existingUser) {
            echo json_encode(["status" => "error", "message" => "Пользователь с таким именем уже существует!"]);
            exit;
        } else {
            // Добавляем пользователя
            $sql = "INSERT INTO users (username, password, role, position) VALUES (?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$username, $password, $role, $position]);

            echo json_encode(["status" => "success", "message" => "Пользователь успешно зарегистрирован!"]);
            exit;
        }
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => "Ошибка при регистрации: " . $e->getMessage()]);
        exit;
    }
}
?>
