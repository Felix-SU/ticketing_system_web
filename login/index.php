<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Авторизация</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
<div class="form-container">
<h2>Вход</h2>
<form id="login-form">
    <div class="form-group">
        <label for="username">Логин:</label>
        <input type="text" id="username" name="username" required>
    </div>
    <div class="form-group">
        <label for="password">Пароль:</label>
        <input type="password" id="password" name="password" required>
    </div>
    <div class="form-group">
        <button type="submit">Войти</button>
    </div>

</form>
</div>
<script src="https://code.jquery.com/jquery-3.6.4.min.js"></script>
<script src="js/script.js"></script>
</body>
</html>