const game = (function() {
	let gameData = {
		districtPropertyData : [],
		streetPropertyData : [],
		budget : 0,
		yearlyDue : 0,
		debt : 0,
		SDG : {
			"SDG3" : 10,
			"SDG6" : 20,
		},
		SDGDeadline : 0,
		mapSize : "town",
		
		gameSpeed : 0,
		timeElapsed : 0,
		date : {month : 0,year : 0},
		dateSwitch : false,
		
		trackerData : { // general statistics
			incomeGain : 0,
			incomeLost : 0,
			score: 0
		}
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
		document.querySelector("#gameClockOverlay").textContent = "clock_loader_" + ((gameData.timeElapsed % 5 != 0) ? ((gameData.timeElapsed%5)*20) : ("10"));

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
		
		document.querySelector("#elapsedTime").innerHTML = "Time Elapsed: <b>" + String(Math.floor(gameData.timeElapsed / 60)).padStart(2,"0") + ":" + String(gameData.timeElapsed % 60).padStart(2,"0");
		document.querySelector("#totalIncomeGenerated").innerHTML = "Total Income Generated: <b>$" + gameData.trackerData.incomeGain + "</b>";
		document.querySelector("#totalExpenses").innerHTML = "Total Expenses: <b>$" + gameData.trackerData.incomeLost + "</b>";
		
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
		gameData.SDGDeadline = 900 - (date.getMonth() * 60);
		
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

		switch (gameData.timeElapsed % 5) {
			case 0:
				if (gameData.dateSwitch) {
					break;
				}
				
				if (gameData.date.month == 11) {
					gameData.date.month = 0;
					gameData.date.year++;

					gameData.budget += Math.floor(gameEnum.baseConfig[gameData.mapSize].budget * 0.3);
					gameData.budget -= gameData.yearlyDue;
					gameData.trackerData.incomeGain += Math.floor(gameEnum.baseConfig[gameData.mapSize].budget * 0.3);
					gameData.trackerData.incomeLost += gameData.yearlyDue;
				
					let yearlyLost = 0;
					let checkIds = [];
					for (let x = 0;x < gameData.districtPropertyData.length;x++) {
						for (let y = 0;y < gameData.districtPropertyData.length;y++) {
							let property = gameData.districtPropertyData[x][y];
							if ((!checkIds.includes(property.id)) &&(property.yearlyDue)) {
								yearlyLost += property.yearlyDue;
								checkIds.push(property.id);
							}
						}
					}
				
					if ((gameData.debt > 0) && (gameData.debt - gameData.budget <= 0)) {
						gameData.debt -= gameData.budget;
						gameData.budget = 0;
					}
				
					gameData.yearlyDue = Math.floor(gameEnum.baseConfig[gameData.mapSize].yearlyDue * (1.001 * Math.floor(gameData.timeElapsed / 60)));
				
					if (gameData.budget < 0) {
						gameData.debt += (Math.abs(gameData.budget));
						gameData.budget = 0;
					}

				} else {
					gameData.date.month++;
				}
				
				let incomeGenerated = generateIncome();
				gameData.trackerData.incomeGain += incomeGenerated;
				gameData.yearlyDue += Math.floor(incomeGenerated / 10);
				
				gameData.dateSwitch = true;
				break;
			default:
				if (gameData.SDGDeadline <= 0) {
					gameData.SDGDeadline = 900;
				}

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
	
	document.querySelector("#viewAnalytics").addEventListener("click",() => {
		document.querySelector("#gameStatistics").showModal();
	})
	
	document.querySelector("#guides").addEventListener("click",() => {
		document.querySelector("#dictionary").showModal();
	})
	
	document.querySelector("#viewActionCards").addEventListener("click",() => {
		document.querySelector("#actionCards").showModal();
	})
	
	
	document.querySelector("#dictionaryBack").addEventListener("click",() => {
		document.querySelector("#guideIF").contentWindow.document.querySelector("#homePage").className = "active";
		document.querySelector("#guideIF").contentWindow.document.querySelector("#SDGList").className = "";
		document.querySelector("#guideIF").contentWindow.document.querySelector("#guide").className = "";
		document.querySelector("#guideIF").contentWindow.document.querySelector("#propertyList").className = "";
	})
	
	const setGameData = function(i,v) {
		gameData[i] = v;
	}
	
	for (const type of Object.keys(SDG.prototype.actionCardList)) {
		const cardInfo = SDG.prototype.actionCardList[type];
		
		const newButton = document.createElement("button");
		newButton.className = "actionCardHolder";
		
		const ACIcon = document.createElement("div");
		ACIcon.clasName = "ACIconHolder material-symbols-outlined";
		ACIcon.textContent = cardInfo.icon;
		
		const ACContent = document.createElement("div");
		ACContent.className = "ACContent";
		
		const ACTitle = document.createElement("span");
		ACTitle.className = "ACTitle";
		ACTitle.textContent = type;
		
		const ACRequirements = document.createElement("span");
		ACRequirements.className = "ACRequirements";
		ACRequirements.textContent = "* Required: " + cardInfo.required;
		
		const hr = document.createElement("hr");
		
		const ACDescription = document.createElement("span");
		ACDescription.clasName = "ACDescription";
		ACDescription.textContent = cardInfo.description;
		
		const ACKeys = document.createElement("span");
		ACKeys.clasName = "ACKeys";
		ACKeys.innerHTML = cardInfo.cost + " UND" + (cardInfo.oneTime) ? ("<b>(ONE TIME PURCHASE)</b>") : ("");
		
		newButton.appendChild(ACIcon);
		newButton.appendChild(ACContent);
		ACContent.appendChild(ACTitle);
		ACContent.appendChild(ACRequirements);
		ACContent.appendChild(hr);
		ACContent.appendChild(ACDescription);
		ACContent.appendChild(ACKeys);
		document.querySelector("#" + cardInfo.type).appendChild(newButton);
		
	}
	
	return {
		createPropertyGrid : createPropertyGrid,
		createStreetGrid : createStreetGrid,
		setupMap : setupMap,
		generateRandomProperties : generateRandomProperties,
		getGameData : getGameData,
		setGameData : setGameData,
	};
})();