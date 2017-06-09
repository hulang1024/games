/**
@class 楼层电梯入口处操作面板-单按钮式
*/
function makeSingleButtonFloorCallUI(floorNum, dir) {
    var button;

    var that = new FloorCallUI(floorNum);
    
    that.inputKeyState = function(keyCode, keyState) {
        that.keyMap[1] = keyState;
        var c = keyState ? "blue" : "";
        button.style.backgroundColor = c;
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

        button = document.createElement("button");
        button.innerHTML = "○";
        button.onclick = function() {
            if(that.keyMap[dir])
                return;
            that.ctrl.call(floorNum, dir);
        }
        div.appendChild(button);

        document.body.appendChild(div);
    }
    
    return that;
}
