const homeButton = document.getElementById("homeButton");

homeButton.addEventListener("click", () => {
    window.api.send("screen:home");
});
