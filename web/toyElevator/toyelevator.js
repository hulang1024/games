// Possible directions
const DIR_NONE  = 0;
const DIR_UP    = 1;
const DIR_DOWN  = 2;

function init() {
    mainCtrl = makeMainController();
    cab = makeCab();
    door = makeCabDoor();
    floorSelector = makeFloorSelector();
    tractionMachine = makeTractionMachine();
    
    door.setCab(cab);
    door.setCtrl(mainCtrl);

    floorSelector.setCab(cab);
    floorSelector.setCtrl(mainCtrl);
    
    cab.setDoor(door);
    cab.setFloorSelector(floorSelector);
    cab.door.init();

    tractionMachine.setCab(cab);
    tractionMachine.setCtrl(mainCtrl);
    tractionMachine.setFloorSelector(floorSelector);
    
    mainCtrl.setFloorSelector(floorSelector);
    mainCtrl.setTractionMachine(tractionMachine);
    mainCtrl.setCab(cab);
    
    for(var num = 1; num <= 10; num++) {
        var floorCallUI;
        if(num == 1)
            floorCallUI = makeSingleButtonFloorCallUI(num, DIR_UP);
        else if(num == 10)
            floorCallUI = makeSingleButtonFloorCallUI(num, DIR_DOWN);
        else
            floorCallUI = makeNormalFloorCallUI(num);
        floorCallUI.setCtrl(mainCtrl);
        mainCtrl.setFloorUI(floorCallUI);
    }

}

window.onload = function() {
    init();
}