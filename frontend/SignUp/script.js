const interface_url = "http://127.0.0.1:8000"
const api_url = "http://127.0.0.1:8000"

document.addEventListener("DOMContentLoaded", () => {

    const tabs = document.querySelectorAll(".tab");
    const submitButton = document.querySelector(".blue-button");
    const Site_Title = document.getElementById("Site_Title");
    input_username = document.getElementById("input_username");
    input_password = document.getElementById("input_password");
    let action = "Sign In";

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
    submit_button.addEventListener("click", () => {
        console.log("Attempting Sign Up ...")
        let username = input_username.value;
        let password = input_password.value;
        if (action == "Sign In"){
            try{
                login(username, password)
            } catch (error){
                console.error("Error during login:", error)
            }
        } else if (action == "Sign Up"){
            sign_up(username, password)
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
        message_box.innerHTML = `<img src="./img/message/info.svg" class="message_box_icon"> ${message}`;
        message_box.className = "show";
    } else if (type_message == "success"){
        message_box.innerHTML = `<img src="./img/message/check.svg" class="message_box_icon"> ${message}`;
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
        const api_response = await fetch(`${api_url}/token`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ username, password }),
            credentials: "include"
        });

        if (api_response.ok) {
            window.location.href = interface_url;
        } else if (api_response.status === 401) {  // Check for 401 Unauthorized
            const data = await api_response.json();
            console.error("Login error:", data.detail);
            show_message("❌ Login Error: Incorrect username or password.", "error")
        } else {
            const data = await api_response.json();
            console.error("Error during login:", data.detail || "Unknown error");
            show_message("⚙️System Error: \n An error occurred during login.");
        }
    } catch (error) {
        console.error("Error during login:", error);
        show_message("⚙️System Error: \n An error occurred during login.");
    }
}

async function sign_up(username, password) {
    try {
        const api_response = await fetch(`${api_url}/SignUp`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ username, password }),
            credentials: "include"
        });

        if (api_response.ok) {
            show_message("Account successfully created", "success");
            document.getElementById("signInTab").click();
        } else {
            const data = await api_response.json();
            console.error("Error during sign up:", data.detail || "Unknown error");
            show_message("⚙️System Error: \n An error occurred during sign up.");
        }
    } catch (error) {
        console.error("Error during sign up:", error);
        show_message("⚙️System Error: \n An error occurred during sign up.");
    }
}