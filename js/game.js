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
		function findUniqueStreets(size,sides) {
			if (!sides) {
				sides = 0;
			}
			
			console.log((4*(size ** 2)));
			return (size == 1) ? (sides) : (((4*(size ** 2))) - findUniqueStreets(size - 1,sides + (4 * (size - 1))));
		}
		
		console.log(findUniqueStreets(size));
	}
	
	return {
		createPropertyGrid : createPropertyGrid,
		createStreetGrid : createStreetGrid
	};
})();