// Game Data Properties
const gameEnum = (function() {
	const baseProperties = {
		village : {
			neighborhood : 2,
			gasStation : 1,
			groceryStore : 1,
			residentialPark : 2,
			factory : 3,
			offices : 2,
			school : 1,
			commercialStore : 1
		},
		
		town : {
			neighborhood : 4,
			gasStation : 4,
			commercialStore : 2,
			commercialMall : 1,
			fastFoodChain : 1,
			restaurant : 1,
			apartment : 2,
			residentialPark : 4,
			factory : 5,
			school: 2,
			offices: 3
		},
		
		cities : {
			commercialAirport : 1,
			factory : 8,
			school : 4,
			mansion : 1,
			commercialStore : 1,
			commercialMall : 2,
			fastFoodChain : 5,
			restaurant : 3,
			neighborhood : 7,
			offices : 5,
			apartment : 4,
			residentialPark : 4,
			groceryStore : 3,
			gasStation : 6
		}
	}
	
	const mapSizes = {
		village : 11,
		towns: 21,
		cities : 41
	}
	
	return {
		baseProperties : baseProperties,
		mapSizes : mapSizes
	};
})();

// Zone
class Zone {
	/**
		* Creates a new zone / building with a specific dimension and function.
		
		// Spatial Perspective
		* @param {object} [zone] - Optional parameters
		* @param {number} [zone.height] - Height of zone on 2D space
		* @param {number} [zone.width] - Width of zone on 2D space
		* @param {string} [zone.type] - Type of zone / function
		* @param {number} [zone.influence] - Influence on surrounding roads
		* @param {boolean} [zone.isDestroyable] - Can be destroyed or not
		* @param {boolean} [zone.isInConstruction] - Being built?
	
		// Gross Domestic Income
		* @param {number} [zone.incomeGenerate] - UND to generate per month, influenced by region
		* @param {number} [zone.incomeBoost] - Maximum % boost to nearby influenced businesses
			* if commercial, left as 0
		* @param {number} [zone.incomeLoss] - % loss to monthly income due to poor choices/stances
		
		// Ecological Footprint
		* @param {number} [zone.carbonEmissions] - Number of carbom emmissions per month
		* @param {number} [zone.wasteEmissions] - Number of waste products released per month

		* @param {number} [zone.id] - Region ID number
	*/
	
	constructor({
		height = 1,
		width = 1,
		type = "",
		influence = .5,
		isDestroyable = true,
		isInConstruction = false,
		canGenerateRoad = false,
		
		incomeGenerate = 0,
		incomeBoost = 0,
		incomeLoss = 0,
		
		carbonEmissions = 0,
		wasteEmissions = 0,
		
		id = 0
	} = {}
	) {
		this.height = height;
		this.width = width;
		this.type = type;
		this.influence = influence;
		this.isDestroyable = isDestroyable;
		this.isInConstruction = isInConstruction;
		
		this.incomeGenerate = incomeGenerate;
		this.incomeBoost = incomeBoost;
		this.incomeLoss = incomeLoss;
		
		this.carbonEmissions = carbonEmissions;
		this.wasteEmissions = wasteEmissions;

		if ((id == 0) || (!id)) {
			this.id = Math.floor(Math.random() * 100000)
		} else {
			this.id = id;
		}
	}
	
	canBePlaced(districtPropertyData, x, y) {
		// from bottom left point
		for (let p_y = y;p_y < y + this.height;p_y++) {
			for (let p_x = x;p_x < x + this.width;p_x++) {
				if ((p_x < 0) || (p_y < 0)) {
					return false;
				}	

				if (p_x >= districtPropertyData.length) {
					return false;
				}

				if (p_y >= districtPropertyData[p_x].length) {
					return false;
				}

				if (districtPropertyData[p_x][p_y].type != "") {
					return false;
				}
			}
		}
		
		return true;
	}
	
	placeZone(districtPropertyData, x, y) {
		if (this.canBePlaced(districtPropertyData, x, y)) {
			for (let p_y = y;p_y < y + this.height;p_y++) {
				for (let p_x = x;p_x < x + this.width;p_x++) {
					districtPropertyData[p_x][p_y] = this;
				}
			}
			return districtPropertyData;
		}
		
		return false;
	}

	appendZone(zone) {
		for (const key of Object.keys(Zone.prototype.zoneTypes[zone])) {
			this[key] = Zone.prototype.zoneTypes[zone][key];
		}
	}
}

Zone.prototype.zoneTypes = {
	neighborhood : {
		height : 2,
		width: 2,
		type : "neighborhood",
		influence : 2,
		isDestroyable : true,
		canGenerateRoad : true,
		
		incomeGenerate : 100,
		incomeBoost : 0.10,

		carbonEmissions : 0.2,
		wasteEmissions : 0.2
	},
	gasStation : {
		type : "gasStation",
		influence : 2,
		
		incomeGenerate : 200,
		incomeBoost : 0,

		carbonEmissions : 0.5,
		wasteEmissions : 0.1
	},
	groceryStore : {
		height: 2,
		width: 2,
		type : "groceryStore",
		influence : 2,
		
		incomeGenerate : 500,
		incomeBoost : 0,

		carbonEmissions : 0.2,
		wasteEmissions : 0.4
	},
	residentialPark : {
		width: 2,
		height: 3,
		type : "residentialPark",
		influence : 2,
		
		incomeGenerate : 20,
		incomeBoost : 0,

		carbonEmissions : 0,
		wasteEmissions : 0.1
	},
	factory : {
		type : "factory",
		influence : 2.5,
		isDestroyable : true,
		
		incomeGenerate : 1000,
		incomeBoost : 0,
		
		carbonEmissions : 0.6,
		wasteEmissions : 0.6
	},
	offices : {
		width: 1,
		height: 2,
		type : "offices",
		influence: 1,
		
		incomeGenerate : 300,
		incomeBoost : 0,
		
		carbonEmissions : 0.3,
		wasteEmissions : 0.3
	},
	commercialStore : {
		width: 2,
		height: 2,
		type : "commercialStore",
		influence: 2,
		
		incomeGenerate : 600,
		incomeBoost : 0,
		
		carbonEmissions : 0.2,
		wasteEmissions : 0.1
	},
	school : {
		width: 3,
		height: 2,
		type : "school",
		influence: 3,
		
		incomeGenerate : 10,
		incomeBoost : 0,
		
		carbonEmissions : 0.3,
		wasteEmissions : 0.3
	}.
	stateRoute : {
		width: 1,
		height: 1,
		type : "stateRoute",
		influence: 6,
	}
}

// Street

class Street {
	/**
		* Creates a new steet
		
		* @param {object} [street] - Optional parameters
		* @param {number} [street.influence] - Influence of street
		* @param {number} [street.roadLanes] - Lanes on road
		* @param {string} [street.type] - Type of street (interstate, road, bike road, etc.)
		
		* @param {boolean} [street.hasSidewalk]
		* @param {boolean} [street.hasInterstate]
		* @param {boolean} [street.hasBusStop]
		* @param {boolean} [street.hasBikeLane]
		
	*/
	
	constructor({
		influence = 0,
		roadLanes = 0,
		type = "",
		
		hasSidewalk = false,
		hasInterstate = false,
		hasBusStop = false,
		hasBikeLane = false
	} = {}
	) {
		this.influence = influence;
		this.roadLanes = roadLanes;
		this.type = type;
		
		this.hasSidewalk = hasSidewalk;
		this.hasInterstate = hasInterstate;
		this.hasBusStop = hasBusStop;
		this.hasBikeLane = hasBikeLane;
	}
}