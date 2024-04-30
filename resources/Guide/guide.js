let sdgIndex = 0;
let previousSDGIndex = 6;
let sdgList = [3,6,7,9,11,12,13]

function switchMenu(page) {
    for (const e of document.querySelectorAll("content")) {
        if (e.id == page) {
			e.className = "active";
		} else {
			e.className = "";
		}
    }
}

document.querySelector("#openSDGList").addEventListener("click",() => {
	switchMenu("SDGList");
})
document.querySelector("#openProperties").addEventListener("click",() => {
	switchMenu("propertyList");
})
document.querySelector("#openGuide").addEventListener("click",() => {
	switchMenu("guide");
})


setInterval(function() {
	previousSDGIndex = sdgIndex;
	
	if (sdgIndex == sdgList.length - 1) {
		sdgIndex = 0;
	} else {
		sdgIndex++;
	}

	document.querySelectorAll(".SDG" + sdgList[previousSDGIndex])[0].className = "SDG" + sdgList[previousSDGIndex] + " flyOut active";
	document.querySelectorAll(".SDG" + sdgList[sdgIndex])[0].className = "SDG" + sdgList[sdgIndex] + " flyIn active";

	for (const e of document.querySelectorAll(".SDGCircle")) {
		if (parseInt(e.id.split("sdgCircle")[1]) == sdgIndex+1) {
			e.className = "SDGCircle current"
		} else {
			e.className = "SDGCircle"
		}
	}
	
	setTimeout(function() {
		document.querySelectorAll(".SDG" + sdgList[previousSDGIndex])[0].className = "SDG" + sdgList[previousSDGIndex];
		document.querySelectorAll(".SDG" + sdgList[sdgIndex])[0].className = "SDG" + sdgList[sdgIndex] + " active";
	},1000)
	
},10000)