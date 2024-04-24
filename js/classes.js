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

		this.id = id;
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
		}
		
		return districtPropertyData;
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
		isDestroyable : true,
		
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
		isDestroyable : true,
		
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
		isDestroyable : true,
		
		incomeGenerate : 20,
		incomeBoost : 0,

		carbonEmissions : 0,
		wasteEmissions : 0.1
	},
}