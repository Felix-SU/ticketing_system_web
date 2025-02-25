<?php
session_start();

// Проверка, что пользователь авторизован
if (!isset($_SESSION['user_id'])) {
    header('Location: ../login/login.php');
    exit;
}

include '../db.php';  // Подключаем базу данных

// Получаем тикеты пользователя
$user_id = $_SESSION['user_id'];

// Запрос для получения открытых тикетов с информацией о назначенном администраторе
$sql_open = "SELECT t.id, t.title, t.description,  t.status, t.created_at, t.updated_at, u.position AS assigned_admin
             FROM tickets t 
             LEFT JOIN users u ON t.assigned_admin = u.id
             WHERE t.user_id = ? AND t.status = 'open'
             ORDER BY t.created_at DESC";
$stmt_open = $pdo->prepare($sql_open);
$stmt_open->execute([$user_id]);
$open_tickets = $stmt_open->fetchAll();

// Запрос для получения закрытых тикетов с информацией о назначенном администраторе
$sql_closed = "SELECT t.id, t.title, t.description, t.status, t.created_at, t.updated_at,  u.position AS assigned_admin
               FROM tickets t 
               LEFT JOIN users u ON t.assigned_admin = u.id
               WHERE t.user_id = ? AND t.status = 'closed'
               ORDER BY t.created_at DESC";
$stmt_closed = $pdo->prepare($sql_closed);
$stmt_closed->execute([$user_id]);
$closed_tickets = $stmt_closed->fetchAll();

// Получение списка администраторов
$sql_admins = "SELECT id, username, position FROM users WHERE role IN ('admin', 'root')";
$stmt_admins = $pdo->query($sql_admins);
$admins = $stmt_admins->fetchAll();

// Получаем ID текущего пользователя
$user_id = $_SESSION['user_id'];

// Получаем позицию пользователя
$sql = "SELECT position FROM users WHERE id = ?";
$stmt = $pdo->prepare($sql);
$stmt->execute([$user_id]);
$position = $stmt->fetchColumn();

// Обработка отправки нового тикета
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $title = $_POST['title'];
    $description = $_POST['description'];  // Получаем имя отправителя
    $assigned_admin = $_POST['assigned_admin']; // Получаем ID выбранного администратора

    try {
        // Вставляем новый тикет в базу данных с полем position
        $sql = "INSERT INTO tickets (user_id, title, description,  assigned_admin, status) 
                VALUES (?, ?, ?, ?,   'open')";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$user_id, $title, $description,  $assigned_admin]);

        // Перенаправляем пользователя на страницу с тикетами после отправки
        header('Location: ' . $_SERVER['PHP_SELF']); 
        exit;  // Прекращаем выполнение скрипта, чтобы избежать повторной отправки формы
    } catch (PDOException $e) {
        echo "Ошибка при создании тикета: " . $e->getMessage();
    }
}

?>

<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Тикеты пользователя</title>
    <link rel="stylesheet" href="css/styles.css">

</head>
<body>

<h2>Мои заявки</h2>

<div class="tabs">
    <button class="tab-button " id="open-tab-btn">Открытые</button>
    <button class="tab-button" id="closed-tab-btn">Закрытые</button>
    
</div>
<div class ="sendticket-div" id="sendtickettab" style="display: none;">
    <button class="submit-ticket-btn" id="showsendticketbtn">Отправить заявку</button>
</div>
    <div class="form-container" id="ticketsendform">
        <div class="create-ticket-heading">Создать новую заявку</div>
        <form method="POST">

            <div class="form-group">
                <label for="title">Заголовок тикета:</label>
                <input type="text" id="title" name="title" maxlength="100" required>
                <small class="error-message" id="title_error"></small>
            </div>

            <div class="form-group">
                <label for="description">Описание тикета:</label>
                <textarea id="description" name="description" rows="5" maxlength="500" required></textarea>
                <small class="error-message" id="description_error"></small>
            </div>

            <div class="form-group">
                <label for="assigned_admin">Кому отправить:</label>
                <select id="assigned_admin" name="assigned_admin" required>
                    <option value="">Выберите кому отправить:</option>
                    <?php foreach ($admins as $admin): ?>
                        <option value="<?= $admin['id'] ?>"><?= htmlspecialchars($admin['position']) ?></option>
                    <?php endforeach; ?>
                </select>
            </div>

            <div class="form-group">
                <button type="submit" id="submitBtn">Отправить заявку</button>
            </div>
        </form>
    </div>
    <h4 id="text_update_ticket"style="color:green;display:none; ">Заявки обновлены</h3>
<div id="open-tickets" class="tab-content" style="display: none;">

<h3 style="text-align: center;">Открытые заявки</h3>

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Заголовок</th>
                <th>Описание</th>
                <th>Кому отправлен</th>
                <th>Статус</th>
                <th>Дата создания</th>
                <th>Детали</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($open_tickets as $ticket): ?>
                <tr id="ticket-<?= $ticket['id'] ?>">
                    <td><?= $ticket['id'] ?></td>
                    <td><?= strlen($ticket['title']) > 15 ? htmlspecialchars(mb_substr($ticket['title'], 0, 15)) . '...' : htmlspecialchars($ticket['title']) ?></td>
                    <td><?= strlen($ticket['description']) > 10 ? htmlspecialchars(mb_substr($ticket['description'], 0, 10)) . '...' : htmlspecialchars($ticket['description']) ?></td>
                    <td><?= strlen($ticket['assigned_admin'] ?? '') > 10 ? htmlspecialchars(mb_substr($ticket['assigned_admin'], 0, 10)) . '...' : htmlspecialchars($ticket['assigned_admin'] ?? '—') ?></td>

                    <td class="ticket-status status-open"><?= $ticket['status'] ?></td>
                    <td><?= $ticket['created_at'] ?></td>
                    <td>
                    <button class="toggle-details-btn" onclick="toggleDetails(<?= $ticket['id'] ?>)">Показать детали</button>
                    </td>
                    <tr id="details-<?= $ticket['id'] ?>" class="ticket-details">
                    <td colspan="8">
                    <div class="ticket-details-box">
                        <p><strong>ID:</strong> <?= htmlspecialchars($ticket['id']) ?></p>
                        <p><strong>Заголовок:</strong> <?= htmlspecialchars($ticket['title']) ?></p>
                        <p><strong>Описание:</strong> <?= nl2br(htmlspecialchars($ticket['description'])) ?></p>
                        <p><strong>Имя отправителя:</strong> <?= htmlspecialchars($ticket['assigned_admin']) ?></p>
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

<div id="closed-tickets" class="tab-content" style="display: none;">

<h3 style="text-align: center;">Закрытые заявки</h3>
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Заголовок</th>
                <th>Описание</th>
                <th>Кому отправлен</th>
                <th>Статус</th>
                <th>Дата создания</th>
                <th>Дата закрытия</th>
                <th>Детали</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($closed_tickets as $ticket): ?>
                <tr id="ticket-<?= $ticket['id'] ?>">
                    <td><?= $ticket['id'] ?></td>
                    <td><?= strlen($ticket['title']) > 10 ? htmlspecialchars(mb_substr($ticket['title'], 0, 10)) . '...' : htmlspecialchars($ticket['title']) ?></td>
                    <td><?= strlen($ticket['description']) > 10 ? htmlspecialchars(mb_substr($ticket['description'], 0, 10)) . '...' : htmlspecialchars($ticket['description']) ?></td>
                    <td><?= strlen($ticket['assigned_admin'] ?? '') > 10 ? htmlspecialchars(mb_substr($ticket['assigned_admin'], 0, 10)) . '...' : htmlspecialchars($ticket['assigned_admin'] ?? '—') ?></td>

                    <td><?= $ticket['created_at'] ?></td>
                    <td><?= $ticket['updated_at'] ?></td>
                    <td class="ticket-status status-closed"><?= $ticket['status'] ?></td>
                    <td>
                    <button class="toggle-details-btn" onclick="toggleDetails(<?= $ticket['id'] ?>)">Показать детали</button>
                    </td>
                    <tr id="details-<?= $ticket['id'] ?>" class="ticket-details">
                   
                    <td colspan="9">
                    <div class="ticket-details-box">
                        <p><strong>ID:</strong> <?= htmlspecialchars($ticket['id']) ?></p>
                        <p><strong>Заголовок:</strong> <?= htmlspecialchars($ticket['title']) ?></p>
                        <p><strong>Описание:</strong> <?= nl2br(htmlspecialchars($ticket['description'])) ?></p>
                        <p><strong>Имя отправителя:</strong> <?= htmlspecialchars($ticket['assigned_admin']) ?></p>
                        <p><strong>Статус:</strong> <span class="<?= $ticket['status'] === 'open' ? 'status-open' : 'status-closed' ?>">
                        <?= htmlspecialchars($ticket['status']) ?>
                        </span></p>
                        <p><strong>Дата создания:</strong> <?= $ticket['created_at'] ?></p>
                        <p><strong>Дата закрытия:</strong> <?= $ticket['updated_at'] ?></p>
                    </div>
                    </td>
               
            </td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
</div>
<a href="../logout.php" class="logout-btn">Выйти</a>
<script src="js/script.js"></script>
</body>
</html>
