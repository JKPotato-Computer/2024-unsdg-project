const game = (function() {
	let gameData = {
		districtPropertyData : [],
		streetPropertyData : [],
		budget : 0,
		yearlyDue : 0,
		debt : 0,
		SDG : {},
		mapSize : "city"
	};

	const generateRandomProperties = function() {
		switch (gameData.mapSize) {
			case "village":
				break;
			case "town": 
				break;
			case "city":
				break;
		}
		
		let newProperty = new Zone({type : "neighborhood", height : 2, width : 2});
		gameData.districtPropertyData = newProperty.placeZone(gameData.districtPropertyData,0,0);
		
		let newProperty2 = new Zone({type : "neighborhood", height : 2, width : 2});
		gameData.districtPropertyData = newProperty.placeZone(gameData.districtPropertyData,1,1);
		
		console.log(gameData.districtPropertyData);

		/*
		1) Create a new class Building with parameters of attempted spawnpoint (x,y) from bottom left of building
		2) Check to see if there's space to place the building at that location. If not, regenerate until avaliable.
		3) IF there is space, place the building into that grid location.
		4) Pathfind a road from that item to a nearby road, business, or state route.
		*/
	}
	
	const createPropertyGrid = function(size) {
		gameData.districtPropertyData = new Array(size);
		for (let x = 0;x < size;x++) {
			gameData.districtPropertyData[x] = new Array(size);
			for (let y = 0;y < size;y++) {
				gameData.districtPropertyData[x][y] = new Zone();
			}
		}
		
		console.log(gameData.districtPropertyData);
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
		
		console.log(gameData.streetPropertyData);
	}
	
	return {
		createPropertyGrid : createPropertyGrid,
		createStreetGrid : createStreetGrid,
		generateRandomProperties : generateRandomProperties
	};
})();