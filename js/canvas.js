//COLOR CONTRAST THINGY
function getRGB(c) {
  return parseInt(c, 16) || c;
}

function getsRGB(c) {
  return getRGB(c) / 255 <= 0.03928
    ? getRGB(c) / 255 / 12.92
    : Math.pow((getRGB(c) / 255 + 0.055) / 1.055, 2.4);
}

function getLuminance(hexColor) {
  return (
    0.2126 * getsRGB(hexColor.substr(1, 2)) +
    0.7152 * getsRGB(hexColor.substr(3, 2)) +
    0.0722 * getsRGB(hexColor.substr(-2))
  );
}

function getContrast(f, b) {
  const L1 = getLuminance(f);
  const L2 = getLuminance(b);
  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
}

function getTextColor(bgColor) {
  const whiteContrast = getContrast(bgColor, "#ffffff");
  const blackContrast = getContrast(bgColor, "#000000");

  return whiteContrast > blackContrast ? "#ffffff" : "#000000";
}

//CANVAS
const canvas = document.getElementById("gameWorld");
const ctx = canvas.getContext('2d');

canvas.height = 775;
canvas.width = 775;

let canvasPosition = canvas.getBoundingClientRect();
window.addEventListener('resize', function(){
    canvasPosition = canvas.getBoundingClientRect();
});

//global variables
const gameGrid = [];
let gameData;
let dataAquired = false;
let dataDouble = false;
let buildingSet = [];
let buildingIDs = [];

let active = false;

function createGrid(streetPropertyData,mapSize){
    for (let x = 0; x <= gameEnum.mapSizes[mapSize]; x += .5){
        for (let y = (x % 1 != 0) ? (0) : (0.5); y <= gameEnum.mapSizes[mapSize]; y++){
			if (x % 1 != 0) {
                gameGrid.push(new Cell(x-0.5, y, x+0.5,y,streetPropertyData[x][y].influence));
            } else {
                gameGrid.push(new Cell(x, y - 0.5,x,y + 0.5,streetPropertyData[x][y].influence));
            }
        }
   }
}

function handleGameGrid(streetPropertyData){
    for (let i = 0; i< gameGrid.length; i++){
        gameGrid[i].draw();
    } 
}


class InputHandler{
    constructor(){
        this.keys = [];
        window.addEventListener('keydown', e => {
            if(((e.key === 'ArrowDown' || e.key === 's') || (e.key === 'ArrowUp' || e.key === 'w') || (e.key === 'ArrowLeft' || e.key === 'a') || (e.key === 'ArrowRight' || e.key === 'd')) && this.keys.indexOf(e.key) === -1){
                this.keys.push(e.key);
                timer = 2;
            }
        });
        window.addEventListener('keyup', e => {
            if(((e.key === 'ArrowDown' || e.key === 's') || (e.key === 'ArrowUp' || e.key === 'w') || (e.key === 'ArrowLeft' || e.key === 'a') || (e.key === 'ArrowRight' || e.key === 'd') || e.key === 'r' || (e.key === '1' || e.key === '2' || e.key === '3') || e.key === ' ')){
                if(this.keys.indexOf(e.key > -1)){
                    this.keys.splice(this.keys.indexOf(e.key), 1);
                }
            }
        });
    }
}

class Player{
    constructor(){
        this.x = 0;
        this.y = 0;
        this.moved = false;
    }
    update(input){
        if(input.keys.length > 0){
            if((input.keys.indexOf('ArrowDown') > -1) || (input.keys.indexOf('s') > -1)){
                this.y++;
            }
            if((input.keys.indexOf('ArrowUp') > -1)  || (input.keys.indexOf('w') > -1)){
                this.y--;
            }
            if((input.keys.indexOf('ArrowRight') > -1)  || (input.keys.indexOf('d') > -1)){
                this.x++;
            }
            if((input.keys.indexOf('ArrowLeft') > -1)  || (input.keys.indexOf('a') > -1)){
                this.x--;
            }
            this.moved = true;
        }

        if(this.y < 0){this.y = 0;}
        if(this.y > (canvas.height / cellSize) - 1){this.y = (canvas.height / cellSize) - 1;}
        if(this.x < 0){this.x = 0;}
        if(this.x > (canvas.height / cellSize) - 1){this.x = (canvas.width / cellSize) - 1;}
    }
    draw(context){
        context.lineWidth = 7;
        context.strokeStyle = 'red';
        context.strokeRect(this.x * cellSize, this.y * cellSize, cellSize, cellSize);
    }
}


class Cell{
    constructor(x, y, x2, y2, influence){
        this.x = x*cellSize;
        this.x2 = x2 * cellSize;
        this.y = y * cellSize;
        this.y2 = y2 * cellSize;
        this.influence = influence;
    }
    draw(){
        if (this.influence == 0) { 
            return;
		}
		
		ctx.lineWidth = this.influence*3;
        ctx.strokeStyle = 'rgb(30,30,30)';
		ctx.beginPath();
        ctx.moveTo(this.x,this.y);
        ctx.lineTo(this.x2,this.y2);
        ctx.stroke();
    }
}

class Buildings{
    constructor(x, y, color, type, text, width, height, common, income, boost, cost, influence){
        this.x = x * cellSize;
        this.y = y * cellSize;
        this.width = width * cellSize;
        this.height = height * cellSize;
        this.color = color;
        this.type = type;
        this.text = text;
        this.textLength = this.text.length;
        this.playerTouching = false;
        if(common){this.common = common;}else{this.common = "None";}
        if(income){this.income = income;}else{this.income = 0;}
        if(boost){this.boost = boost;}else{this.boost = 0;}
        if(cost){this.cost = cost;}else{this.cost = "None";}
        if(influence){this.influence = influence;}else{this.influence = 0;}

        this.mouseTouchX = this.x + (cellSize / (cellSize / 26));
        this.mouseTouchY = this.y + (cellSize / (cellSize / 26));
    }
    update(context){
        buildingSet.forEach(building => {
            if(player.x >= (building.x / cellSize) && player.x < (building.x + building.width) / cellSize && player.y >= (building.y / cellSize) && player.y < (building.y + building.height) / cellSize){
                text.font = "20px Orbitron";
                text.color = "black";
                text.text = building.common;
                text.text2 = building.income;
                text.text3 = building.boost;
                text.text4 = building.cost;
                text.text5 = building.influence;
    
                float.show = true;
                this.playerTouching = true;
            }
        });

        if(this.playerTouching){this.playerTouching = false;}else{float.show = false;}
    }
    draw(context){
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, this.width, this.height);

        context.fillStyle = getTextColor(this.color); 
        context.font = cellSize + "px Material Symbols Outlined";
        for (let x = this.x / cellSize; x < (this.x/cellSize) + (this.width/cellSize); x++) {
            for (let y = (this.y/cellSize) + 1; y <= (this.y/cellSize) + (this.height/cellSize); y++) {
                context.fillText(this.text, x * cellSize, y * cellSize);
            }
        }
    }
}

class Text{
    constructor(){
        this.x = 25;
        this.y = 45;
        this.color = "black";
        this.text = "";
        this.text2 = "";
        this.text3 = "";
        this.text4 = "";
        this.text5 = ""
    }
    update(){

    }
    draw(context){
        if(float.show){
            context.font = "16px Orbitron";  
            context.fillStyle = this.color;
            context.fillText(this.text, this.x, this.y);
            context.fillText(this.text5, this.x + 207, this.y - 2);

            context.font = "12px Orbitron";
            context.fillText(this.text2, this.x + 48, this.y + 42);
            context.fillText(this.text3, this.x + 56, this.y + 58);
            context.fillText(this.text4, this.x + 79, this.y + 91);
        }
    }
}

class Float{
    constructor(){
        this.x = 0;
        this.y = 0;
        this.width = 819 / 3;
        this.height = 497 / 3;
        this.image = document.getElementById('floatImg');
        this.show = false;
    }
    draw(context){
        if(!player.moved){this.show = false;}
        if(this.show){
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    }
}

let timer = 5;
const input = new InputHandler();
const player = new Player();
const text = new Text();
const float = new Float();

function animate(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if(!gameData.districtPropertyData.length && !dataAquired && !dataDouble){
        gameData = game.getGameData();
    }else if(gameData.districtPropertyData.length && !dataAquired && !dataDouble){
        dataAquired = true;
    }else if(dataAquired){
        cellSize = canvas.width / (gameData.districtPropertyData.length);
        createGrid(gameData.streetPropertyData,gameData.mapSize);
        dataAquired = false;
        dataDouble = true;
    }

	handleGameGrid();
	
    if(dataDouble){
        for(let i = 0; i < buildingSet.length; i++){
            buildingSet[i].update(ctx);
            buildingSet[i].draw(ctx);
        }
        for(let i = 0; i < gameData.districtPropertyData.length; i++){
            for(let j = 0; j < gameData.districtPropertyData[i].length; j++){
                if((!buildingIDs.includes(gameData.districtPropertyData[i][j].id)) && gameData.districtPropertyData[i][j].type !== ""){
                    buildingIDs.push(gameData.districtPropertyData[i][j].id);
                    buildingSet.push(new Buildings(i, j, gameData.districtPropertyData[i][j].color, gameData.districtPropertyData[i][j].type, gameData.districtPropertyData[i][j].text, gameData.districtPropertyData[i][j].width, gameData.districtPropertyData[i][j].height, gameData.districtPropertyData[i][j].common, gameData.districtPropertyData[i][j].incomeGenerate, gameData.districtPropertyData[i][j].incomeBoost, gameData.districtPropertyData[i][j].yearlyCost, gameData.districtPropertyData[i][j].influence));
                }
            }
        }
        if(timer >= 5){
            timer = 0;
        }else{
            timer++;
        }

        if(timer >= 0 && dataDouble){
            if(timer === 3){player.update(input);}
            player.draw(ctx);
        }
		
        float.draw(ctx);
        text.update();
        text.draw(ctx);
    }

    requestAnimationFrame(animate);
}


const canvasThingy = (function() {
    const generateBuilding = function(mapSize) {
		gameData = game.getGameData();
		
		animate();
	}

    return {
        generateBuilding : generateBuilding,
		animate : animate
    }
})();
