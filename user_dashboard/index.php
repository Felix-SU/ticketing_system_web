
<?php
session_start();
include '../db.php';  // Подключаем базу данных
// Если сессии нет, проверяем remember_token
if (!isset($_SESSION['user_id']) && isset($_COOKIE['remember_token'])) {
    $rememberToken = $_COOKIE['remember_token'];

    // Проверяем токен в базе
    $sql = "SELECT id, username, role FROM users WHERE remember_token = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$rememberToken]);
    $user = $stmt->fetch();

    if ($user) {
        // Если токен найден — создаём сессию
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];
    }
}
// Если после проверки всё ещё нет сессии — редирект на логин
if (!isset($_SESSION['user_id'])) {
    header('Location: ../login/index.php');
    exit;
}
// Получаем текущий URL
$currentPage = basename($_SERVER['PHP_SELF']);
// Перенаправление на нужную страницу, но **не зацикливаем редирект**
if ($_SESSION['role'] == 'admin' || $_SESSION['role'] == 'root') {
    if ($currentPage !== 'admin_dashboard.php') {
        header('Location: ../admin_dashboard/index.php');
        exit;
    }
} elseif ($_SESSION['role'] == 'user') {
    if ($currentPage !== 'index.php') {  // Это `user_dashboard/index.php`
        header('Location: ../user_dashboard/index.php');
        exit;
    }
} else {
    header('Location: ../login/index.php');
    exit;
}
$user_id = $_SESSION['user_id'];
// Определяем количество открытых тикетов
$sql_count_open = "SELECT COUNT(*) FROM tickets WHERE user_id = ? AND status = 'open'";
$stmt_count_open = $pdo->prepare($sql_count_open);
$stmt_count_open->execute([$user_id]);
$total_open_tickets = $stmt_count_open->fetchColumn();
// Определяем количество закрытых тикетов
$sql_count_closed = "SELECT COUNT(*) FROM tickets WHERE user_id = ? AND status = 'closed'";
$stmt_count_closed = $pdo->prepare($sql_count_closed);
$stmt_count_closed->execute([$user_id]);
$total_closed_tickets = $stmt_count_closed->fetchColumn();
// Пагинация для открытых тикетов
$open_tickets_per_page = 9;
$open_total_pages = ceil($total_open_tickets / $open_tickets_per_page);
$open_page = isset($_GET['open_page']) ? (int)$_GET['open_page'] : 1;
$open_offset = ($open_page - 1) * $open_tickets_per_page;
// Пагинация для закрытых тикетов
$closed_tickets_per_page = 9;
$closed_total_pages = ceil($total_closed_tickets / $closed_tickets_per_page);
$closed_page = isset($_GET['closed_page']) ? (int)$_GET['closed_page'] : 1;
$closed_offset = ($closed_page - 1) * $closed_tickets_per_page;
// Запрос для получения открытых тикетов с информацией о назначенном администраторе
$sql_open = "SELECT t.id, t.title, t.description, t.status, t.created_at, t.updated_at, u.position AS assigned_admin
             FROM tickets t 
             LEFT JOIN users u ON t.assigned_admin = u.id
             WHERE t.user_id = ? AND t.status = 'open'
             ORDER BY t.created_at DESC
             LIMIT $open_tickets_per_page OFFSET $open_offset";
$stmt_open = $pdo->prepare($sql_open);
$stmt_open->execute([$user_id]);
$open_tickets = $stmt_open->fetchAll();
// Запрос для получения закрытых тикетов с информацией о назначенном администраторе
$sql_closed = "SELECT t.id, t.title, t.description, t.status, t.created_at, t.updated_at, u.position AS assigned_admin
               FROM tickets t 
               LEFT JOIN users u ON t.assigned_admin = u.id
               WHERE t.user_id = ? AND t.status = 'closed'
               ORDER BY t.updated_at DESC
               LIMIT $closed_tickets_per_page OFFSET $closed_offset";
$stmt_closed = $pdo->prepare($sql_closed);
$stmt_closed->execute([$user_id]);
$closed_tickets = $stmt_closed->fetchAll();
// Получение списка администраторов
$sql_admins = "SELECT id, username, position FROM users WHERE role IN ('admin', 'root')";
$stmt_admins = $pdo->query($sql_admins);
$admins = $stmt_admins->fetchAll();
// Получаем позицию пользователя
$sql = "SELECT position FROM users WHERE id = ?";
$stmt = $pdo->prepare($sql);
$stmt->execute([$user_id]);
$position = $stmt->fetchColumn();
// Обработка отправки нового тикета
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $title = $_POST['title'];
    $description = $_POST['description'];
    $assigned_admin = $_POST['assigned_admin'];
    try {
        $sql = "INSERT INTO tickets (user_id, title, description, assigned_admin, status) 
                VALUES (?, ?, ?, ?, 'open')";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$user_id, $title, $description, $assigned_admin]);
        header('Location: ' . $_SERVER['PHP_SELF']); 
        exit;
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
    <title>Заявки пользователя</title>
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
    <form id="ticketForm">
        <div class="form-group">
            <label for="title">Заголовок заявки:</label>
            <input type="text" id="title" name="title" maxlength="100" required>
            <small class="error-message" id="title_error"></small>
        </div>
        <div class="form-group">
            <label for="description">Описание заявки:</label>
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
            <small class="position-message" id="assigned_admin_error"></small>
        </div>
        <div class="form-group">
            <button type="submit" id="submitBtn">Отправить заявку</button>
        </div>
        <small class="reg-message" id="reg_message"></small>
    </form>
</div>
<h4 id="text_update_ticket" style="color:green;display:none;">Заявки обновлены</h4>
<div id="open-tickets" class="tab-content" style="display: none;">
<h3 id ="text_update_ticket" style="text-align: center;display=:none;"></h3>
<h3 style="text-align: center;">Открытые заявки</h3>
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Заголовок</th>
                <th>Описание</th>
                <th>Кому отправлен</th>
                <th>Дата создания</th>
                <th>Статус</th>
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
                    <td><?= $ticket['created_at'] ?></td>
                    <td class="ticket-status status-open"><?= $ticket['status'] ?></td>
                    <td>
                    <button class="toggle-details-btn" onclick="toggleDetails(<?= $ticket['id'] ?>)">Показать детали</button>
                    </td>
                    <tr id="details-<?= $ticket['id'] ?>" class="ticket-details">
                    <td colspan="8">
                    <div class="ticket-details-box">
                        <p><strong>ID:</strong> <?= htmlspecialchars($ticket['id']) ?></p>
                        <p><strong>Заголовок:</strong> <?= htmlspecialchars($ticket['title']) ?></p>
                        <p><strong>Описание:</strong> <?= nl2br(htmlspecialchars($ticket['description'])) ?></p>
                        <p><strong>Имя получателя:</strong> <?= htmlspecialchars($ticket['assigned_admin']) ?></p>
                       
                        <p><strong>Дата создания:</strong> <?= $ticket['created_at'] ?></p>
                        <p><strong>Статус:</strong> <span class="<?= $ticket['status'] === 'open' ? 'status-open' : 'status-closed' ?>">
                        <?= htmlspecialchars($ticket['status']) ?>
                        </span></p>
                    </div>
                    </td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
    <?php if (isset($open_total_pages) && $open_total_pages > 1): ?>
    <div class="pagination">
        <select id="open-page-select" class="pages"data-status="open">
            <?php for ($i = 1; $i <= $open_total_pages; $i++): ?>
                <option value="<?= $i ?>" <?= $i == $open_page ? 'selected' : '' ?>>Страница <?= $i ?></option>
            <?php endfor; ?>
        </select>
    </div>
<?php endif; ?>
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
                <th>Дата создания</th>
                <th>Дата закрытия</th>
                <th>Статус</th>
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
                        <p><strong>Имя получателя:</strong> <?= htmlspecialchars($ticket['assigned_admin']) ?></p>
                        <p><strong>Дата создания:</strong> <?= $ticket['created_at'] ?></p>
                        <p><strong>Дата закрытия:</strong> <?= $ticket['updated_at'] ?></p>
                        <p><strong>Статус:</strong> <span class="<?= $ticket['status'] === 'open' ? 'status-open' : 'status-closed' ?>">
                        <?= htmlspecialchars($ticket['status']) ?>
                        </span></p>
                    </div>
                    </td>
            </td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
    <?php if (isset($closed_total_pages) && $closed_total_pages > 1): ?>
    <div class="pagination">
        <select id="closed-page-select" class="pages" data-status="closed">
            <?php for ($i = 1; $i <= $closed_total_pages; $i++): ?>
                <option value="<?= $i ?>" <?= $i == $closed_page ? 'selected' : '' ?>>Страница <?= $i ?></option>
            <?php endfor; ?>
        </select>
    </div>
<?php endif; ?>
</div>
<a href="../logout.php" class="logout-btn">Выйти</a>
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="js/script.js"></script>
</body>
</html>