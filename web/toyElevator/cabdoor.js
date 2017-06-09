/**
@class 轿厢门
*/
function makeCabDoor() {
    var cab, ctrl;
    var opened = false;
    var that = {};
    
    that.setCab = function() {
        cab = arguments[0];
    }
    that.setCtrl = function() {
        ctrl = arguments[0];
    }
    
    that.isOpen = function() {
        return opened;
    }
    
    that.init = function() {
        cab.div.innerHTML = "门是关闭的";
    }
    
    that.open = function() {
        assert(!opened, "open error");
        cab.div.innerHTML = "门是打开的";
        cab.div.style.backgroundColor = "white";
        opened = true;
        setTimeout(function() {
            cab.door.close();
        }, 3000);
        ctrl.onDoorChanged();
        document.getElementById("btnInUnit").removeAttribute("disabled");
        if(cab.units.length > 0)
            document.getElementById("btnOutUnit").removeAttribute("disabled");
    }
    that.close = function() {
        assert(opened, "close error");
        cab.div.innerHTML = "门是关闭的";
        cab.div.style.backgroundColor = "black";
        opened = false;
        
        ctrl.onDoorChanged();
        document.getElementById("btnInUnit").setAttribute("disabled", "disabled");
        document.getElementById("btnOutUnit").setAttribute("disabled", "disabled");
    }
    
    return that;
}
