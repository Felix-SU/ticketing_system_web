<?php
session_start();  // Начинаем сессию
include 'db.php';  // Подключаем базу данных
// Проверяем наличие токена в куки
if (isset($_COOKIE['remember_token'])) {
    // Получаем токен из куки
    $rememberToken = $_COOKIE['remember_token'];
    // Проверяем токен в базе данных
    $sql = "SELECT * FROM users WHERE remember_token = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$rememberToken]);
    $user = $stmt->fetch();
    if ($user) {
        // Если токен найден, авторизуем пользователя
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];
    }
}
// Проверяем, залогинен ли пользователь
if (!isset($_SESSION['role'])) {
    // Если нет, перенаправляем на страницу логина
    header('Location: login/index.php');
    exit;  // Останавливаем выполнение скрипта после редиректа
}
// Получаем роль из сессии
$role = $_SESSION['role'];
// Проверяем роль и перенаправляем на соответствующую страницу
if ($role == 'admin') {
    header('Location: admin_dashboard/index.php');  // Перенаправляем на панель администратора
    exit;
} elseif ($role == 'user') {
    header('Location: user_dashboard/index.php');  // Перенаправляем на панель пользователя
    exit;
} else {
    // Если роль не определена, перенаправляем на страницу логина
    header('Location: login/index.php');
    exit;
}
?>
