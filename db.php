<?php
// Настройки подключения к базе данных
$host = 'localhost';
$dbname = 'ticket_system';
$username = 'root'; // Замените на свой логин
$password = ''; // Замените на свой пароль
// Подключение к базе данных
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Ошибка подключения к базе данных: " . $e->getMessage());
}
?>