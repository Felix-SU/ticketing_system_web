<?php
header('Content-Type: application/json');
include '../../db.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Некорректный метод запроса"]);
    exit;
}
// Получаем данные
$username = isset($_POST['login']) ? trim($_POST['login']) : '';
$password = isset($_POST['password']) ? $_POST['password'] : '';
$position = isset($_POST['position']) ? trim($_POST['position']) : '';
if (empty($username) || empty($password) || empty($position)) {
    echo json_encode(["status" => "error", "message" => "Все поля обязательны!"]);
    exit;
}
if (strlen($username) > 30 || strlen($password) > 50 || strlen($position) > 50) {
    echo json_encode(["status" => "error", "message" => "Превышена допустимая длина полей"]);
    exit;
}
$passwordHash = password_hash($password, PASSWORD_DEFAULT);
$role = 'user';
try {
    // Проверяем, существует ли пользователь
    $sql = "SELECT COUNT(*) FROM users WHERE username = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$username]);
    if ($stmt->fetchColumn() > 0) {
        echo json_encode(["status" => "error", "message" => "Пользователь уже существует!"]);
        exit;
    }
    // Добавляем нового пользователя
    $sql = "INSERT INTO users (username, password, role, position) VALUES (?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$username, $passwordHash, $role, $position]);
    echo json_encode(["status" => "success", "message" => "Регистрация успешна!"]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Ошибка сервера, попробуйте позже."]);
}
?>
