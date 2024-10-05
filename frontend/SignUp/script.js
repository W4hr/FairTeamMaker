const tabs = document.querySelectorAll(".tab");
const submitButton = document.querySelector(".blue-button");
const Site_Title = document.getElementById("Site_Title");

tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        submitButton.innerText = tab.innerText;
        Site_Title.innerText = tab.innerText
    });
});
