
function makeMainController() {
    var tm, cab, floorSelector;
    var calls = {};
    var floorSelections = {};
    var floorUIs = {};
    var that = {};
    
    that.setTractionMachine = function() {
        tm = arguments[0];
    }
    that.setCab = function() {
        cab = arguments[0];
    }
    that.setFloorUI = function(floorUI) {
        floorUIs[floorUI.floorNum] = floorUI;
    }
    that.setFloorSelector = function() {
        floorSelector = arguments[0];
    }

    /* 处理电梯呼叫 */
    that.call = function(floorNum, callDir) {
        if(tm.isRunning()) {
            calls[floorNum] = callDir;
            floorUIs[floorNum].inputKeyState(callDir, true);
        } else if(!hasCurDirTargetFloor()) {
            if(floorNum == tm.queryNowFloorNum()) {
                if(!cab.door.isOpen()) {
                    cab.door.open();
                }
            }
            calls[floorNum] = callDir;
            floorUIs[floorNum].inputKeyState(callDir, true);
            if(!cab.door.isOpen()) {
                var runDir = chooseRunDir(floorNum);
                runDir != DIR_NONE && tm.makeCabMove(runDir);
            }
        }
    }
    
    /* 处理选择楼层请求 */
    that.selectFloor = function(floorNum) {
        if(floorSelections[floorNum])
            return true;
        var ok;
        if(tm.isRunning()) {
            switch(cab.curDir) {
            case DIR_NONE:
                if(floorNum != tm.queryNowFloorNum())
                    ok = true;
                break;
            case DIR_UP:
                if(floorNum > tm.queryNowFloorNum())
                    ok = true;
                break;
            case DIR_DOWN:
                if(floorNum < tm.queryNowFloorNum())
                    ok = true;
                break;
            }
            if(ok) {
                floorSelections[floorNum] = 1;
                return true;
            }
        } else {
            if(floorNum == tm.queryNowFloorNum())
                return false;
            floorSelections[floorNum] = 1;
            if(!cab.door.isOpen()) {
                var dir = chooseRunDir(floorNum);
                dir != DIR_NONE && tm.makeCabMove(DIR_DOWN);
            }
            return true;
        }

        return false;
        
    }
    
    /* 处理到达新楼层 */
    that.onNewFloor = function() {
        var floorNum = tm.queryNowFloorNum();
        if(floorSelections[floorNum] || calls[floorNum]) {
            delete calls[floorNum];
            delete floorSelections[floorNum];
            tm.stop();
            cab.door.open();
        }
    }
    
    /* 桥厢门状态改变时处理 */
    that.onDoorChanged = function() {
        var floorNum = tm.queryNowFloorNum();
        if(!cab.door.isOpen()) {
            if(hasCurDirTargetFloor(floorNum))
                tm.makeCabMove(cab.curDir);
            else if(hasInverseDirTargetFloor(floorNum)) {
                tm.makeCabMove(cab.curDir == DIR_UP ? DIR_DOWN : DIR_UP);
            } else {
                tm.stop();
            }
        }
        // 按钮灯全部熄灭
        floorUIs[floorNum].inputKeyState(DIR_UP, false);
        floorUIs[floorNum].inputKeyState(DIR_DOWN, false);
        floorSelector.inputKeyState(floorNum, false);
    }

    function hasCurDirTargetFloor(floorNum) {
        floorNum = floorNum || tm.queryNowFloorNum();
        var b = false;
        if(cab.curDir == DIR_UP)
            for(var num = floorNum + 1; !b && num <= 10; num++)
                b = floorSelections[num] || calls[num];
        else if(cab.curDir == DIR_DOWN)
            for(var num = floorNum - 1; !b && num >= 1; num--)
                b = floorSelections[num] || calls[num];
        return b;
    }
    
    function hasInverseDirTargetFloor(floorNum) {
        floorNum = floorNum || tm.queryNowFloorNum();
        var b = false;
        if(cab.curDir == DIR_UP)
            for(var num = floorNum - 1; !b && num >= 1; num--)
                b = floorSelections[num] || calls[num];
        else if(cab.curDir == DIR_DOWN)
            for(var num = floorNum + 1; !b && num <= 10; num++)
                b = floorSelections[num] || calls[num];
        return b;
    }
    
    function chooseRunDir(floorNum) {
        if(floorNum > tm.queryNowFloorNum())
            return DIR_UP;
        else if(floorNum < tm.queryNowFloorNum())
            return DIR_DOWN;
        else
            return DIR_NONE;
    }

    return that;
}