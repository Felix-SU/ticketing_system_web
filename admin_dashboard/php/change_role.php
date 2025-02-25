<?php
session_start();
// Проверка, что пользователь авторизован и является администратором
if (!isset($_SESSION['user_id']) || ($_SESSION['role'] != 'admin' && $_SESSION['role'] != 'root')) {
    echo json_encode(['success' => false, 'message' => 'Недостаточно прав']);
    exit;
}
include '../../db.php';  // Подключаем базу данных
// Получаем данные для изменения роли
if (isset($_POST['user_id']) && isset($_POST['role'])) {
    $user_id = $_POST['user_id'];
    $role = $_POST['role'];

    // Обновление роли пользователя в базе данных
    $sql = "UPDATE users SET role = ? WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    if ($stmt->execute([$role, $user_id])) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Некорректные данные']);
}
exit;
?>