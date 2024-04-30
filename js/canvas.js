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
let gameData = game.getGameData();
let dataAquired = false;
let dataDouble = false;
let buildingSet = [];
let buildingIDs = [];

//mouse
const mouse = {
    x: 10,
    y: 10,
    width: 0.1,
    height: 0.1,
    clicked: false
}
canvas.addEventListener('mousedown', function(){
    mouse.clicked = true;
});
canvas.addEventListener('mouseup', function(){
    mouse.clicked = false;
});
canvas.addEventListener('mousemove', function(e){
    mouse.x = e.x - canvasPosition.left;
    mouse.y = e.y - canvasPosition.top;
});
canvas.addEventListener('mouseleave', function(){
    mouse.x = undefined;
    mouse.y = undefined;
});

function createGrid(){
    for (let y = 0; y < canvas.height; y += cellSize){
        for(let x = 0; x < canvas.width; x += cellSize){
            gameGrid.push(new Cell(x, y));
        }
   }
}

class InputHandler{
    constructor(){
        this.keys = [];
        window.addEventListener('keydown', e => {
            if(((e.key === 'ArrowDown') || (e.key === 'ArrowUp') || (e.key === 'ArrowLeft') || (e.key === 'ArrowRight')) && this.keys.indexOf(e.key) === -1){
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
    }
    update(input){
        if(input.keys.length > 0){
            if(input.keys.indexOf('ArrowDown') > -1){
                this.y++;
            }
            if(input.keys.indexOf('ArrowUp') > -1){
                this.y--;
            }
            if(input.keys.indexOf('ArrowRight') > -1){
                this.x++;
            }
            if(input.keys.indexOf('ArrowLeft') > -1){
                this.x--;
            }
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

function handleGameGrid(){
    for (let i = 0; i < gameGrid.length; i++){
        gameGrid[i].draw(ctx);
    }
}

class Cell{
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = cellSize;
        this.height = cellSize;
    }
    draw(context){
        context.lineWidth = 1;
        context.strokeStyle = 'black';
        context.strokeRect(this.x, this.y, this.width, this.height);
    }
}

class Buildings{
    constructor(x, y, color, type, text, width, height){
        this.x = x * cellSize;
        this.y = y * cellSize;
        this.width = width * cellSize;
        this.height = height * cellSize;
        this.color = color;
        this.type = type;
        this.text = text;
        this.textLength = this.text.length;

        this.mouseTouchX = this.x + (cellSize / (cellSize / 26));
        this.mouseTouchY = this.y + (cellSize / (cellSize / 26));
    }
    update(){
        if(player.x >= (this.x / cellSize) && player.x < (this.x + this.width) / cellSize && player.y >= (this.y / cellSize) && player.y < (this.y + this.height) / cellSize){
            console.log(this.type);
        }
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

let timer = 5;
const input = new InputHandler();
const player = new Player();

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
        createGrid();
        dataAquired = false;
        dataDouble = true;
    }
    handleGameGrid();

    if(dataDouble){
        for(let i = 0; i < buildingSet.length; i++){
            buildingSet[i].update();
            buildingSet[i].draw(ctx);
        }
        for(let i = 0; i < gameData.districtPropertyData.length; i++){
            for(let j = 0; j < gameData.districtPropertyData[i].length; j++){
                if((!buildingIDs.includes(gameData.districtPropertyData[i][j].id)) && gameData.districtPropertyData[i][j].type !== ""){
                    buildingIDs.push(gameData.districtPropertyData[i][j].id);
                    buildingSet.push(new Buildings(i, j, gameData.districtPropertyData[i][j].color, gameData.districtPropertyData[i][j].type, gameData.districtPropertyData[i][j].text, gameData.districtPropertyData[i][j].width, gameData.districtPropertyData[i][j].height));
                }
            }
        }
        if(timer >= 5){
            timer = 0;
        }else{
            timer++;
        }
    }

    if(timer >= 0 && dataDouble){
        if(timer === 3){player.update(input);}
        player.draw(ctx);
    }

    requestAnimationFrame(animate);
}
animate();

function collision(first, second){
    if (    !(  first.x > second.x + second.width || 
                first.x + first.width < second.x ||
                first.y > second.y + second.height ||
                first.y + first.height < second.y)
    ) {
        return true;
    };
};
