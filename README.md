# Ticketing_System_WEB
Клиент-серверное приложение для управления заявками с использованием PHP, jQuery и AJAX.

🚀 Функциональность
🔹 Роли пользователей

Отправители – создают и отправляют заявки.
Администраторы – обрабатывают заявки и управляют пользователями.
🔹 Основные функции

Авторизация и регистрация пользователей.
Создание, просмотр и управление заявками.
Разграничение прав доступа.
Управление пользователями (для админов).
📌 Технологии
Backend: PHP (без фреймворков)
Frontend: HTML, CSS, jQuery
AJAX: динамическая загрузка данных без перезагрузки страниц
База данных: MySQL
🔧 Установка
1️⃣ Настроить сервер
Требуется Apache + MySQL (XAMPP, OpenServer или аналогичный стек).

2️⃣ Импортировать базу данных
Файл: ticket_system.sql

3️⃣ Настроить подключение к БД
Файл: db.php

php
Копировать
Редактировать
define('DB_HOST', 'localhost');
define('DB_NAME', 'ticket_system');
define('DB_USER', 'root');
define('DB_PASS', '');
4️⃣ Запустить сервер
Запусти Apache и MySQL, затем открой index.php в браузере.

<p align="center"> <h2>🖥️ Превью</h2> </p> <p align="center"> <b>
<p align="center"> <h2>🖥️ Авторизация</h2> </p> <p align="center"> <b>
<p align="center"> <img src="Screenshots/login.png" width="80%" /> </p>
<p align="center"> <h2>🖥️ Админ панель</h2> </p> <p align="center"> <b>
🔹 Открытые заявки:
<p align="center"> <img src="Screenshots/admin/open.png" width="80%" /> </p>
🔹 Закрытые заявки:
<p align="center"> <img src="Screenshots/admin/closed.png" width="80%" /> </p>
🔹 Регистрация пользователей:
<p align="center"> <img src="Screenshots/admin/registration.png" width="80%" /> </p>
🔹 Управление пользователями:
<p align="center"> <img src="Screenshots/admin/control.png" width="80%" /> </p>
<p align="center"> <h2>🖥️ Панель пользователя</h2> </p> <p align="center"> <b>
🔹 Открытые заявки:
<p align="center"> <img src="Screenshots/user/open.png" width="80%" /> </p>
🔹 Закрытые заявки:
<p align="center"> <img src="Screenshots/user/closed.png" width="80%" /> </p>
🔹Отправка заявки:
<p align="center"> <img src="Screenshots/user/send.png" width="80%" /> </p>