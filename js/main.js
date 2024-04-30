let activePage = "gameMenu";
let mapScale = 1;
let availableMapScales = ["Village","Town","City"]
let autoOpen = true;

function switchMenu(page) {
    let previouslyActivePage = activePage;
    for (const e of document.querySelectorAll("content:not(#modalHolder)")) {
        switch (e.id) {
            case page:
                e.className = "active";
                activePage = e.id;
                break;
            case previouslyActivePage:
                e.className = "previouslyActive";
                setTimeout(function() {
                    e.className = ""
                },700);
                break;
            default:
                e.className = ""
        }
    }
}

// Menu
document.querySelector("#viewMenu").addEventListener("click", () => {
    switchMenu("gameOptions");
})

document.querySelector("#credits").addEventListener("click", () => {
   if (document.querySelector("#gameCredits").open) {
       document.querySelector("#gameCredits").close()
   } else {
        document.querySelector("#gameCredits").showModal()
   }
})

document.querySelector("#about").addEventListener("click", () => {
    if (document.querySelector("#gameAbout").open) {
       document.querySelector("#gameAbout").close()
   } else {
        document.querySelector("#gameAbout").showModal()
   }
})

document.querySelector("#returnTitle").addEventListener("click", () => {
    switchMenu("gameMenu");
})

for (const e of document.querySelectorAll("button.close")) {
	e.addEventListener("click", () => {
		e.parentElement.close();
	})
}

// Game Select
document.querySelector("#smallSize").addEventListener("click", () => {
	if (mapScale > 0) {
		mapScale--;
		game.setGameData("mapSize",availableMapScales[mapScale].toLowerCase());
		document.querySelector("#mapSize").textContent = availableMapScales[mapScale];
		document.querySelector("#mapSizeHR").style.display = (mapScale != 1) ? "none" : "";
		document.querySelector("#demoWarning").style.display = (mapScale != 1) ? "none" : "";
		
		for (let i = 0;i < availableMapScales.length;i++) {
			if (i == mapScale) {
				document.querySelector("#" + availableMapScales[i].toLowerCase() + "Scale").className = "selected";
			} else {
				document.querySelector("#" + availableMapScales[i].toLowerCase() + "Scale").className = "";
			}
		}
	}
})

document.querySelector("#largeSize").addEventListener("click", () => {
	if (mapScale < availableMapScales.length) {
		mapScale++;
		game.setGameData("mapSize",availableMapScales[mapScale].toLowerCase());
		document.querySelector("#mapSize").textContent = availableMapScales[mapScale];
		document.querySelector("#mapSizeHR").style.display = (mapScale != 1) ? "none" : "";
		document.querySelector("#demoWarning").style.display = (mapScale != 1) ? "none" : "";
		
		for (let i = 0;i < availableMapScales.length;i++) {
			if (i == mapScale) {
				document.querySelector("#" + availableMapScales[i].toLowerCase() + "Scale").className = "selected";
			} else {
				document.querySelector("#" + availableMapScales[i].toLowerCase() + "Scale").className = "";
			}
		}
	}
})


document.querySelector("#startGame").addEventListener("click", () => {
	if ((mapScale == 0) || (mapScale == 2)) {
		document.querySelector("#errorLoading").showModal();
		return;
	}
	document.querySelector("#preloader").className = "appear";
	
	setTimeout(function() {
		switchMenu("gameInterface");
		document.querySelector("#preloader").className = "";
	},1000)
	
	setTimeout(function() {
		document.querySelector("#preloader").className = "dissapear";
	},2000)
	
	setTimeout(function() {game.setupMap(); document.querySelector("#preloader").className = "inactive";},3000)
})

document.querySelector("#settingsBtn").addEventListener("click", () => {
	document.querySelector("#errorLoading").showModal();
})

document.querySelector("#funFactBtn").addEventListener("click", () => {
	document.querySelector("#centralPlaceTheory").showModal();
})

document.querySelector("#returnToMenu").addEventListener("click", () => {
	location.reload();
})

document.querySelector("#hideMenu").addEventListener("click", () => {
	document.querySelector("#gameOver").className = "";
})

document.querySelector("#returnMenu").addEventListener("click", () => {
	document.querySelector("#gameOver").className = "visible";
})

if (autoOpen) {
	switchMenu("gameInterface")
	setTimeout(function() {game.setupMap();},2000)
}
