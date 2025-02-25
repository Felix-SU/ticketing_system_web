document.addEventListener("DOMContentLoaded", function () {
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
            const response = await fetch(`/ticketing_system/admin_dashboard/php/check.php?nocache=${Date.now()}`);
            const data = await response.json();

            if (!Array.isArray(data)) {
                console.error("❌ Ошибка: сервер вернул некорректные данные!", data);
                return;
            }

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
            
            <td>${position.length > 10 ? position.substring(0, 10) + "..." : position}</td>
            <td>${position.length > 10 ? position.substring(0, 10) + "..." : title}</td>
             <td>${description.length > 10 ? description.substring(0, 10) + "..." : description}</td>
            <td>${createdAt}</td>
            <td class="ticket-status ${statusClass}">${ticket.status}</td>
            <td>
                <button class="toggle-details-btn" onclick="toggleDetails(${ticket.id})">Показать детали</button>
            </td>
            <td>
                <a href="?close_ticket_id=${ticket.id}" class="close-ticket-btn">Закрыть заявку</a>
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
                    <p><strong>Статус:</strong> <span class="${statusClass}">${ticket.status}</span></p>
                    <p><strong>Дата создания:</strong> ${createdAt}</p>
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
    // Удаление неподобающих символов
    loginField.value = loginField.value.replace(/[^A-Za-z0-9]/g, '');
    // Проверка на допустимые символы
    if (!/^[A-Za-z0-9]+$/.test(loginField.value)) {
        errorMessage.textContent = "Логин может содержать только латинские буквы и цифры.";
        errorMessage.style.display = 'block';
        
        // Ожидаем 2 секунды и скрываем сообщение
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 2000);
    } else {
        errorMessage.textContent = "";
        errorMessage.style.display = 'none';
    }
});
$(document).ready(function() {
    $("#register-form").on("submit", function(event) {
        event.preventDefault(); // Останавливаем стандартное поведение формы
        $.ajax({
            type: "POST",
            url: "/ticketing_system/admin_dashboard/php/register.php",
            data: $(this).serialize(),
            dataType: "json",
            success: function(response) {
                if (response.status === "success") {
                    $("#register-message").css("color", "green").text(response.message);
                    $("#register-form")[0].reset(); // Очищаем форму
                } else {
                    $("#register-message").css("color", "red").text(response.message);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
    console.error("Ошибка AJAX:", textStatus, errorThrown, jqXHR.responseText);
    $("#register-message").css("color", "red").text("Ошибка при отправке запроса.");
}
        });
    });
});
function toggleDetails(ticketId) {
      let detailsRow = document.getElementById('details-' + ticketId);
      let button = detailsRow.previousElementSibling.querySelector('.toggle-details-btn');
      if (detailsRow.style.display === 'none' || detailsRow.style.display === '') {
          detailsRow.style.display = 'table-row';
          button.textContent = 'Скрыть детали';
      } else {
          detailsRow.style.display = 'none';
          button.textContent = 'Показать детали';
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

            fetch('/ticketing_system/admin_dashboard/php/change_role.php', {
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

            fetch('/ticketing_system/admin_dashboard/php/change_password.php', {
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