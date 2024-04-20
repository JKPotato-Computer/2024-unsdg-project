const game = (function() {
	let gamePropertyData = [];
	let streetPropertyData = [];
	
	const createPropertyGrid = function(size) {
		gamePropertyData = new Array(size);
		for (let x = 0;x < size;x++) {
			gamePropertyData[x] = new Array(size);
			for (let y = 0;y < size;y++) {
				gamePropertyData[x][y] = {};
				gamePropertyData[x][y].propertyType = ""; // type of property (ex: factory, neighborhood)
				gamePropertyData[x][y].groupName = ""; // collection of similar groups (if any)
			}
		}
		
		console.log(gamePropertyData);
	}
	
	const createStreetGrid = function(size) {
		streetPropertyData = {};
		for (let x = 0;x <= size;x+=0.5) {
			streetPropertyData[x] = {};
			for (let y = 0.5;y <= size;(x % 2 == 0) ? (y++) : (y+=0.5)) {
				streetPropertyData[x][y] = {};
				streetPropertyData[x][y].surfaceType = "";  // road, light rail, interstate, etc.
				streetPropertyData[x][y].upgrades = {}; // bus stop, bike lane, BRT, etc.
			}
		}
		
		console.log(streetPropertyData);
	}
	
	return {
		createPropertyGrid : createPropertyGrid,
		createStreetGrid : createStreetGrid
	};
})();