/**
@class 楼层电梯入口处操作面板-标准式
*/
function makeNormalFloorCallUI(floorNum) {
    var btnArrowUp, btnArrowDown;

    var that = new FloorCallUI(floorNum);// 实现FloorCallUI
    
    that.inputKeyState = function(keyCode, keyState) {
        that.keyMap[keyCode] = keyState;
        var c = keyState ? "blue" : "";
        switch(keyCode) {
        case DIR_DOWN:
            btnArrowDown.style.backgroundColor = c;
            break;
        case DIR_UP:
            btnArrowUp.style.backgroundColor = c;
            break;
        }
    }
    
    load();

    function load() {
        var div = document.createElement("div");
        div.style.position = "absolute";
        div.style.top = (50 * 10) - (50 * floorNum) + "px";
        div.style.left = 450 + "px";
        div.style.width = 100 + "px";
        div.style.height = 50 + "px";
        div.style.border = "1px solid black";
        
        var span = document.createElement("span");
        span.innerHTML = (floorNum < 10 ? "0" + floorNum : floorNum) + "L";
        div.appendChild(span);
        
        btnArrowUp = document.createElement("button");
        btnArrowUp.innerHTML = "↑";
        btnArrowUp.onclick = function() {
            if(that.keyMap[DIR_UP])
                return;
            that.ctrl.call(floorNum, DIR_UP);
        }
        div.appendChild(btnArrowUp);
        
        btnArrowDown = document.createElement("button");
        btnArrowDown.innerHTML = "↓";
        btnArrowDown.onclick = function() {
            if(that.keyMap[DIR_DOWN])
                return;
            that.ctrl.call(floorNum, DIR_DOWN);
        }
        div.appendChild(btnArrowDown);
        
        document.body.appendChild(div);
    }
    
    return that;
}
