/**
@class 乘梯楼层电梯入口处操作面板，接口
*/
function FloorCallUI(floorNum) {
    this.keyMap = {};// 按钮是否已经激活的Map,根据按钮编码索引
    this.ctrl = null;
    this.floorNum = floorNum;
}
FloorCallUI.prototype.setCtrl = function(ctrl) {
    this.ctrl = ctrl;
}
FloorCallUI.prototype.inputKeyState = function(keyCode, keyState) {}
FloorCallUI.prototype.inputCabCurDir = function(dir) {}
FloorCallUI.prototype.inputCabCurFloorNum = function(num) {}