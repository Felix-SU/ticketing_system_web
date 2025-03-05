document.addEventListener("DOMContentLoaded", function () {
    const passwordInput = document.getElementById("password");
    const loginInput = document.getElementById("username");
    if (loginInput) {
        loginInput.addEventListener("input", function () {
            let newValue = this.value.replace(/[^a-z0-9]/gi, "").toLowerCase();
            
            if (this.value !== newValue) {
                this.value = newValue;
                showErrorMessage("Логин только латиница и цифры!");
            }
        });
        loginInput.addEventListener("keydown", function () {
            let newValue = this.value.replace(/[^a-z0-9]/gi, "").toLowerCase();
            
            if (this.value !== newValue) {
                this.value = newValue;
                showErrorMessage("Логин только латиница и цифры!");
            }
        });
    }
 if (passwordInput) {
    passwordInput.addEventListener("input", function () {
        let newValue = this.value.replace(/[^a-z0-9!@#$%^&*()_+\-=\[\]{}|;:'",.<>?/]/gi, "");
        if (this.value !== newValue) {
            this.value = newValue;
            showErrorMessage("Пароль может содержать только латинские буквы, цифры и символы !@#$%^&*()_+", "error-box");
        }
    });
    passwordInput.addEventListener("keydown", function (event) {
        if (!/[a-z0-9!@#$%^&*()_+\-=\[\]{}|;:'",.<>?/]/i.test(event.key) && 
            !["Backspace", "Tab", "Enter", "ArrowLeft", "ArrowRight", "Delete"].includes(event.key)) {
            event.preventDefault();
            showErrorMessage("Пароль может содержать только латинские буквы, цифры и символы !@#$%^&*()_+", "error-box");
        }
    });
}
    document.getElementById("login-form").addEventListener("submit", function (event) {
        event.preventDefault();
        let formData = new FormData(this);
        fetch("/login/php/login.php", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            showErrorMessage(data.message, data.success ? "success-box" : "error-box");
            if (data.success) {
                setTimeout(() => {
                    window.location.href = data.redirect;
                }, 1000);
            }
        })
        .catch(error => showErrorMessage("Ошибка запроса!", "error-box"));
    });
    function showErrorMessage(message, type = "error-box") {
        let form = document.getElementById("login-form");
        let submitButton = form.querySelector("button[type='submit']");
        let oldMessage = document.getElementById("message-box");
        if (oldMessage) oldMessage.remove();
        let messageBox = document.createElement("div");
        messageBox.id = "message-box";
        messageBox.className = `message-box ${type}`;
        let icon = document.createElement("span");
        icon.className = "message-icon";
        icon.innerHTML = type === "success-box" ? "✅" : "❌";
        let messageText = document.createElement("span");
        messageText.textContent = ` ${message}`;
        messageBox.appendChild(icon);
        messageBox.appendChild(messageText);
        submitButton.parentNode.insertBefore(messageBox, submitButton.nextSibling);
        setTimeout(() => {
            messageBox.style.opacity = "0";
            setTimeout(() => messageBox.remove(), 500);
        }, 1500);
    }
});