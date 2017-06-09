
/**
@class 楼层选择器
*/
function makeFloorSelector() {
    var btnNums = [], divNumDisplay;
    var ctrl, cab;
    var that = {};
    
    that.setCab = function() {
        cab = arguments[0];
    }
    that.setCtrl = function() {
        ctrl = arguments[0];
    }
    
    that.inputCabCurFloorNum = function(num) {
        divNumDisplay.innerHTML = (cab.curDir == DIR_UP ? "↑" : "↓") + " " + num;
    }
    
    that.inputKeyState = function(keyCode, keyState) {
        btnNums[keyCode].style.backgroundColor = keyState ? "blue" : "";
    }

    load();
    
    function load() {
        var div = that.div = document.createElement("div");
        div.style.position = "absolute";
        div.style.left = 300 + "px";
        div.style.top = 10 + "px";
        div.style.width = 60 + "px";
        div.style.height = 240 + "px";
        div.style.border = "1px solid black";
        div.style.display = "none";
        
        divNumDisplay = document.createElement("div");
        divNumDisplay.style.width = 58 + "px";
        divNumDisplay.style.height = 30 + "px";
        divNumDisplay.style.border = "1px solid black";
        divNumDisplay.style.color = "blue";
        divNumDisplay.style.fontFamily = "'lcd','Arial Black',sans-serif";
        divNumDisplay.style.textAlign = "center";
        divNumDisplay.style.lineHeight = 30 + "px";
        
        div.appendChild(divNumDisplay);
        
        for(var num = 10; num >= 1; num--) {
            var btnNum = btnNums[num] = document.createElement("button");
            btnNum.innerHTML = num < 10 ? " " + num : num;
            btnNum.num = num;
            btnNum.onclick = function() {
                var state = ctrl.selectFloor(this.num);
                that.inputKeyState(this.num, state);
            }
            div.append(btnNum);
        }
        
        var btnOpenDoor = document.createElement("button");
        btnOpenDoor.innerHTML = "←→";
        btnOpenDoor.onclick = function() {
            if(cab.door.isOpen())
                return;
            cab.door.open();
        }
        div.append(btnOpenDoor);
        
        var btnCloseDoor = document.createElement("button");
        btnCloseDoor.innerHTML = "→←";
        btnCloseDoor.onclick = function() {
            if(!cab.door.isOpen())
                return;
            cab.door.close();
        }
        
        div.append(btnCloseDoor);
        
        document.body.append(div);
    }
    
    return that;
}
