<?php
session_start();
// Уничтожаем все данные сессии
session_unset(); // Убираем все переменные сессии
session_destroy(); // Уничтожаем саму сессию
// Перенаправляем пользователя на страницу входа
header('Location: login/index.php');
exit;
?>
