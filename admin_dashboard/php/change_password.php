<?php
session_start();
// Проверка, что пользователь авторизован и является администратором
if (!isset($_SESSION['user_id']) || ($_SESSION['role'] != 'admin' && $_SESSION['role'] != 'root')) {
    echo json_encode(['success' => false, 'message' => 'Недостаточно прав']);
    exit;
}
include '../../db.php';  // Подключаем базу данных
// Проверка, что форма была отправлена
if (isset($_POST['user_id']) && isset($_POST['new_password'])) {
    $user_id = $_POST['user_id'];
    $new_password = $_POST['new_password'];

    // Хешируем новый пароль
    $hashed_password = password_hash($new_password, PASSWORD_BCRYPT);

    // Обновление пароля пользователя в базе данных
    $sql = "UPDATE users SET password = ? WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    if ($stmt->execute([$hashed_password, $user_id])) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Некорректные данные']);
}
exit;
?>
