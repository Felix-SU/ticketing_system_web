// script.js
document.addEventListener("DOMContentLoaded", function () {
   function renderPagination(totalPages, currentPage, status) {
    if (totalPages <= 1) return "";

    let html = '<div class="pagination">';

    // Первая страница
    html += `<span class="page-link ${currentPage == 1 ? 'active' : ''}" data-page="1" data-status="${status}">1</span>`;

    // Многоточие, если текущая страница далеко
    if (totalPages > 5 && currentPage > 3) {
        html += '<span class="page-link disabled">...</span>';
    }

    // Отображаем страницу перед текущей, текущую и следующую
    let start = Math.max(2, Math.min(currentPage - 1, totalPages - 3));
    let end = Math.min(totalPages - 1, Math.max(currentPage + 1, 4));

    for (let i = start; i <= end; i++) {
        html += `<span class="page-link ${i == currentPage ? 'active' : ''}" data-page="${i}" data-status="${status}">${i}</span>`;
    }

    // Многоточие, если текущая страница далеко от последней
    if (totalPages > 5 && currentPage < totalPages - 2) {
        html += '<span class="page-link disabled">...</span>';
    }

    // Последняя страница
    if (totalPages > 1) {
        html += `<span class="page-link ${currentPage == totalPages ? 'active' : ''}" data-page="${totalPages}" data-status="${status}">${totalPages}</span>`;
    }

    html += '</div>';
    return html;
}
// Функция обновления активной страницы
function highlightActivePage() {
    const urlParams = new URLSearchParams(window.location.search);
    const openPage = Number(urlParams.get("open_page")) || 1;
    const closedPage = Number(urlParams.get("closed_page")) || 1;
    $(".page-link").each(function () {
        const page = Number($(this).data("page"));
        const status = $(this).data("status") || "open";
        if ((status === "open" && page === openPage) || (status === "closed" && page === closedPage)) {
            $(this).addClass("active");
        } else {
            $(this).removeClass("active");
        }
    });
}
// Вызов при загрузке страницы
highlightActivePage();
// Обработчик клика по страницам
$(document).on("click", ".page-link", function (e) {
    e.preventDefault();
    if ($(this).hasClass("disabled")) return; // Игнорируем многоточие
    const page = $(this).data("page");
    const status = $(this).data("status") || "open";
    // Определяем нужную таблицу
    const tableSelector = status === "open" ? "#open-tickets tbody" : "#closed-tickets tbody";
    $(tableSelector).fadeOut(200, function () {
        $(this).empty();
        // AJAX-запрос
        $.ajax({
            url: "/user_dashboard/php/loadtickets.php",
            type: "GET",
            data: { page: page, status: status },
            dataType: "json",
            success: function (tickets) {
                if (Array.isArray(tickets)) {
                    let newRows = "";
                    tickets.forEach(ticket => {
                        newRows += `
                            <tr id="ticket-${ticket.id}">
                                <td>${ticket.id}</td>
                                <td>${ticket.title.length > 15 ? ticket.title.substring(0, 15) + '...' : ticket.title}</td>
                                <td>${ticket.description.length > 10 ? ticket.description.substring(0, 10) + '...' : ticket.description}</td>
                              <td>${ticket.admin_position ? (ticket.admin_position.length > 10 ? ticket.admin_position.substring(0, 10) + '...' : ticket.admin_position) : '—'}</td>

                                <td>${ticket.created_at}</td>
                                ${status === "closed" ? `<td>${ticket.updated_at || '—'}</td>` : ""}
                                <td class="ticket-status ${ticket.status === 'open' ? 'status-open' : 'status-closed'}">${ticket.status}</td>
                                <td><button class="toggle-details-btn" onclick="toggleDetails(${ticket.id})">Показать детали</button></td>
                            </tr>
                            <tr id="details-${ticket.id}" class="ticket-details" style="display: none;">
                                <td colspan="${ticket.status === "closed" ? 9 : 8}">
                                    <div class="ticket-details-box">
                                        <p><strong>ID:</strong> ${ticket.id}</p>
                                        <p><strong>Заголовок:</strong> ${ticket.title}</p>
                                        <p><strong>Описание:</strong> ${ticket.description}</p>
                                        <p><strong>Имя получателя:</strong> ${ticket.admin_position || "—"}</p>
                                        <p><strong>Дата создания:</strong> ${ticket.created_at}</p>
                                        ${ticket.status === "closed" ? `<p><strong>Дата закрытия:</strong> ${ticket.updated_at || "—"}</p>` : ""}
                                        <p><strong>Статус:</strong> <span class="${ticket.status === "open" ? "status-open" : "status-closed"}">${ticket.status}</span></p>
                                    </div>
                                </td>
                            </tr>
                        `;
                    });
                    $(tableSelector).html(newRows).fadeIn(300);
                    // Обновляем пагинацию
                    const paginationHtml = renderPagination(20, page, status); // Тут укажи реальное totalPages
                    $(`.pagination[data-status="${status}"]`).html(paginationHtml);
                    // Обновляем URL без перезагрузки страницы
                    const newUrl = new URL(window.location);
                    newUrl.searchParams.set(status + "_page", page);
                    window.history.pushState({}, "", newUrl);
                    highlightActivePage();
                } else {
                    console.error("❌ Ошибка: некорректный формат данных", tickets);
                }
            },
            error: function () {
                alert("Ошибка загрузки тикетов");
            }
        });
    });
});
    $(document).ready(function () {
        $("#ticketForm").submit(function (e) {
            e.preventDefault(); // Отключаем стандартную отправку формы
            let title = $("#title").val().trim();
            let description = $("#description").val().trim();
            let assigned_admin = $("#assigned_admin").val();
            let errorMessage = $("#reg_message");
            // Функция скрытия сообщения через 3 секунды
            function hideMessage() {
                setTimeout(() => {
                    errorMessage.fadeOut();
                }, 3000);
            }
            // Очищаем старое сообщение
            errorMessage.text("");
            errorMessage.hide();
            if (!title || !description || !assigned_admin) {
                errorMessage.text("Заполните все поля!").css("color", "red").fadeIn();
                hideMessage();
                return;
            }
            $.ajax({
                url: "/user_dashboard/php/create_ticket.php",
                type: "POST",
                data: {
                    title: title,
                    description: description,
                    assigned_admin: assigned_admin
                },
                dataType: "json",
                success: function (response) {
                    if (response.status === "success") {
                        errorMessage.text(response.message).css("color", "green").fadeIn();
                        $("#ticketForm")[0].reset(); // Очищаем форму
                        $("#text_update_ticket").show().fadeOut(3000); // Показываем "Заявки обновлены"
                    } else {
                        errorMessage.text(response.message).css("color", "red").fadeIn();
                    }
                    hideMessage();
                },
                error: function () {
                    errorMessage.text("Ошибка при отправке запроса!").css("color", "red").fadeIn();
                    hideMessage();
                }
            });
        });
    });
    function removeWithAnimation(element) {
        if (!element) return;
        element.style.transition = "opacity 0.5s ease, transform 0.5s ease";
        element.style.opacity = "0";
        element.style.transform = "translateY(-10px)"; // Лёгкий подъем перед исчезновением
        setTimeout(() => {
            element.remove();
        }, 500); // Удаляем после завершения анимации
    }
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
    let previousTickets = []; // Храним предыдущее состояние тикетов
// Функция загрузки тикетов
async function loadTickets() {
    try {
        const response = await fetch(`/user_dashboard/php/check.php?nocache=${Date.now()}`);
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
        let changesFound = false;
        let newTickets = [];
        data.forEach(ticket => {
            if (!ticket || !ticket.id || typeof ticket.status !== "string") {
                console.warn("⚠️ Пропущен некорректный тикет:", ticket);
                return;
            }
            let previous = previousTickets.find(prev => prev.id === ticket.id);
            // Если тикет уже был, но его статус изменился
            if (previous && previous.status !== ticket.status) {
                console.log(`🔄 Тикет ID: ${ticket.id} изменил статус: ${previous.status} ➝ ${ticket.status}`);
                updateTicketInTable(ticket);
                changesFound = true;
            }
            // Если тикет новый, то добавляем его в массив новых тикетов
            if (!previous) {
                newTickets.push(ticket);
            }
        });
        // Если есть новые тикеты, добавляем их в таблицу
        newTickets.forEach(ticket => {
            console.log(`🔄 Новый тикет ID: ${ticket.id}`);
            addTicketToTable(ticket); // Добавляем новый тикет в таблицу
        });
        if (!changesFound && newTickets.length === 0) {
            console.log("✅ Статусы не изменились, новых тикетов нет");
        }
        // Обновляем сохранённые тикеты для следующего сравнения
        previousTickets = data;
    } catch (error) {
        console.error("❌ Ошибка загрузки тикетов:", error);
    }
}
// Запускаем загрузку тикетов сразу
loadTickets();
// Проверяем каждые 10 секунд
setInterval(loadTickets, 10000);
// Функция добавления нового тикета в таблицу
function addTicketToTable(ticket) {
    if (!ticket || !ticket.id || typeof ticket.status !== "string") {
        console.error("❌ Ошибка: некорректные данные тикета", ticket);
        return;
    }
    // Находим таблицы
    let openTableBody = document.querySelector("#open-tickets tbody");
    let closedTableBody = document.querySelector("#closed-tickets tbody");
    if (!openTableBody || !closedTableBody) {
        console.error("❌ Не найдены таблицы открытых или закрытых тикетов!");
        return;
    }
    // Проверка на существование тикета с таким же ID в нужной таблице
    let targetTableBody = ticket.status === "open" ? openTableBody : closedTableBody;
    let existingTicketRow = document.querySelector(`#ticket-${ticket.id}`);
    if (existingTicketRow) {
        console.warn(`❌ Тикет с ID ${ticket.id} уже существует!`);
        return; // Возвращаем, если такой тикет уже есть
    }
    // Дефолтные значения для тикета
    let title = ticket.title || "Без названия";
    let description = ticket.description || "Нет описания";
    let adminPosition = ticket.admin_position || "Не указана"; 
    let createdAt = ticket.created_at || "Дата неизвестна";
    let updatedAt = ticket.updated_at || "Не обновлялся"; // Для закрытых тикетов, если есть.
    // Создание строки тикета
    let row = document.createElement("tr");
    row.id = `ticket-${ticket.id}`;
    row.innerHTML = `
        <td>
            <span class="ticket-id">${ticket.id}</span>
            ${ticket.status === "closed" ? '<span class="star">*</span>' : ""}
        </td>
        <td>${title.length > 10 ? title.substring(0, 10) + "..." : title}</td>
        <td>${description.length > 10 ? description.substring(0, 10) + "..." : description}</td>
        <td>${adminPosition.length > 10 ? adminPosition.substring(0, 10) + "..." : adminPosition}</td>
        <td>${createdAt}</td>
        <td class="ticket-status ${ticket.status === "open" ? "status-open" : "status-closed"}">${ticket.status}</td>
        <td><button class="toggle-details-btn" onclick="toggleDetails(${ticket.id})">Показать детали</button></td>
    `;
    // Создание строки с деталями тикета
    let detailsRow = document.createElement("tr");
    detailsRow.id = `details-${ticket.id}`;
    detailsRow.classList.add("ticket-details");
    detailsRow.innerHTML = `
        <td colspan="${ticket.status === "closed" ? 9 : 8}">
            <div class="ticket-details-box">
                <p><strong>ID:</strong> ${ticket.id}</p>
                <p><strong>Заголовок:</strong> ${title}</p>
                <p><strong>Описание:</strong> ${description}</p>
                <p><strong>Имя получателя:</strong> ${adminPosition}</p>
                <p><strong>Дата создания:</strong> ${createdAt}</p>
                ${ticket.status === "closed" ? `<p><strong>Дата закрытия:</strong> ${updatedAt}</p>` : ""}
                <p><strong>Статус:</strong> <span class="${ticket.status === "open" ? "status-open" : "status-closed"}">${ticket.status}</span></p>
            </div>
        </td>
    `;
    // Добавление строки с тикетом и строку с деталями в нужную таблицу
    targetTableBody.prepend(detailsRow);
    targetTableBody.prepend(row);
    animateAppearance(detailsRow);
    // Анимация появления
    animateAppearance(row);
}
// Функция для анимации появления тикета в таблице
function animateAppearance(row) {
    row.classList.add("fade-in"); // Добавление класса для анимации появления
    setTimeout(() => {
        row.classList.remove("fade-in");
    }, 500); // Ожидаем 500мс, чтобы анимация завершилась
}
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
        if (!ticket || !ticket.id || typeof ticket.status !== "string") {
            console.error("❌ Ошибка: некорректные данные тикета", ticket);
            return;
        }
        showUpdateText(); // Показываем "Заявки Обновлены
        let openTableBody = document.querySelector("#open-tickets tbody");
        let closedTableBody = document.querySelector("#closed-tickets tbody");
        let existingTicketRow = document.querySelector(`#ticket-${ticket.id}`);
        let existingDetailsRow = document.querySelector(`#details-${ticket.id}`);
        if (existingTicketRow)  removeWithAnimation(existingTicketRow);
        if (existingDetailsRow) removeWithAnimation(existingDetailsRow);
        let targetTableBody = ticket.status === "open" ? openTableBody : closedTableBody;
        if (!targetTableBody) {
            console.error("❌ Таблица не найдена!");
            return;
        }
        let title = ticket.title || "Без названия";
        let description = ticket.description || "Нет описания";
        let adminPosition = ticket.admin_position || "Не указана"; 
        let createdAt = ticket.created_at || "Дата неизвестна";
        let updatedAt = ticket.updated_at || "Не обновлялся";
        let row = document.createElement("tr");
        row.id = `ticket-${ticket.id}`;
        row.innerHTML = `
            <td>
            <span class="ticket-id">${ticket.id}</span>
            ${ticket.status === "closed" ? '<span class="star">*</span>' : ""}
        </td>
            <td>${title.length > 10 ? title.substring(0, 10) + "..." : title}</td>
            <td>${description.length > 10 ? description.substring(0, 10) + "..." : description}</td>
            <td>${adminPosition.length > 10 ? adminPosition.substring(0, 10) + "..." : adminPosition}</td>
           
            <td>${createdAt}</td>
            ${ticket.status === "closed" ? `<td>${updatedAt}</td>` : ""}
             <td class="ticket-status ${ticket.status === "open" ? "status-open" : "status-closed"}">${ticket.status}</td>
            <td><button class="toggle-details-btn" onclick="toggleDetails(${ticket.id})">Показать детали</button></td>
        `;
        let detailsRow = document.createElement("tr");
        detailsRow.id = `details-${ticket.id}`;
        detailsRow.classList.add("ticket-details");
        detailsRow.innerHTML = `
            <td colspan="${ticket.status === "closed" ? 9 : 8}">
                <div class="ticket-details-box">
                    <p><strong>ID:</strong> ${ticket.id}</p>
                    <p><strong>Заголовок:</strong> ${title}</p>
                    <p><strong>Описание:</strong> ${description}</p>
                    <p><strong>Имя получателя:</strong> ${adminPosition}</p>
                    <p><strong>Дата создания:</strong> ${createdAt}</p>
                    ${ticket.status === "closed" ? `<p><strong>Дата закрытия:</strong> ${updatedAt}</p>` : ""}
                    <p><strong>Статус:</strong> <span class="${ticket.status === "open" ? "status-open" : "status-closed"}">${ticket.status}</span></p>
                </div>
            </td>
        `;
        targetTableBody.prepend(detailsRow);
        targetTableBody.prepend(row);
          // Анимация появления
    animateAppearance(row);
    animateAppearance(detailsRow);
    }
    const style = document.createElement("style");
    style.innerHTML = `
        .star {
            color: green;
            margin-left: 8px;
            font-size: 22px; /* Увеличенный размер */
            font-weight: bold;
            vertical-align: middle;
            display: inline-block;
        }
    `;
    document.head.appendChild(style);
    document.querySelector("#closed-tickets").addEventListener("mouseover", function (event) {
        let row = event.target.closest("tr"); // Определяем строку, на которую навели курсор
        if (row && row.id.startsWith("ticket-")) { // Проверяем, что это строка тикета
            let star = row.querySelector(".star"); // Ищем звёздочку внутри строки
            if (star) {
                star.remove(); // Удаляем звёздочку
            }
        }
    });
    function checkLimit(input, maxLength, errorId) {
        const errorElement = document.getElementById(errorId);
        if (!errorElement) {
            console.warn(`⚠️ Элемент с ID "${errorId}" не найден.`);
            return; // Выходим из функции, если элемента нет
        }
        if (input.value.length > maxLength) {
            errorElement.textContent = "Вы превысили лимит символов!";
            errorElement.style.display = "block"; // Показываем ошибку
            input.classList.add("input-error");
        } else {
            errorElement.textContent = "";
            errorElement.style.display = "none"; // Скрываем ошибку
            input.classList.remove("input-error");
        }
    }
        document.getElementById("assigned_admin").addEventListener("input", function () {
            checkLimit(this, 50, "assigned_admin_error"); // Исправил ошибку id
        });
        document.getElementById("title").addEventListener("input", function () {
            checkLimit(this, 100, "title_error");
        });
        document.getElementById("description").addEventListener("input", function () {
            checkLimit(this, 500, "description_error");
        });
        document.getElementById("ticketsendform").addEventListener("submit", function (event) {
            const assignedAdmin = document.getElementById("assigned_admin");
            const title = document.getElementById("title");
            const description = document.getElementById("description");
            let hasError = false;
            if (assignedAdmin.value.length > 50) {
                document.getElementById("assigned_admin_error").textContent = "Слишком длинное значение!";
                hasError = true;
            }
            if (title.value.length > 100) {
                document.getElementById("title_error").textContent = "Слишком длинное название!";
                hasError = true;
            }
            if (description.value.length > 500) {
                document.getElementById("description_error").textContent = "Описание слишком длинное!";
                hasError = true;
            }
            if (hasError) {
                event.preventDefault();
                alert("Исправьте ошибки перед отправкой формы!");
            }
        });
    });
const openTabBtn = document.getElementById('open-tab-btn');
const closedTabBtn = document.getElementById('closed-tab-btn');
const openTickets = document.getElementById('open-tickets');
const closedTickets = document.getElementById('closed-tickets');
const sendtickettab = document.getElementById('sendtickettab');  
const showsendticketbtn = document.getElementById('showsendticketbtn');  
const ticketsendform = document.getElementById('ticketsendform');  
openTabBtn.addEventListener('click', function() {
    openTickets.style.display = 'block';
    ticketsendform.style.display = "none"
    closedTickets.style.display = 'none';
    openTabBtn.classList.add('active');
    closedTabBtn.classList.remove('active');
    sendtickettab.style.display = 'flex';
});
closedTabBtn.addEventListener('click', function() {
    openTickets.style.display = 'none';
    ticketsendform.style.display = "none"   
    closedTickets.style.display = 'block';
    openTabBtn.classList.remove('active');
    closedTabBtn.classList.add('active');
    sendtickettab.style.display = 'flex ';
});
showsendticketbtn.addEventListener('click', function() {
    sendtickettab.style.display = 'none';
    ticketsendform.style.display = 'block';
    closedTickets.style.display = 'none';
    openTickets.style.display = 'none';
    openTabBtn.classList.remove('active');
    closedTabBtn.classList.remove('active');
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