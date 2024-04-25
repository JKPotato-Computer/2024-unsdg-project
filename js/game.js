const canvas = document.getElementById('gameWorld');
const ctx = canvas;

const game = (function() {
	let gameData = {
		districtPropertyData : [],
		streetPropertyData : [],
		budget : 0,
		yearlyDue : 0,
		debt : 0,
		SDG : {},
		mapSize : "village"
	};
	
	const getRandomIntInclusive = function(min, max) {
	  const minCeiled = Math.ceil(min);
	  const maxFloored = Math.floor(max);
	  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
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
					property.pathfindStreet(gameData.districtPropertyData,gameData.streetPropertyData);
					checkIDs.push(property.id);
				}
			}
		}
		
		console.log(gameData.streetPropertyData);
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
	
	return {
		createPropertyGrid : createPropertyGrid,
		createStreetGrid : createStreetGrid,
		setupMap : setupMap,
		generateRandomProperties : generateRandomProperties,
		getGameData : getGameData
	};
})();

function animate(){
	ctx.clearRect();
	ctx.fillStyle = "blue";
	ctx.fillRect(10,10,100,100);

	animate();
}
animate();