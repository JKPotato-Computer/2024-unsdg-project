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
			commercialStore : 1,
			policeStation: 1
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
			offices: 3,
			policeStation: 1
		},
		
		city : {
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
			gasStation : 6,
			policeStation: 2
		}
	}
	
	const mapSizes = {
		village : 11,
		town: 21,
		city : 41
	}
	
	const gameSpeed = {
		"pause": 0,
		"normalSpeed": 1,
		"fastSpeed": 3
	}
	
	const baseConfig = {
		village: {
			budget : 20000,
			yearlyDue : 5000
		},
		town: {
			budget : 200000,
			yearlyDue : 20000
		},
		city: {
			budget : 20000,
			yearlyDue : 400000
		},
		
	}
	
	return {
		baseProperties : baseProperties,
		mapSizes : mapSizes,
		gameSpeed : gameSpeed,
		baseConfig : baseConfig
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
		* @param {boolean} [zone.canGenerateRoad] - Can generate road?
		* @param {boolean} [zone.isCommercial] - Is Commercial	
		
		// Gross Domestic Income
		* @param {number} [zone.incomeGenerate] - UND to generate per month, influenced by region
		* @param {number} [zone.incomeBoost] - Maximum % boost to nearby influenced businesses
			* if commercial, left as 0
		* @param {number} [zone.incomeLoss] - % loss to monthly income due to poor choices/stances
		* @param {[number]} [zone.boostingID] - Businesses to boost income of
		
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
		isDestroyable = false,
		isInConstruction = false,
		canGenerateRoad = false,
		isCommercial = true,
		
		incomeGenerate = 0,
		incomeBoost = 0,
		incomeLoss = 0,
		boostingID = [],
		
		carbonEmissions = 0,
		wasteEmissions = 0,
		
		id = 0,
	} = {}
	) {
		this.height = height;
		this.width = width;
		this.type = type;
		this.influence = influence;
		this.isDestroyable = isDestroyable;
		this.isInConstruction = isInConstruction;
		this.isCommercial = isCommercial;
		this.canGenerateRoad = canGenerateRoad;
		
		this.incomeGenerate = incomeGenerate;
		this.incomeBoost = incomeBoost;
		this.incomeLoss = incomeLoss;
		this.boostingID = boostingID;
		
		this.carbonEmissions = carbonEmissions;
		this.wasteEmissions = wasteEmissions;

		if ((id == 0) || (!id)) {
			this.id = Math.floor(Math.random() * 10000000)
		} else {
			this.id = id;
		}
	}

	getZoneByXY(districtPropertyData, x, y) {
		if ((x < 0) || (y < 0) || (x > districtPropertyData.length) || (y > districtPropertyData.length)) {
			return false;
		}

		return (districtPropertyData[x][y].type == "") ? false : districtPropertyData[x][y];
	}
	
	getZoneByID(districtPropertyData, id) {
		let [zoneX,zoneY] = this.getCornerIdentifierOfZone(districtPropertyData, id);
		if ((zoneX == -1) || (zoneY == -1)) {
			return false;
		} else {
			return this.getZoneByXY(districtPropertyData, zoneX, zoneY);
		}
	}
	
	getCornerIdentifierOfZone(districtPropertyData,id) {
		let propertyCornerX,propertyCornerY;
		for (let x = 0;x < districtPropertyData.length;x++) {
			for (let y = 0;y < districtPropertyData.length;y++) {
				if ((districtPropertyData[x][y].id == (id || this.id))) {
					propertyCornerX = x;
					propertyCornerY = y;
					return [x,y];
				}
			}
		}

		return [-1,-1];
	}
	
	getRelativeLocationOfZone(districtPropertyData, zoneX, zoneY) {
		let [propertyCornerX, propertyCornerY] = this.getCornerIdentifierOfZone(districtPropertyData);
		if ((propertyCornerY - 1 < zoneY) && (propertyCornerY + this.height > zoneY)) {
			if (propertyCornerX + this.width <= zoneX) {
				return "E";
			} else {
				return "W";
			}
		} else {
			if (propertyCornerY + this.height <= zoneY) {
				return "N";
			} else {
				return "S";
			}
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

	
	detectNearbyBusiness(districtPropertyData) {
		// Locaate a valid id
		let [propertyCornerX,propertyCornerY] = this.getCornerIdentifierOfZone(districtPropertyData);
		

		for (let l = 1;l < ((this.influence / .5) + 1);l++) {
			let xOppOffset = propertyCornerX + (this.width - 1) + l;
			let yOppOffset = propertyCornerY + (this.height - 1) + l;

			for (let x = propertyCornerX - 1;x < propertyCornerX + (this.width + 1);x++) {
				if ((x < 0) || (x > districtPropertyData.length - 1)) {
					continue;
				}

				if ((propertyCornerY - l < 0) || (propertyCornerY - l> districtPropertyData.length - 1)) { 
					continue;
				}

				let property = districtPropertyData[x][propertyCornerY - l];

				if (!property) {
					continue;
				}

				if ((property.type != "") && (property.isCommercial)) {
					return [x,propertyCornerY - l,l];
				}
			}

			for (let y = propertyCornerY - 1;y < propertyCornerY + (this.height + 1);y++) {
				if ((y < 0) || (y > districtPropertyData.length - 1)) {
					continue;
				}

				if ((xOppOffset < 0) || (xOppOffset > districtPropertyData.length - 1)) { 
					continue;
				}

				let property = districtPropertyData[xOppOffset][y];

				if (!property) {
					continue;
				}

				if ((property.type != "") && (property.isCommercial)) {
					return [xOppOffset,y,l];
				}
			}

			for (let x = propertyCornerX - 1;x < propertyCornerX + (this.width + 1);x++) {
				if ((x < 0) || (x > districtPropertyData.length - 1)) {
					continue;
				}

				if ((yOppOffset < 0) || (yOppOffset > districtPropertyData.length - 1)) { 
					continue;
				}

				let property = districtPropertyData[x][yOppOffset];

				if (!property) {
					continue;
				}

				if ((property.type != "") && (property.isCommercial)) {
					return [x,yOppOffset,l];
				}
			}
			
			for (let y = propertyCornerY - 1;y < propertyCornerY + (this.height + 1);y++) {
				if ((y < 0) || (y > districtPropertyData.length - 1)) {
					continue;
				}

				if ((propertyCornerX - l < 0) || (propertyCornerX - l > districtPropertyData.length - 1)) { 
					continue;
				}

				let property = districtPropertyData[propertyCornerX - l][y];

				if (!property) {
					continue;
				}

				if ((property.type != "") && (property.isCommercial)) {
					return [propertyCornerX - l,y,l];
				}
			}
		}

		return [-1,-1];
	}

	pathfindStreet(districtPropertyData, streetPropertyData) {
		let [x,y, spaces] = this.detectNearbyBusiness(districtPropertyData);

		if ((x == -1) || (y == -1)) {
			console.log("No location.");
			return false;
		}
		
		this.boostingID.push(this.getZoneByXY(districtPropertyData, x,y).id);
		
		let relativeDirection = this.getRelativeLocationOfZone(districtPropertyData, x, y);
		let [cornerX, cornerY] = this.getCornerIdentifierOfZone(districtPropertyData);
		
		let baseStreet = new Street();
		baseStreet.type = "road";
		baseStreet.roadLanes = 1;
		baseStreet.influence = this.influence;

		console.log("Base Location:",this.type,this.getCornerIdentifierOfZone(districtPropertyData));
		console.log("Destination:",this.getZoneByXY(districtPropertyData,x,y).type,x,y,relativeDirection);
		
		let destX,destY;
		switch (relativeDirection) {
			case "N":
				[destX,destY] = baseStreet.getStreetByZoneDirection(districtPropertyData, this, x, y, "E");
				baseStreet.drawStreet(streetPropertyData,destX,destY - spaces,relativeDirection, spaces, this.influence);
				break;
			case "E":
				[destX,destY] = baseStreet.getStreetByZoneDirection(districtPropertyData, this, x, y, "N");
				baseStreet.drawStreet(streetPropertyData,destX - spaces,destY,relativeDirection, spaces, this.influence);
				break;
			case "S":
				[destX,destY] = baseStreet.getStreetByZoneDirection(districtPropertyData, this, x, y, "W");
				baseStreet.drawStreet(streetPropertyData,destX,destY + spaces,relativeDirection, spaces, this.influence);
				break;
			case "W":
				[destX,destY] = baseStreet.getStreetByZoneDirection(districtPropertyData, this, x, y, "S");
				baseStreet.drawStreet(streetPropertyData,destX + spaces,destY,relativeDirection, spaces, this.influence);
				break;
		}
		console.log("Street Destination:",destX,destY)
		
		return streetPropertyData;
	}
}

Zone.prototype.zoneCoding = {
	neighborhood: {
		hex : "", // hex string w/o #
		icon : "" // use google fonts name
	}
}

Zone.prototype.zoneTypes = {
	neighborhood : {
		height : 2,
		width: 2,
		type : "neighborhood",
		color: "#183A37",
		influence : 2,
		isDestroyable : true,
		canGenerateRoad : true,
		isCommercial : false,
		
		incomeGenerate : 100,
		incomeBoost : 0.50,

		carbonEmissions : 0.2,
		wasteEmissions : 0.2
	},
	gasStation : {
		height: 1,
		width: 1,
		type : "gasStation",
		color: "#04151F",
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
		color : "#70AB89",
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
		color : "#4A4063",
		influence : 2,
		isCommercial : false,
		
		incomeGenerate : 20,
		incomeBoost : 0,

		carbonEmissions : 0,
		wasteEmissions : 0.1
	},
	factory : {
		type : "factory",
		color : "#4F1271",
		influence : 4.5,
		isDestroyable : true,
		canGenerateRoad : true,
		isCommercial : false, // to prevent connection,
		pollutionZone: 2,
		
		incomeGenerate : 2500,
		incomeBoost : 0,
		yearlyCost: 2000,
		
		carbonEmissions : 0.6,
		wasteEmissions : 0.6
	},
	offices : {
		width: 1,
		height: 2,
		type : "offices",
		color : "#0A3200",
		influence: 1,
		
		incomeGenerate : 300,
		incomeBoost : 0,
		
		carbonEmissions : 0.3,
		wasteEmissions : 0.3,
	},
	commercialStore : {
		width: 2,
		height: 2,
		type : "commercialStore",
		color : "#E89005",
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
		color : "#FFFFB3",
		influence: 3,
		
		incomeGenerate : 10,
		incomeBoost : 0,
		
		carbonEmissions : 0.3,
		wasteEmissions : 0.3
	},
	stateRoute : {
		type : "stateRoute",
		color : "#8F9593",
		influence: 6,

		incomeGenerate : 50,
		carbonEmissions : 0.1,
	},
	cbd : {
		type : "cbd",
		color : "#191716",
		influence: 6,

		incomeGenerate : 1000,
		incomeBoost : 10,
	},
	commercialMall : {
		height: 4,
		width: 2,
		influence: 3,
		type : "commercialMall",
		color : "#3D348B",
		incomeGenerate: 2000,
		
		wasteEmissions: 0.3,
		carbonEmissions: 0.3
	},
	fastFoodChain : {
		influence: 3,
		type : "fastFoodChain",
		color : "#813405",
		incomeGenerate : 600,
		
		wasteEmissions : 0.2,
		carbonEmissions : 0.2
	},
	restaurant: {
		influence: 2,
		type : "restaurant",
		color : "#4A051C",
		incomeGenerate : 800,
		
		wasteEmissions: 0.5,
		carbonEmissions : 0.1
	},
	apartment: {
		influence: 3,
		type : "apartment",
		color : "#854798",
		height: 4,
		width: 4,
		canGenerateRoad: true,
		isCommercial : false,
		isDestroyable : true,
		type: "apartment",
		
		incomeGenerate: 300,
		incomeBoost: 1,
		
		wasteEmissions: 0.4,
		carbonEmissions: 0.3
	},
	policeStation: {
		influence: 2,
		type: "policeStation",
		color: "##0000c2",
		height: 1,
		width: 2,
		canGenerateRoad : false,
		isCommercial: false,
		isDestroyable: false,
		
		incomeGenerate: 200,
		incomeBoost: 0,
		
		wasteEmissions: 0.2,
		carbonEmissions: 0.2
	},
	brt: {
		influence: 2,
		type: "brt",
		color: "#eaffcf",
		height: 1,
		width: 1,
		
		canGenerateRoad: false,
		isCommercial: true,
		isDestroyable: false,
		isElectric: false,
		
		incomeGenerate: 600,
		incomeBoost: 0,
		yearlyCost: 3000,
		
		wasteEmissions: 0,
		carbonEmissions:  0.4
	},
	highTechFactory : {
		influence: 6,
		type: "highTechFactory",
		color: "#cc7727",
		
		canGenerateRoad: true,
		isCommercial: true,
		isDestroyable: false,
		
		incomeGenerate: 5000,
		yearlyCost: 20000,
		
		wasteEmissions: 0.2,
		carbonEmissions: 0
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
	
	drawStreet(streetPropertyData, x1, y1, direction, spaces, maxInfluence) {
		let influence = maxInfluence;
		console.log("drawStreet Parameters:",x1, y1, direction, spaces, influence)
		switch (direction) {
			case "N":
				for (let y = y1;y < y1 + spaces;y++) {
					let street = this;
					this.influence = influence;
					streetPropertyData[x1][y] = street;
					influence -= 0.5;
					console.log(direction,"New Influence:",influence,"// Location:",x1, y);
				}
				break;
			case "E":
				for (let x = x1;x < x1 + spaces;x++) {
					let street = this;
					this.influence = influence;
					streetPropertyData[x][y1] = street;
					influence -= 0.5;
					console.log(direction,"New Influence:",influence,"// Location:",x, y1);
				}
				break;
			case "S":
				for (let y = y1;y >= y1 - spaces;y--) {
					let street = this;
					this.influence = influence;
					streetPropertyData[x1][y] = street;
					influence -= 0.5;
					console.log(direction,"New Influence:",influence,"// Location:",x1, y);
				}
				break;
			case "W":
				for (let x = x1;x >= x1 - spaces;x--) {
					let street = this;
					this.influence = influence;
					streetPropertyData[x][y1] = street;
					influence -= 0.5;
					console.log(direction,"New Influence:",influence,"// Location:",x, y1);
				}
				break;
		}
		
		return streetPropertyData;
	}
	
	getStreetByZoneDirection(districtPropertyData, zone, zoneX, zoneY, direction) {
		let property = districtPropertyData[zoneX][zoneY];
		console.log("getStreetByZoneDirection Parameters:",zoneX,zoneY,direction);
		switch (direction) {
			case "N":
				for (let y = zoneY;y < districtPropertyData.length - 1;y++) {
					if (districtPropertyData[zoneX][y] != zone) {
						return [zoneX + .5,y+1];
					}
				}
				return [zoneX + .5,districtPropertyData.length];
			case "E":
				for (let x = zoneX;x < districtPropertyData.length - 1;x++) {
					if (districtPropertyData[x][zoneY] != zone) {
						return [x+1,zoneY + .5];
					}
				}
				return [districtPropertyData.length,zoneY + .5];
			case "S":
				for (let y = zoneY;y >= 0;y--) {
					if (districtPropertyData[zoneX][y] != zone) {
						return [zoneX + .5,y+1];
					}
				}
				return [zoneX + .5,districtPropertyData.length];
			case "W":
				for (let x = zoneX;x >= 0;x--) {
					if (districtPropertyData[x][zoneY] != zone) {
						return [x+1,zoneY + .5];
					}
				}
				return [districtPropertyData.length,zoneY + .5];
		}
	}
}

// SDG

class SDG {
	
	constructor({
		id = 0,
		requirements = {},
		progress = 0
	} = {}
	) {
		
	}
}

SDG.prototype.SDGList = {
	6 : {
		accessWater : 0,
		
	}
}

SDG.prototype.actionCardList = {
	"Add BRT Service" : {
		cost : 50000,
		oneTime : true,
		description : "Create a new Bus Rapid Tranist service for nearby residents.",
		requires : "None",
		type : "transportation",
		icon: "directions_bus"
	},
	"Add Bus Stop" : {
		cost : 2000,
		oneTime : false,
		description : "Generate a bus stop on a random street!",
		required : "BRT Service",
		type : "transportation",
		icon: "hail"
	},
	"Convert BRT to Electric" : {
		cost : 20000,
		oneTime : true,
		description : "Upgrade the existing service to an electric service.",
		requires : "BRT Service, 3 Bus Stops",
		type : "transportation",
		icon : "bolt"
	},
	"Add Electric Bus Stops" : {
		cost : 4000,
		oneTime : false,
		description : "Generate a bus stop on a random street, now with ELECTRICITY!",
		required : "Electric BRT Service",
		type : "transportation",
		icon : "electrical_services"
	},
	"Improve Water Pipeline" : {
		cost : 3000,
		oneTime : true,
		description : "Improve the existing water pipeline system for ALL residents.",
		requires : "None",
		type : "water",
		icon : "valve"
	},
	"Build Water Stations" : {
		cost : 10000,
		oneTime : false,
		description : "Create 4 water stations around the place (MAX 2)",
		required : "Improve Water Pipeline",
		type : "water",
		icon : "water_drop"
	},
	"Build Restrooms" : {
		cost : 2000,
		oneTime : false,
		description : "Creates 2 restrooms nearby some residential and commercial zones.",
		requires : "Improve Water Pipeline",
		type : "water",
		icon : "wc"
	},
	"Improve Filtration System" : {
		cost : 20000,
		oneTime : false,
		description : "Improves the filtration system for ALL residents (Warning: 50% to work/break per year).",
		required : "None",
		type : "water",
		icon: "filter_alt"
	},
	"Affordable Energy Act" : {
		cost : 0,
		oneTime : true,
		description : "Implement bill to reduce energy costs and allow access to more people.",
		requires : "None",
		type : "acts",
		icon: "bookmark"
	},
	"Sustainable Energy Act" : {
		cost : 500,
		oneTime : true,
		description : "Implements sustainable energy changes and helps reduce pollution (Warning: Costs 500 UNd per year)",
		required : "None",
		type : "acts",
		icon: "solar_power"
	},
	"Create Low-Tech Factory" : {
		cost : 0,
		oneTime : false,
		description : "Create a new basic factory that generates 2500 UND per month.",
		requires : "None",
		type : "manufacturing",
		icon: "factory"
	},
	"Create High-Tech Factory" : {
		cost : 2000,
		oneTime : false,
		description : "Create a new high-tech and more sustainable factory for 5000 UND per month!",
		required : "Affordable Energy Act",
		type : "manufacturing",
		icon: "conveyor_belt"
	},
	"Add Recycling Center" : {
		cost : 20000,
		oneTime : true,
		description : "Create a recycling center at a random location.",
		requires : "None",
		type : "manufacturing",
		icon : "recycling"
	},
	"Add Police Officers" : {
		cost : 100,
		oneTime : false,
		description : "HIRE a police offer (we're not making anyone) to reduce crime rate!",
		required : "None",
		type : "social",
		icon: "local_police"
	},
	"Love All" : {
		cost : 0,
		oneTime : true,
		description : "Encourage peace with one another through flyers.",
		requires : "None",
		type : "social",
		icon: "favorite"
	},
	"Shopping Spree" : {
		cost : 10000,
		oneTime : true,
		description : "Everything is on sale! All businesses/factories generate 2x the income for one year, but generate a quarter of the income next year.",
		required : "None",
		type : "social",
		icon: "shopping_cart"
	},
	"Emergency Funding" : {
		cost : 0,
		oneTime : true,
		description : "Need quick money? We have 20000 UND for you!",
		requires : "None",
		type : "social",
		icon: "medical_services"
	},
}