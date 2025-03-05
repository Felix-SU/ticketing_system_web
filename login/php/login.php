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
        $sql = "SELECT * FROM users WHERE username = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            session_start();
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['role'] = $user['role'];

            $token = bin2hex(random_bytes(32));
            $sql = "UPDATE users SET remember_token = ? WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$token, $user['id']]);

            setcookie('remember_token', $token, time() + (30 * 24 * 60 * 60), '/', '', true, true);

            $redirectUrl = ($user['role'] == 'admin' || $user['role'] == 'root') 
                ? '../admin_dashboard/index.php' 
                : '../user_dashboard/index.php';

            echo json_encode(['success' => true, 'message' => 'Вход успешен! Перенаправление...', 'redirect' => $redirectUrl]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Неверный логин или пароль!']);
        }
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Ошибка сервера!']);
    }
}
?>
