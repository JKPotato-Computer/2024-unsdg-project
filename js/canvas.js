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

//global variables
const gameGrid = [];
let cellSize = canvas.width/11;
let buildingSet = [];
let buildingIDs = [];

//mouse
const mouse = {
    x: 0,
    y: 0,
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
let canvasPosition = canvas.getBoundingClientRect();
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
        for (let x = 0; x < canvas.width; x += cellSize){
            gameGrid.push(new Cell(x, y));
        }
   }
}

function handleGameGrid(){
    for (let i = 0; i< gameGrid.length; i++){
        gameGrid[i].draw();
    } 
}

class Cell{
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = cellSize;
        this.height = cellSize;
    }
    draw(){
        ctx.lineWidth = 0;
        ctx.strokeStyle = 'black';
        ctx.strokeRect(this.x, this.y, this.width, this.height);
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
    }

    update(){

    }
    draw(){
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.fillStyle = getTextColor(this.color); 
        ctx.font = cellSize + "px Material Symbols Outlined";
        for (let x = this.x/cellSize;x < (this.x/cellSize) + (this.width/cellSize);x++) {
            for (let y = (this.y/cellSize)+1;y <= (this.y/cellSize) + (this.height/cellSize);y++) {
                ctx.fillText(this.text, x*cellSize, y*cellSize);
            }
        }
    }
}

function animate(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    handleGameGrid();
    for(let i = 0; i < buildingSet.length; i++){
        buildingSet[i].draw();
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

window.addEventListener('resize', function(){
    canvasPosition = canvas.getBoundingClientRect();
});

const canvasThingy = (function() {
    const generateBuildingthitruifghoird = function() {
        let gameData = game.getGameData();
        cellSize = canvas.width / (gameData.districtPropertyData.length);

        while (gameGrid.length != 0) {
            gameGrid.pop();
        }

        createGrid();
        handleGameGrid();

        for(let i = 0; i < gameData.districtPropertyData.length; i++){
            for(let j = 0; j < gameData.districtPropertyData[i].length; j++){
                if((!buildingIDs.includes(gameData.districtPropertyData[i][j].id)) && gameData.districtPropertyData[i][j].type !== ""){
                    buildingIDs.push(gameData.districtPropertyData[i][j].id);
                    let building = new Buildings(i, j, gameData.districtPropertyData[i][j].color, gameData.districtPropertyData[i][j].type, gameData.districtPropertyData[i][j].text, gameData.districtPropertyData[i][j].width, gameData.districtPropertyData[i][j].height);
                    buildingSet.push(building);
                }
            }
        }
    }

    return {
        generateBuildingthitruifghoird : generateBuildingthitruifghoird
    }
})();