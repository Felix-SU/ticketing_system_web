<?php
session_start();
include 'db.php';
// Проверяем, есть ли remember_token в куках, но нет активной сессии
if (!isset($_SESSION['user_id']) && isset($_COOKIE['remember_token'])) {
    $rememberToken = $_COOKIE['remember_token'];

    // Проверяем, есть ли этот токен в БД
    $sql = "SELECT id, username, role FROM users WHERE remember_token = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$rememberToken]);
    $user = $stmt->fetch();

    if ($user) {
        // Создаём сессию
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];
        session_regenerate_id(true); // Защита от фиксации сессии
    }
}
// Если пользователь не авторизован, отправляем на логин
if (!isset($_SESSION['role'])) {
    header('Location: login/index.php');
    exit;
}
// Перенаправление в зависимости от роли
$role = $_SESSION['role'];
if ($role == 'admin' || $role == 'root') {
    header('Location: admin_dashboard/index.php');
} elseif ($role == 'user') {
    header('Location: user_dashboard/index.php');
} else {
    header('Location: login/index.php');
}
exit;
?>
