/**
@class 曳引机 
*/
function makeTractionMachine() {
    var ctrl, cab, floorSelector, timer = null;
    var running = false;
    var that = {};
    
    that.isRunning = function() {
        return running;
    } 
    
    that.setCtrl = function() {
        ctrl = arguments[0];
    }
    
    that.setCab = function() {
        cab = arguments[0];
    }
    
    that.setFloorSelector = function() {
        floorSelector = arguments[0];
    }
    
    that.queryNowFloorNum = function() {
        return (cab.curDir == DIR_UP ? Math.floor : Math.ceil)((10 * 50 - cab.position.y) / 50);
    }
    
    that.makeCabUp = function() {
        makeCabMove(DIR_UP);
    }
    that.makeCabDown = function() {
        makeCabMove(DIR_DOWN);
    }
    that.makeCabMove = makeCabMove;
    that.stop = function() {
        running = false;
        clearInterval(timer);
    }
    
    function makeCabMove(dir) {
        assert(!running, "makeCabMove error");
        running = true;
        cab.curDir = dir;
        var v = dir === DIR_UP ? -1 : +1;
        var lastFloorNum = that.queryNowFloorNum();
        timer = setInterval(function() {
            // 楼层检测
            if(that.queryNowFloorNum() != lastFloorNum) {
                lastFloorNum = that.queryNowFloorNum();
                ctrl.onNewFloor(lastFloorNum);
                floorSelector.inputCabCurFloorNum(lastFloorNum);
            }
            // 改变电梯桥厢位置
            cab.position = cab.position.add(new Vector2(0, v));
            cab.draw();
        }, 10);
    }
    return that;
}

