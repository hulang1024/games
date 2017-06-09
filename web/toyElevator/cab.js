/**
@class 轿厢,电梯盒子
*/
function makeCab() {
    var floorSelector;
	var that = {};
    
    that.units = [];//电梯中的单位,人或物体
    that.door = null;
    that.curDir = DIR_NONE;
	that.position = new Vector2(390, 50 * 10 - 50);
    
    that.setDoor = function() {
        that.door = arguments[0];
    }
    that.setFloorSelector = function() {
        floorSelector = arguments[0];
    }
    
    that.inUnit = function() {
        that.units.push(1);
        floorSelector.div.style.display = "block";
    }
    that.outUnit = function() {
        that.units.pop();
        floorSelector.div.style.display = that.units.length > 0 ? "block" : "none";
    }
    
    that.draw = function() {
        that.div.style.left = that.position.x + "px";
        that.div.style.top = that.position.y + "px";
    }
    
    var div = that.div = document.createElement("div");
    div.style.position = "absolute";
    div.style.left = that.position.x + "px";
    div.style.top = that.position.y + "px";
    div.style.width = 50 + "px";
    div.style.height = 50 + "px";
    div.style.fontSize = "13px";
    div.style.color = "gray";
    div.style.backgroundColor = "black";
    div.style.border = "1px solid black";
    document.body.append(div);
    
	return that;
}
