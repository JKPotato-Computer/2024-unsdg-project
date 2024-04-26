const game = (function() {
	let gameData = {
		districtPropertyData : [],
		streetPropertyData : [],
		budget : 0,
		yearlyDue : 0,
		debt : 0,
		SDG : {
			"SDG3" : 10,
			"SDG6" : 40,
		},
		SDGDeadline : 0,
		mapSize : "town",
		
		gameSpeed : 1,
		timeElapsed : 0,
		date : {month : 0,year : 0},
		dateSwitch : false,
	};
	let inSession = false;
	let timerInterval;
	
	
	const getRandomIntInclusive = function(min, max) {
	  const minCeiled = Math.ceil(min);
	  const maxFloored = Math.floor(max);
	  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
	}

	const refreshUI = function() {
		document.querySelector("#gameUNDValue").textContent = gameData.budget;
		document.querySelector("#gameDueValue").textContent = gameData.yearlyDue;
		document.querySelector("#gameDebtValue").textContent = gameData.debt;
		document.querySelector("#gameDebtValue").parentElement.style.display = (gameData.debt == 0) ? ("none") : ("");
		document.querySelector("#clockTime").textContent = String(gameData.date.month+1).padStart(2,"0") + "/" + gameData.date.year;
		document.querySelector("#SDGDeadline").innerHTML = "DEADLINE FOR SDG: <b>" + Math.floor(gameData.SDGDeadline / 60) + "m " + (gameData.SDGDeadline % 60) + "s" + "</b>"
	
		while (document.querySelector("#SDGList").firstChild) {
			document.querySelector("#SDGList").removeChild(document.querySelector("#SDGList").lastChild);
		}
		
		for (const SDG of Object.keys(gameData.SDG)) {
			const SDGHolder = document.createElement("div");
			SDGHolder.className = "SDGHolder " + SDG;
			
			const SDGHolderProgress = document.createElement("progress");
			SDGHolderProgress.max = "100";
			SDGHolderProgress.value = String(gameData.SDG[SDG]);
			SDGHolderProgress.className = "SDGProgress";
			
			SDGHolder.appendChild(SDGHolderProgress);
			document.querySelector("#SDGList").appendChild(SDGHolder);
		}
	}
	
	const generateIncome = function() {
		let checkIds = [];
		let income = 0;
		for (let x = 0;x < gameData.districtPropertyData.length;x++) {
			for (let y = 0;y < gameData.districtPropertyData.length;y++) {
				let property = gameData.districtPropertyData[x][y];
				if ((!checkIds.includes(property.id)) && (property.type != "")) {
					gameData.budget += property.incomeGenerate;
					income += property.incomeGenerate;
					
					for (const id of property.boostingID) {
						let boostProperty = property.getZoneByID(gameData.districtPropertyData, id);
						let [x,y,spaces] = property.detectNearbyBusiness(gameData.districtPropertyData);
						if (boostProperty) {
							gameData.budget += Math.floor(boostProperty.incomeGenerate * (property.incomeBoost * (spaces / (property.influence / .5))));
							income += Math.floor(boostProperty.incomeGenerate * (property.incomeBoost * (spaces / (property.influence / .5))));
						}
					}

					checkIds.push(property.id);
				}
			}
 		}

		
		return income;
	}

	const generateRandomProperties = function() {
		for (const property of Object.keys(gameEnum.baseProperties[gameData.mapSize])) {
			for (let i = 0;i < gameEnum.baseProperties[gameData.mapSize][property];i++) {
				const newProperty = new Zone();
				newProperty.appendZone(property);
				let rX = getRandomIntInclusive(0,gameData.districtPropertyData.length);
				let rY = getRandomIntInclusive(0,gameData.districtPropertyData.length);
				
				do {
					rX = getRandomIntInclusive(0,gameData.districtPropertyData.length);
					rY = getRandomIntInclusive(0,gameData.districtPropertyData.length);
				} while (!newProperty.placeZone(gameData.districtPropertyData,rX,rY));
			}
		}
		
		console.log(gameData.districtPropertyData);

		/*
		1) Create a new class Building with parameters of attempted spawnpoint (x,y) from bottom left of building
		2) Check to see if there's space to place the building at that location. If not, regenerate until avaliable.
		3) IF there is space, place the building into that grid location.
		4) Pathfind a road from that item to a nearby road, business, or state route.
		*/
	}
	
	const setupMap = function() {
		createPropertyGrid(gameEnum.mapSizes[gameData.mapSize]);
		createStreetGrid(gameEnum.mapSizes[gameData.mapSize]);
		
		let CBDIndex = (gameEnum.mapSizes[gameData.mapSize] - 1)/2;
		for (let x = 0;x < gameEnum.mapSizes[gameData.mapSize];x++) {
			let property = new Zone();
			if (x == CBDIndex) {
				property.appendZone("cbd");

				if (gameData.mapSize == "city") {
					for (let y = 0;y < gameEnum.mapSizes[gameData.mapSize];y++) {
						if (y == CBDIndex) {
							continue;
						}

						let stateRoute = new Zone();
						stateRoute.appendZone("stateRoute");
						stateRoute.placeZone(gameData.districtPropertyData,CBDIndex,y);
					}
				}

			} else {
				property.appendZone("stateRoute")
			}

			property.placeZone(gameData.districtPropertyData,x,CBDIndex)
		}

		generateRandomProperties();

		let checkIDs = [];
		for (let x = 0; x < gameEnum.mapSizes[gameData.mapSize];x++) {
			for (let y = 0; y < gameEnum.mapSizes[gameData.mapSize];y++) {
				let property = gameData.districtPropertyData[x][y];
				
				if ((!checkIDs.includes(property.id)) && (property.canGenerateRoad)) {
					let result = property.pathfindStreet(gameData.districtPropertyData,gameData.streetPropertyData);
					
					if (result) {
						gameData.streetPropertyData = result;
					}
					
					checkIDs.push(property.id);
				}
			}
		}
		
		const date = new Date();
		gameData.date.month = date.getMonth();
		gameData.date.year = date.getFullYear() - 2000;
		
		inSession = true;
		gameData.timeElapsed = 0;
		gameData.SDGDeadline = 1200;
		
		gameData.budget = gameEnum.baseConfig[gameData.mapSize].budget;
		gameData.yearlyDue = gameEnum.baseConfig[gameData.mapSize].yearlyDue;
		
		refreshUI();
		timerInterval = setInterval(updateTimer,1000 / gameData.gameSpeed);
	}
	
	const createPropertyGrid = function(size) {
		gameData.districtPropertyData = new Array(size);
		for (let x = 0;x < size;x++) {
			gameData.districtPropertyData[x] = new Array(size);
			for (let y = 0;y < size;y++) {
				gameData.districtPropertyData[x][y] = new Zone();
			}
		}
	}
	
	const createStreetGrid = function(size) {
		gameData.streetPropertyData = {};
		for (let x = 0;x <= size;x+=0.5) {
			gameData.streetPropertyData[x] = {};
			for (let y = (x % 1 != 0) ? (0) : (0.5);y <= size;y++) {
				gameData.streetPropertyData[x][y] = {};
				gameData.streetPropertyData[x][y].surfaceType = "";  // road, light rail, interstate, etc.
				gameData.streetPropertyData[x][y].upgrades = {}; // bus stop, bike lane, BRT, etc.
			}
		}
	}
	
	const getGameData = function() {
		return gameData;
	}
	
	const updateTimer = function() {
		if (!inSession) {
			return;
		}
		
		gameData.timeElapsed++;
		gameData.SDGDeadline--;
		
		switch (gameData.timeElapsed % 60) {
			case 0:
				gameData.budget += Math.floor(gameEnum.baseConfig[gameData.mapSize].budget * 0.3);
				gameData.budget -= gameData.yearlyDue;
				
				if ((gameData.debt > 0) && (gameData.debt - gameData.budget <= 0)) {
					gameData.debt -= gameData.budget;
					gameData.budget = 0;
				}
				
				gameData.yearlyDue = Math.floor(gameEnum.baseConfig[gameData.mapSize].yearlyDue * (1.001 * Math.floor(gameData.timeElapsed / 60)));
				
				if (gameData.budget < 0) {
					gameData.debt += (Math.abs(gameData.budget));
					gameData.budget = 0;
				}
				
				if (SDGDeadline == 0) {
					SDGDeadline = 1200;
				}
				
				break;
		}

		switch (gameData.timeElapsed % 5) {
			case 0:
				if (gameData.dateSwitch) {
					break;
				}
				
				if (gameData.date.month == 11) {
					gameData.date.month = 0;
					gameData.date.year++;
				} else {
					gameData.date.month++;
				}
				
				let incomeGenerated = generateIncome();
				gameData.yearlyDue += Math.floor(incomeGenerated / 10);
				document.querySelector("#gameClockOverlay").textContent = "clock_loader_10";
				
				gameData.dateSwitch = true;
				break;
			default:
				document.querySelector("#gameClockOverlay").textContent = "clock_loader_" + (gameData.timeElapsed%5)*20;
				gameData.dateSwitch = false;
				break;
		}
		
		refreshUI();
	}
	
	for (const speed of Object.keys(gameEnum.gameSpeed)) {
		document.querySelector("#" + speed).addEventListener("click",() => {
			gameData.gameSpeed = gameEnum.gameSpeed[speed];
			
			clearInterval(timerInterval);
			
			if (gameData.gameSpeed != 0) {
				timerInterval = setInterval(updateTimer,1000 / gameData.gameSpeed);
			}
			
			
			for (const speedKey of Object.keys(gameEnum.gameSpeed)) {
				if (gameEnum.gameSpeed[speedKey] != gameData.gameSpeed) {
					document.querySelector("#" + speedKey).className = "material-symbols-rounded inactive";
				} else {
					document.querySelector("#" + speedKey).className = "material-symbols-rounded";
				}
			}
		})
	}
	
	return {
		createPropertyGrid : createPropertyGrid,
		createStreetGrid : createStreetGrid,
		setupMap : setupMap,
		generateRandomProperties : generateRandomProperties,
		getGameData : getGameData
	};
})();

const canvas = document.getElementById("gameWorld");
canvas.height = 1000;
canvas.width = 1000;
const ctx = canvas.getContext('2d');

let sX = 100;
let sY = 100;

function animate(){
	ctx.clearRect(0,0,canvas.width,canvas.height);
	ctx.fillStyle = "rgb(240,240,240)";
	ctx.fillRect(0,0,sX,sY);
	
	sX += 1;
	sY += 1;

	requestAnimationFrame(animate);
}
animate();