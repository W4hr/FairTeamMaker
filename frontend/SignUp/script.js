document.addEventListener("DOMContentLoaded", () => {

    const tabs = document.querySelectorAll(".tab");
    const submitButton = document.querySelector(".blue-button");
    const Site_Title = document.getElementById("Site_Title");
    input_username = document.getElementById("input_username");
    input_password = document.getElementById("input_password");
    let action;

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            submitButton.innerText = tab.innerText;
            Site_Title.innerText = tab.innerText
            action = tab.innerText;
            console.log(action)
            input_password.value = "";
        });
    });


    const submit_button = document.getElementById("submit_button");
    submit_button.addEventListener("submit", () => {
        let username = input_username.value;
        let password = input_password.value;
        if (action == "Sign In"){
            login(username, password)
        } else if (action == "Sign Up"){
        } else{
            show_message("There is an error with your submission. Please reload the site.", "warning")
            console.error("action does not match function")
        }
    });
})

function show_message(message, type_message){
    const message_box = document.getElementById("message_box");
    if (type_message == "warning"){
        message_box.innerHTML = `<img src="./img/message/warning.svg" class="message_box_icon"> ${message}`;
        message_box.className = "warning_message show";
    } else if (type_message == "info"){
        message_box.innerHTML = `<img src="./img/icon/info.svg" class="message_box_icon"> ${message}`;
        message_box.className = "show";
    } else if (type_message == "success"){
        message_box.innerHTML = `<img src="./img/icon/check.svg" class="message_box_icon"> ${message}`;
        message_box.className = "success_message show";
    } else {
        console.error("Message type was not proper");
    }
    setTimeout(() => {
        message_box.classList.remove('show');
    }, 5000);
}

async function login(username, password) {
    try {
        const api_response = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await api_response.json();

        if (api_response.ok) {
            const token = data.access_token;
            localStorage.setItem("token", token);
            window.location.href = "http://127.0.0.1:5500/frontend/UI/interface.html";
        } else {
            console.error("Error during login");
            show_message("⚙️System Error: \n An error occurred during login.");
        }
    } catch (error) {
        console.error("Error during login:", error);
        show_message("⚙️System Error: \n An error occurred during login.");
    }
}

async function sign_up(username, password) {
    try {
        const api_response = await fetch("/SignUp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await api_response.json();

        if (api_response.ok) {
            show_message("Account successfully created", "success");
            document.getElementById("signInTab").click();
        } else {
            console.error("Error during sign up");
            show_message("⚙️System Error: \n An error occurred during sign up.");
        }
    } catch (error) {
        console.error("Error during sign up:", error);
        show_message("⚙️System Error: \n An error occurred during sign up.");
    }
}