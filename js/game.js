const game = (function() {
	let gameData = {
		districtPropertyData : [],
		streetPropertyData : []
	};
	
	const createPropertyGrid = function(size) {
		gameData.districtPropertyData = new Array(size);
		for (let x = 0;x < size;x++) {
			gameData.districtPropertyData[x] = new Array(size);
			for (let y = 0;y < size;y++) {
				gameData.districtPropertyData[x][y] = {};
				gameData.districtPropertyData[x][y].propertyType = ""; // type of property (ex: factory, neighborhood)
				gameData.districtPropertyData[x][y].groupName = ""; // collection of similar groups (if any)
			}
		}
		
		console.log(gameData.districtPropertyData);
	}
	
	const createStreetGrid = function(size) {
		gameData.streetPropertyData = {};
		for (let x = 0;x <= size;x+=0.5) {
			gameData.streetPropertyData[x] = {};
			for (let y = 0.5;y <= size;y++) {
				gameData.streetPropertyData[x][y] = {};
				gameData.streetPropertyData[x][y].surfaceType = "";  // road, light rail, interstate, etc.
				gameData.streetPropertyData[x][y].upgrades = {}; // bus stop, bike lane, BRT, etc.
			}
		}
		
		console.log(gameData.streetPropertyData);
	}
	
	return {
		createPropertyGrid : createPropertyGrid,
		createStreetGrid : createStreetGrid
	};
})();