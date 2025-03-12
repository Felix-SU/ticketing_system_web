<?php
session_start();
// Очистка всех данных сессии
$_SESSION = [];
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}
session_destroy(); // Полное удаление сессии
// Удаление куки remember_token
setcookie('remember_token', '', time() - 3600, '/');
// Перенаправление на страницу входа
header('Location: login/index.php');
exit;
?>
