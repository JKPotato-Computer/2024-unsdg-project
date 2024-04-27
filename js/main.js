function switchMenu(page) {
    for (const e of document.querySelectorAll("content:not(#modalHolder)")) {
        if (e.id == page) {
            e.className = "active";
        } else {
            e.className = "";
        }
    }
}

game.setupMap();

document.querySelector("#viewMenu").addEventListener("click", () => {
    switchMenu("gameOptions");
})