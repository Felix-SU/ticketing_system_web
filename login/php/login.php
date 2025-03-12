<?php
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    include '../../db.php';
    header('Content-Type: application/json');

    $username = trim($_POST['username']);
    $password = trim($_POST['password']);

    if (empty($username) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Заполните все поля!']);
        exit;
    }

    try {
        $sql = "SELECT id, username, password, role FROM users WHERE username = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }

            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['role'] = $user['role'];

            $token = bin2hex(random_bytes(32));
            $sql = "UPDATE users SET remember_token = ? WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$token, $user['id']]);

            // Исправляем setcookie, чтобы работало на HTTP
            setcookie('remember_token', $token, [
                'expires' => time() + (30 * 24 * 60 * 60), // 30 дней
                'path' => '/',
                'secure' => false, // Отключаем secure, так как нет HTTPS
                'httponly' => true,
                'samesite' => 'Lax' // Меняем Strict на Lax, чтобы работало при редиректах
            ]);

            $redirectUrl = ($user['role'] == 'admin' || $user['role'] == 'root') 
                ? '../admin_dashboard/index.php' 
                : '../user_dashboard/index.php';

            echo json_encode(['success' => true, 'message' => 'Вход успешен! Перенаправление...', 'redirect' => $redirectUrl]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Неверный логин или пароль!']);
        }
    } catch (PDOException $e) {
        error_log("Ошибка входа: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Ошибка базы данных. Попробуйте позже.']);
    }
}
?>
