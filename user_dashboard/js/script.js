// script.js
document.addEventListener("DOMContentLoaded", function () {
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
            const response = await fetch(`/ticketing_system/user_dashboard/php/check.php?nocache=${Date.now()}`);
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
            });

            if (!changesFound) {
                console.log("✅ Статусы не изменились");
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
        let assignedAdmin = ticket.assigned_admin || "Не назначен"; 
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
        checkLimit(this, 50, "position_error");
    });

    document.getElementById("title").addEventListener("input", function () {
        checkLimit(this, 100, "title_error");
    });

    document.getElementById("description").addEventListener("input", function () {
        checkLimit(this, 500, "description_error");
    });

    document.getElementById("ticketsendform").addEventListener("submit", function (event) {
        const senderName = document.getElementById("position");
        const title = document.getElementById("title");
        const description = document.getElementById("description");

        if (senderName.value.length > 50 || title.value.length > 100 || description.value.length > 500) {
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