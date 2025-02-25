<?php
session_start();
// Проверка, что пользователь авторизован и является администратором
if (!isset($_SESSION['user_id']) || ($_SESSION['role'] != 'admin' && $_SESSION['role'] != 'root')) {
    header('Location: ../login/index.php');
    exit;
}
include '../db.php';  // Подключаем базу данных
// Получаем ID текущего администратора
$admin_id = $_SESSION['user_id'];
// Обработка закрытия тикета
if (isset($_GET['close_ticket_id'])) {
    $ticket_id = $_GET['close_ticket_id'];
    // Обновление статуса тикета на 'closed'
    $sql = "UPDATE tickets SET status = 'closed' WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$ticket_id]);
    header('Location: index.php'); // Перенаправляем обратно на страницу с тикетами
    exit;
}
// Получаем открытые тикеты, назначенные текущему администратору
$sql_open = "SELECT t.id, t.title, t.description, t.status, t.created_at, t.updated_at, u.username, u.position
            FROM tickets t 
            JOIN users u ON t.user_id = u.id
            WHERE t.status = 'open' AND t.assigned_admin = ?
            ORDER BY t.created_at DESC";
$stmt_open = $pdo->prepare($sql_open);
$stmt_open->execute([$admin_id]);
$open_tickets = $stmt_open->fetchAll();
// Получаем закрытые тикеты, назначенные текущему администратору
$sql_closed = "SELECT t.id, t.title, t.description, t.status, t.created_at, t.updated_at, u.username, u.position
              FROM tickets t 
              JOIN users u ON t.user_id = u.id
              WHERE t.status = 'closed' AND t.assigned_admin = ?
              ORDER BY t.created_at DESC";
$stmt_closed = $pdo->prepare($sql_closed);
$stmt_closed->execute([$admin_id]);
$closed_tickets = $stmt_closed->fetchAll();
// Получаем всех пользователей для изменения их ролей
$sql_users = "SELECT id, username, role,position FROM users";
$stmt_users = $pdo->prepare($sql_users);
$stmt_users->execute();
$users = $stmt_users->fetchAll();
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Управление тикетами</title>
    <link rel="stylesheet" href="css/styles.css">

</head>
<body>
<h2>Управление заявками</h2>
<div class="tabs">
    <button class="tab-button active" id="open-tab-btn">Открытые заявки</button>
    <button class="tab-button" id="closed-tab-btn">Закрытые заявки</button>
    <?php if ( $_SESSION['role'] == 'root'): ?>
        <button class="tab-button" id="roles-tab-btn">Управление пользователями</button>
        <button class="tab-button" id="register-tab-btn">Регистрация пользователей</button>
    <?php endif; ?>
</div>
<!-- Таблица с открытыми тикетами -->
<h4 id="text_update_ticket"style="color:green;display:none; ">Появились новые заявки</h3>
<div id="open-tickets" class="tab-content">
<h3 style="text-align: center;">Открытые заявки</h3>
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Имя отправителя</th>
                <th>Заголовок</th>
                <th>Описание</th>
                <th>Дата создания</th>
                <th>Статус</th>
                <th>Действие</th>
                <th>Детали заявки</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($open_tickets as $ticket): ?>
                <tr id="ticket-<?= $ticket['id'] ?>">
                    <td><?= $ticket['id'] ?></td>
                    <td><?= strlen($ticket['position']) > 30 ? htmlspecialchars(mb_substr($ticket['position'], 0, 30)) . '...' : htmlspecialchars($ticket['position']) ?></td>
                    <td><?= strlen($ticket['title']) > 15 ? htmlspecialchars(mb_substr($ticket['title'], 0, 15)) . '...' : htmlspecialchars($ticket['title']) ?></td>
                    <td><?= strlen($ticket['description']) > 10 ? htmlspecialchars(mb_substr($ticket['description'], 0, 10)) . '...' : htmlspecialchars($ticket['description']) ?></td>
                    
                    <td><?= $ticket['created_at'] ?></td>
                    <td class="ticket-status status-open"><?= $ticket['status'] ?></td>
                    <td>
                    <button class="toggle-details-btn" onclick="toggleDetails(<?= $ticket['id'] ?>)">Показать детали</button>
                    </td>
                    <td>
                        <!-- Кнопка закрытия тикета -->
                        <a href="?close_ticket_id=<?= $ticket['id'] ?>" class="close-ticket-btn">Закрыть заявку</a>
                    </td>
                     <tr id="details-<?= $ticket['id'] ?>" class="ticket-details">
                    <td colspan="10">
                        <div class="ticket-details-box">
                            <p><strong>ID:</strong> <?= htmlspecialchars($ticket['id']) ?></p>
                            <p><strong>Имя отправителя:</strong> <?= htmlspecialchars($ticket['position']) ?></p>
                            <p><strong>Заголовок:</strong> <?= htmlspecialchars($ticket['title']) ?></p>
                            <p><strong>Описание:</strong> <?= htmlspecialchars($ticket['description']) ?></p>
                            
                            <p><strong>Статус:</strong> <span class="<?= $ticket['status'] === 'open' ? 'status-open' : 'status-closed' ?>">
                            <?= htmlspecialchars($ticket['status']) ?>
                            </span></p>
                            <p><strong>Дата создания:</strong> <?= $ticket['created_at'] ?></p>
                        </div>
                    </td>
                    </tr>  
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
</div>
<!-- Таблица с закрытыми тикетами -->
<div id="closed-tickets" class="tab-content" style="display: none;">
<h3 style="text-align: center;">Закрытые заявки</h3>
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Имя отправителя</th>
                <th>Заголовок</th>
                <th>Описание</th>
                <th>Дата создания</th>
                <th>Дата закрытия </th>
                <th>Статус</th>
                <th>Детали заявки</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($closed_tickets as $ticket): ?>
                <tr id="ticket-<?= $ticket['id'] ?>">
                    <td><?= $ticket['id'] ?></td>
                    <td><?= strlen($ticket['position']) > 30 ? htmlspecialchars(mb_substr($ticket['position'], 0, 30)) . '...' : htmlspecialchars($ticket['position']) ?></td>
                    <td><?= strlen($ticket['title']) > 15 ? htmlspecialchars(mb_substr($ticket['title'], 0, 15)) . '...' : htmlspecialchars($ticket['title']) ?></td>
                    <td><?= strlen($ticket['description']) > 20 ? htmlspecialchars(mb_substr($ticket['description'], 0, 20)) . '...' : htmlspecialchars($ticket['description']) ?></td>
                    <td><?= $ticket['created_at'] ?></td>
                    <td><?= $ticket['updated_at'] ?></td>
                    <td class="ticket-status status-closed"><?= $ticket['status'] ?></td>
                    <td>
                    <button class="toggle-details-btn" onclick="toggleDetails(<?= $ticket['id'] ?>)">Показать детали</button>
                    </td>
                    <tr id="details-<?= $ticket['id'] ?>" class="ticket-details">
                    <td colspan="10">
                    <div class="ticket-details-box">
                        <p><strong>ID:</strong> <?= htmlspecialchars($ticket['id']) ?></p>
                        <p><strong>Заголовок:</strong> <?= htmlspecialchars($ticket['title']) ?></p>
                        <p><strong>Описание:</strong> <?= htmlspecialchars($ticket['description']) ?></p>
                        <p><strong>Имя отправителя:</strong> <?= htmlspecialchars($ticket['position']) ?></p>
                        <p><strong>Статус:</strong> <span class="<?= $ticket['status'] === 'open' ? 'status-open' : 'status-closed' ?>">
                        <?= htmlspecialchars($ticket['status']) ?>
                        </span></p>
                        <p><strong>Дата создания:</strong> <?= $ticket['created_at'] ?></p>
                    </div>
                    </td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
</div>
<div id="register-form-container" style="display: none; max-width: 400px; margin: 0 auto;">
    <h2>Регистрация</h2>
    <form id="register-form">
        <div class="form-group">
            <label for="login">Логин:</label>
            <input type="text" id="login" name="login" required maxlength="30">
            <small class="error-message" id="login_error" style="color: red;"></small>
        </div>
        <div class="form-group">
            <label for="password">Пароль:</label>
            <input type="password" id="password" name="password" required maxlength="50">
            <small class="error-message" id="password_error" style="color: red;"></small>
        </div>
        <div class="form-group">
            <label for="position">Имя:</label>
            <input type="text" id="position" name="position" required maxlength="50">
        </div>
        <div class="form-group">
            <button type="submit">Зарегистрироваться</button>
        </div>
    </form>
    <p id="register-message"></p>
</div>
<!-- Таблица с пользователями для изменения их ролей -->
<div id="roles-management" class="tab-content" style="display: none;">
    <h3 style="text-align: center;">Управление пользователями</h3>
    <table class="roles-table">
        <thead>
            <tr>
                <th>ID</th>
                <th>Логин Пользователя</th>
                <th>Имя пользователя</th>
                <th>Изменить роль</th>
                <th>Изменить пароль</th>
            </tr>
        </thead>
        <tbody>
        <?php foreach ($users as $user): ?>
    <tr>
        <td><?= $user['id'] ?></td>
        <td><?= htmlspecialchars($user['username']) ?></td>
        <td><?= htmlspecialchars($user['position']) ?></td>
        <td>
            <form class="role-form" data-user-id="<?= $user['id'] ?>" method="POST">
                <input type="hidden" name="user_id" value="<?= $user['id'] ?>">
                <select name="role">
                    <option value="user" <?= $user['role'] == 'user' ? 'selected' : '' ?>>User</option>
                    <option value="admin" <?= $user['role'] == 'admin' ? 'selected' : '' ?>>Admin</option>
                    <option value="root" <?= $user['role'] == 'root' ? 'selected' : '' ?>>Root</option>
                </select>
                <button type="submit">Изменить роль</button>
            </form>
            <span id="role-message-<?= $user['id'] ?>"></span> <!-- Место для сообщения об изменении роли -->
        </td>
        <!-- Кнопка для изменения пароля -->
        <td>
        <button id="showpassform-<?= $user['id'] ?>" onclick="showPasswordForm(<?= $user['id'] ?>)">Изменить пароль</button>
            <!-- Форма для изменения пароля -->
            <div id="change-password-form-<?= $user['id'] ?>" style="display:none;">
                <form class="password-form" data-user-id="<?= $user['id'] ?>" method="POST">
                    <input type="hidden" name="user_id" value="<?= $user['id'] ?>">
                    <label for="new_password">Новый пароль:</label>
                    <input type="password" name="new_password" required>
                    <button type="submit">Сохранить</button>
                </form>
                <span id="password-message-<?= $user['id'] ?>"></span> <!-- Место для сообщения об изменении пароля -->
            </div>
        </td>
    </tr>
<?php endforeach; ?>
        </tbody>
    </table>
</div>
<!-- Кнопка выхода -->
<a href="../logout.php" class="logout-btn">Выйти</a>
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="js/script.js"></script>
</body>
</html>
