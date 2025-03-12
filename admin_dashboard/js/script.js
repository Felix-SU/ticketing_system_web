document.addEventListener("DOMContentLoaded", function () {
    $(document).on("change", "#open-page-select, #closed-page-select", function () {
        const page = $(this).val(); // Получаем выбранную страницу
        const status = $(this).attr("id") === "open-page-select" ? "open" : "closed";
        loadTickets1(page, status);
    });
    function loadTickets1(page, status) {
        const tableSelector = status === "open" ? "#open-tickets tbody" : "#closed-tickets tbody";
        $(tableSelector).fadeOut(200, function () {
            $(this).empty();
            // AJAX-запрос
            $.ajax({
                url: "/admin_dashboard/php/loadtickets.php",
                type: "GET",
                data: { page: page, status: status },
                dataType: "json",
                success: function (response) {
                    if (Array.isArray(response)) {
                        response = { tickets: response, totalPages: 1 }; // Фикс, если API возвращает массив
                    }
                    if (response && Array.isArray(response.tickets)) {
                        let newRows = "";
                        response.tickets.forEach(ticket => {
                            newRows += `
                                    <tr id="ticket-${ticket.id}">
                                        <td>${ticket.id}</td>
                                          <td>${ticket.position ? (ticket.position.length > 10 ? ticket.position.substring(0, 10) + '...' : ticket.position) : '—'}</td>
                                        <td>${ticket.title.length > 15 ? ticket.title.substring(0, 15) + '...' : ticket.title}</td>
                                        <td>${ticket.description.length > 10 ? ticket.description.substring(0, 10) + '...' : ticket.description}</td>
                                        <td>${ticket.created_at}</td>
                                        ${status === "closed" ? `<td>${ticket.updated_at || '—'}</td>` : ""}
                                        <td class="ticket-status ${ticket.status === 'open' ? 'status-open' : 'status-closed'}">${ticket.status}</td>
                                        <td><button class="toggle-details-btn" onclick="toggleDetails(${ticket.id})">Показать детали</button></td>
                                          ${status !== "closed" ? `   <td><button class="close-ticket-btn" data-ticket-id="${ticket.id}">Закрыть заявку</button></td>` : ""}
                                    </tr>
                                    <tr id="details-${ticket.id}" class="ticket-details" style="display: none;">
                                        <td colspan="${ticket.status === "closed" ? 9 : 8}">
                                            <div class="ticket-details-box">
                                                <p><strong>ID:</strong> ${ticket.id}</p>
                                                <p><strong>Заголовок:</strong> ${ticket.title}</p>
                                                <p><strong>Описание:</strong> ${ticket.description}</p>
                                      
                                                <p><strong>Имя отправителя:</strong> ${ticket.position || "—"}</p>
                                                <p><strong>Дата создания:</strong> ${ticket.created_at}</p>
                                                ${ticket.status === "closed" ? `<p><strong>Дата закрытия:</strong> ${ticket.updated_at || "—"}</p>` : ""}
                                                <p><strong>Статус:</strong> <span class="${ticket.status === "open" ? "status-open" : "status-closed"}">${ticket.status}</span></p>
                                            </div>
                                        </td>
                                    </tr>
                                `;
                            });
                            $(tableSelector).html(newRows).fadeIn(300);
                            // ✅ Обновляем URL без перезагрузки страницы
                            const newUrl = new URL(window.location);
                            newUrl.searchParams.set(status + "_page", page);
                            window.history.pushState({}, "", newUrl);
                            // ✅ Выделяем текущую страницу
                        } else {
                            console.error("❌ Ошибка: некорректный формат данных", response);
                        }
                    },
                    error: function () {
                        alert("Ошибка загрузки тикетов");
                    }
                });
            });
        }
    document.getElementById("register-form").addEventListener("submit", function(event) {
        event.preventDefault(); // Остановить стандартную отправку формы
        let formData = new FormData(this);
        fetch("/admin_dashboard/php/register.php", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            let messageEl = document.getElementById("register-message");
            messageEl.textContent = data.message;
            messageEl.style.color = data.status === "success" ? "green" : "red";
            // Скрыть сообщение через 3 секунды
            setTimeout(() => {
                messageEl.textContent = "";
            }, 3000);
        })
        .catch(error => console.error("Ошибка:", error));
    });
    document.querySelector("#open-tickets tbody").addEventListener("click", function (event) {
        if (event.target.classList.contains("close-ticket-btn")) {
            const button = event.target;
            const ticketId = button.getAttribute("data-ticket-id");
            const ticketRow = document.getElementById(`ticket-${ticketId}`);
            const detailsRow = document.getElementById(`details-${ticketId}`); // Ряд с деталями
    
            if (!ticketRow) {
                console.error("❌ Ошибка: строка заявки не найдена", ticketId);
                return;
            }
    
            // Если открыты детали, скрываем их с анимацией
            if (detailsRow && detailsRow.style.display !== "none") {
                detailsRow.style.opacity = "1";
                detailsRow.style.transition = "opacity 0.3s ease-out";
                detailsRow.style.opacity = "0";
                setTimeout(() => {
                    detailsRow.style.display = "none"; // Полностью скрываем
                }, 300); // Ждем 300ms перед скрытием
            }
    
            // Блокируем кнопку, чтобы избежать двойного нажатия
            button.disabled = true;
            button.innerText = "Закрывается...";
            // Отправляем AJAX-запрос
            fetch(`/admin_dashboard/php/close_ticket.php?id=${ticketId}&status=closed`, {
                method: "GET"
            })
            .then(response => response.text())  // Оставляем text(), так как сервер не возвращает JSON
            .then(responseText => {
                if (responseText.includes("Ошибка")) {
                    alert("Ошибка: " + responseText);
                    button.disabled = false;
                    button.innerText = "Закрыть заявку";
                } else {
                    // Добавляем заявку в таблицу закрытых
                    addClosedTicketToTable({
                        id: ticketId,
                        position: ticketRow.children[1].textContent,
                        title: ticketRow.children[2].textContent,
                        description: ticketRow.children[3].textContent,
                        created_at: ticketRow.children[4].textContent,
                        updated_at: new Date().toLocaleString(),
                        status: "closed"
                    });
                    // Анимация удаления из открытых заявок
                    ticketRow.classList.add("slide-out-left");
                    setTimeout(() => ticketRow.remove(), 500);
                }
            })
            .catch(error => {
                console.error("Ошибка запроса:", error);
                alert("Ошибка при закрытии заявки.");
                button.disabled = false;
                button.innerText = "Закрыть заявку";
            });
        }
    });
    // Функция добавления закрытой заявки в таблицу закрытых
    function addClosedTicketToTable(ticket) {
        if (!ticket || !ticket.id) {
            console.error("❌ Ошибка: некорректные данные тикета", ticket);
            return;
        }
        showUpdateText(); // Показываем "Заявки обновлены"
        let closedTableBody = document.querySelector("#closed-tickets tbody");
        if (!closedTableBody) {
            console.error("❌ Ошибка: таблица закрытых тикетов не найдена.");
            return;
        }
        let title = ticket.title || "Без названия";
        let description = ticket.description || "Нет описания";
        let position = ticket.position || "Не указана";
        let createdAt = ticket.created_at || "Дата неизвестна";
        let updatedAt = ticket.updated_at || "Дата закрытия неизвестна";
        let statusClass = "status-closed";
        // Проверяем, существует ли уже строка с таким ID в закрытых тикетах
        let existingRow = document.querySelector(`#ticket-${ticket.id}`);
        if (existingRow) {
            console.log(`✅ Тикет с ID ${ticket.id} уже существует в таблице закрытых, обновляем данные.`);
            // Можно обновить данные в существующей строке, если это необходимо.
            return;
        }
        // Основная строка закрытого тикета
        let row = document.createElement("tr");
        row.id = `ticket-${ticket.id}`;
        row.innerHTML = `
            <td>${ticket.id}</td>
            <td>${position.length > 30 ? position.substring(0, 30) + "..." : position}</td>
            <td>${title.length > 15 ? title.substring(0, 15) + "..." : title}</td>
            <td>${description.length > 20 ? description.substring(0, 20) + "..." : description}</td>
            <td>${createdAt}</td>
            <td>${updatedAt}</td>
            <td class="ticket-status ${statusClass}">${ticket.status}</td>
            <td>
                <button class="toggle-details-btn" onclick="toggleDetails(${ticket.id})">Показать детали</button>
            </td>
        `;
        // Строка с деталями тикета
        let detailsRow = document.createElement("tr");
        detailsRow.id = `details-${ticket.id}`;
        detailsRow.classList.add("ticket-details");
        detailsRow.innerHTML = `
            <td colspan="10">
                <div class="ticket-details-box">
                    <p><strong>ID:</strong> ${ticket.id}</p>
                    <p><strong>Имя отправителя:</strong> ${position}</p>
                    <p><strong>Заголовок:</strong> ${title}</p>
                    <p><strong>Описание:</strong> ${description}</p>
                    <p><strong>Дата создания:</strong> ${createdAt}</p>
                    <p><strong>Дата закрытия:</strong> ${updatedAt}</p>
                    <p><strong>Статус:</strong> <span class="${statusClass}">${ticket.status}</span></p>
                </div>
            </td>
        `;
        // Добавляем строки в таблицу закрытых заявок
        closedTableBody.appendChild(row);
        closedTableBody.appendChild(detailsRow);
        // Добавление анимации появления
        animateAppearance(row);
        animateAppearance(detailsRow);
    }
    let previousTickets = []; // Храним предыдущее состояние тикетов
    function animateAppearance(element) {
        if (!element) return;
        element.style.opacity = "0"; // Начальная прозрачность
        element.style.transform = "translateY(-10px)"; // Легкий подъем
        element.style.transition = "opacity 0.5s ease, transform 0.5s ease";
        // Запускаем анимацию с небольшой задержкой
        setTimeout(() => {
            element.style.opacity = "1";
            element.style.transform = "translateY(0)";
        }, 50);
    }
    // Функция загрузки тикетов
    async function loadTickets() {
        try {
            const response = await fetch(`/admin_dashboard/php/check.php?nocache=${Date.now()}`);
            const data = await response.json();
            if (!Array.isArray(data)) {
                console.error("❌ Ошибка: сервер вернул некорректные данные!", data);
                return;
            }
            // Сортируем тикеты по дате создания (новые сверху)
        data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            // Если первый запуск — просто сохраняем тикеты
            if (previousTickets.length === 0) {
                previousTickets = data;
                console.log(`🔄 Загружено тикетов: ${data.length}`);
                return;
            }
            let newTickets = data.filter(ticket => 
                !previousTickets.some(prev => prev.id === ticket.id)
            );
            if (newTickets.length > 0) {
                console.log(`🆕 Найдены новые тикеты: ${newTickets.length}`);
                newTickets.forEach(updateTicketInTable);
                showUpdateText();
            } else {
                console.log("✅ Новых заявок нет");
            }
            previousTickets = data; // Обновляем сохранённые тикеты
        } catch (error) {
            console.error("❌ Ошибка загрузки тикетов:", error);
        }
    }
    // Запускаем загрузку тикетов сразу
    loadTickets();
    // Проверяем каждые 10 секунд
    setInterval(loadTickets, 10000);
    function showUpdateText() {
        let textElement = document.getElementById("text_update_ticket");
        if (!textElement) return;
        textElement.style.display = "block"; // Показываем текст
        setTimeout(() => {
            textElement.style.display = "none"; // Скрываем через 3 секунды
        }, 3000);
    }
    // Функция обновления тикета в таблице
    function updateTicketInTable(ticket) {
        if (!ticket || !ticket.id) {
            console.error("❌ Ошибка: некорректные данные тикета", ticket);
            return;
        }
        showUpdateText(); // Показываем "Заявки Обновлены
        let openTableBody = document.querySelector("#open-tickets tbody");
    
        let title = ticket.title || "Без названия";
        let description = ticket.description || "Нет описания";
        let position = ticket.position || "Не указана";
        let createdAt = ticket.created_at || "Дата неизвестна";
        let statusClass = ticket.status === "open" ? "status-open" : "status-closed";
        // Основная строка тикета
        let row = document.createElement("tr");
        row.id = `ticket-${ticket.id}`;
        row.innerHTML = `
            <td>
            <span class="ticket-id">${ticket.id}</span>
            <span class="star">*</span>
        </td>
            <td>${position.length > 30 ? position.substring(0, 30) + "..." : position}</td>
            <td>${title.length > 15 ? title.substring(0, 15) + "..." : title}</td>
             <td>${description.length > 10 ? description.substring(0, 10) + "..." : description}</td>
            <td>${createdAt}</td>
            <td class="ticket-status ${statusClass}">${ticket.status}</td>
            <td>
                <button class="toggle-details-btn" onclick="toggleDetails(${ticket.id})">Показать детали</button>
            </td>
            <td>
               <button class="close-ticket-btn" data-ticket-id="${ticket.id}">Закрыть заявку</button>
            </td>
        `;
        // Строка с деталями тикета
        let detailsRow = document.createElement("tr");
        detailsRow.id = `details-${ticket.id}`;
        detailsRow.classList.add("ticket-details");
        detailsRow.innerHTML = `
            <td colspan="10">
                <div class="ticket-details-box">
                    <p><strong>ID:</strong> ${ticket.id}</p>
                    <p><strong>Имя отправителя:</strong> ${position}</p>
                    <p><strong>Заголовок:</strong> ${title}</p>
                    <p><strong>Описание:</strong> ${description}</p>
                    <p><strong>Дата создания:</strong> ${createdAt}</p>
                   
                    <p><strong>Статус:</strong> <span class="${statusClass}">${ticket.status}</span></p>
                </div>
            </td>
        `;
        // Добавляем строки в таблицу
        openTableBody.prepend(detailsRow);
        openTableBody.prepend(row);
        animateAppearance(row);
    animateAppearance(detailsRow);
    }
    const style = document.createElement("style");
    style.innerHTML = `
        .star {
            color: red;
            margin-left: 8px;
            font-size: 22px; /* Увеличенный размер */
            font-weight: bold;
            vertical-align: middle;
            display: inline-block;
        }
    `;
document.head.appendChild(style);
document.querySelector("#open-tickets").addEventListener("mouseover", function (event) {
    let row = event.target.closest("tr"); // Определяем строку, на которую навели курсор
    if (row && row.id.startsWith("ticket-")) { // Проверяем, что это строка тикета
        let star = row.querySelector(".star"); // Ищем звёздочку внутри строки
        if (star) {
            star.remove(); // Удаляем звёздочку
        }
    }
});
});
document.getElementById('password').addEventListener('input', function() {
    const passwordField = document.getElementById('password');
    const errorMessage = document.getElementById('password_error');
    // Удаление неподобающих символов
    passwordField.value = passwordField.value.replace(/[^A-Za-z0-9!@#$%^&*()_+]/g, '');
    // Проверка на допустимые символы
    if (!/^[A-Za-z0-9!@#$%^&*()_+]+$/.test(passwordField.value)) {
        errorMessage.textContent = "Пароль может содержать только латинские буквы, цифры и символы !@#$%^&*()_+";
        errorMessage.style.display = 'block';
        // Ожидаем 5 секунд и скрываем сообщение
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    } else {
        errorMessage.textContent = "";
        errorMessage.style.display = 'none';
    }
});
document.getElementById('login').addEventListener('input', function() {
    const loginField = document.getElementById('login');
    const errorMessage = document.getElementById('login_error');
    // Преобразуем заглавные буквы в строчные и убираем недопустимые символы
    loginField.value = loginField.value.toLowerCase().replace(/[^a-z0-9]/g, '');
    // Проверка на допустимые символы (по сути уже не нужна, но оставим)
    if (!/^[a-z0-9]+$/.test(loginField.value)) {
        errorMessage.textContent = "Логин может содержать только латинские буквы и цифры.";
        errorMessage.style.display = 'block';
        // Ожидание 2 секунды и скрытие сообщения
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 2000);
    } else {
        errorMessage.textContent = "";
        errorMessage.style.display = 'none';
    }
});
function toggleDetails(ticketId) {
    let detailsRow = document.getElementById('details-' + ticketId);
    let detailsBox = detailsRow.querySelector('.ticket-details-box');
    let button = detailsRow.previousElementSibling.querySelector('.toggle-details-btn');
    if (detailsRow.classList.contains('show')) {
        detailsBox.style.maxHeight = detailsBox.scrollHeight + 'px'; // Фиксируем перед закрытием
        setTimeout(() => {
            detailsBox.style.maxHeight = '0';
            detailsBox.style.opacity = '0';
            detailsBox.style.transform = 'scaleY(0)';
        }, 10);
        setTimeout(() => {
            detailsRow.style.display = 'none'; // Скрываем строку после анимации
            detailsRow.classList.remove('show');
        }, 300);
        button.textContent = 'Показать детали';
    } else {
        detailsRow.style.display = 'table-row'; // Показываем строку сразу
        detailsBox.style.maxHeight = '0'; // Сбрасываем перед анимацией
        setTimeout(() => {
            detailsRow.classList.add('show');
            detailsBox.style.maxHeight = detailsBox.scrollHeight + 'px';
            detailsBox.style.opacity = '1';
            detailsBox.style.transform = 'scaleY(1)';
        }, 10);
        button.textContent = 'Скрыть детали';
    }
}
    // Переключение вкладок
    const openTabBtn = document.getElementById('open-tab-btn');
    const closedTabBtn = document.getElementById('closed-tab-btn');
    const rolesTabBtn = document.getElementById('roles-tab-btn');
    const openTickets = document.getElementById('open-tickets');
    const closedTickets = document.getElementById('closed-tickets');
    const rolesManagement = document.getElementById('roles-management');
    const registerform = document.getElementById('register-form-container');
    const registerbutton = document.getElementById('register-tab-btn');
    registerbutton.addEventListener('click', function() {
        registerform.style.display = "block";
        openTickets.style.display = 'none';
        closedTickets.style.display = 'none';
        rolesManagement.style.display = 'none';
        openTabBtn.classList.remove('active');
        closedTabBtn.classList.remove('active');
        rolesTabBtn.classList.remove('active');
        registerbutton.classList.add('active');
    });
    openTabBtn.addEventListener('click', function() {
        registerform.style.display = 'none';
        openTickets.style.display = 'block';
        closedTickets.style.display = 'none';
        rolesManagement.style.display = 'none';
        openTabBtn.classList.add('active');
        closedTabBtn.classList.remove('active');
        rolesTabBtn.classList.remove('active');
        registerbutton.classList.remove('active');
    });

    closedTabBtn.addEventListener('click', function() {
        registerform.style.display = 'none';
        openTickets.style.display = 'none';
        closedTickets.style.display = 'block';
        rolesManagement.style.display = 'none';
        openTabBtn.classList.remove('active');
        closedTabBtn.classList.add('active');
        rolesTabBtn.classList.remove('active');
        registerbutton.classList.remove('active');
    });

    rolesTabBtn.addEventListener('click', function() {
        openTickets.style.display = 'none';
        registerform.style.display = 'none';
        closedTickets.style.display = 'none';
        rolesManagement.style.display = 'block';
        openTabBtn.classList.remove('active');
        closedTabBtn.classList.remove('active');
        rolesTabBtn.classList.add('active');
        registerbutton.classList.remove('active');
    });
  // Функция для отправки формы через AJAX (для изменения роли)
  document.querySelectorAll('.role-form').forEach(form => {
        form.addEventListener('submit', function(event) {
            event.preventDefault(); // Отменяем стандартную отправку формы
            const userId = this.getAttribute('data-user-id');
            const formData = new FormData(this);
            fetch('/admin_dashboard/php/change_role.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                // Показываем сообщение об успехе
                const messageElement = document.getElementById(`role-message-${userId}`);
                if (data.success) {
                    messageElement.textContent = 'Роль успешно изменена!';
                    messageElement.style.color = 'green';
                } else {
                    messageElement.textContent = 'Произошла ошибка при изменении роли.';
                    messageElement.style.color = 'red';
                }
                // Показываем сообщение на 2 секунды
                messageElement.style.display = 'block';
                setTimeout(() => {
                    messageElement.style.display = 'none';
                }, 2000);  // 2 секунды
            })
            .catch(error => {
                console.error('Ошибка:', error);
            });
        });
    });
    // Функция для отправки формы через AJAX (для изменения пароля)
    document.querySelectorAll('.password-form').forEach(form => {
        form.addEventListener('submit', function(event) {
            event.preventDefault(); // Отменяем стандартную отправку формы
            const userId = this.getAttribute('data-user-id');
            const formData = new FormData(this);
            fetch('/admin_dashboard/php/change_password.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                // Показываем сообщение об успехе
                const messageElement = document.getElementById(`password-message-${userId}`);
                if (data.success) {
                    messageElement.textContent = 'Пароль успешно изменен!';
                    messageElement.style.color = 'green';
                } else {
                    messageElement.textContent = 'Произошла ошибка при изменении пароля.';
                    messageElement.style.color = 'red';
                }
                // Показываем сообщение на 2 секунды
                messageElement.style.display = 'block';
                setTimeout(() => {
                    messageElement.style.display = 'none';
                    document.getElementById('change-password-form-' + userId).style.display = 'none'; // Скрываем форму
                        document.getElementById('showpassform-' + userId).style.display = 'inline-block'; // Показываем кнопку
                }, 2000);  // 2 секунды
            })
            .catch(error => {
                console.error('Ошибка:', error);
            });
        });
    });
    function showPasswordForm(userId) {
        document.getElementById('change-password-form-' + userId).style.display = 'block'; // Показываем форму
        document.getElementById('showpassform-' + userId).style.display = 'none'; // Скрываем кнопку
    }