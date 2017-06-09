window.onload = function() {
    var redLight = makeLight(makeLight.COLOR_RED);
    var yellowLight = makeLight(makeLight.COLOR_YELLOW);
    var greenLight = makeLight(makeLight.COLOR_GREEN);
    
    var trafficLight = makeTrafficLight({no: redLight, keep: yellowLight, ok: greenLight});
    trafficLight.startWork();
};


/**
@class 物理单灯
@param color 颜色
*/
function makeLight() {
    const color = arguments[0]; // 本身颜色
    var lighing = false; // 当前是否亮着
    var that = {};
    
    /* 开 */
    that.turnOn = function() {
        lighing = true;
        draw();
    }
    
    /* 关 */
    that.turnOff = function() {
        lighing = false;
        draw();
    }
    
    that.getColor = function() {
        return color;
    }
    
    function draw() {
        var id = color;
        document.getElementById(id).style.backgroundColor = lighing ? color : "";
    }
    
    return that;
}
makeLight.COLOR_RED = "red";
makeLight.COLOR_YELLOW = "yellow";
makeLight.COLOR_GREEN = "green";

/**
@class 常见种红绿灯
@param lights 一组灯
*/
function makeTrafficLight(spec) {
    const STATE_KEEP_TIMEOUT_MS = 500;
    const TIMEOUT_MS = 2000;
    // 依次 禁止通行、继续通行/保持、准许通行
    const STATE_NO = 0;
    const STATE_KEEP = 1;
    const STATE_OK = 2;
    
    var timeout = TIMEOUT_MS;
    var state = 0;
    var lights = [];
    var timer = null;
    var that = {};
    
    lights[STATE_NO] = spec.no;
    lights[STATE_KEEP] = spec.keep;
    lights[STATE_OK] = spec.ok;

    that.startWork = function() {
        state = STATE_OK;
        lights[state].turnOn();
        doRule();
    }
    
    function doRule() {
        timer = setTimeout(function(){
            lights[state].turnOff();
            switch(state) {
            case STATE_NO:
                state = STATE_KEEP;
                timeout = STATE_KEEP_TIMEOUT_MS;
                break;
            case STATE_KEEP:
                state = STATE_OK;
                timeout = TIMEOUT_MS;
                break;
            case STATE_OK:
                state = STATE_NO;
                timeout = TIMEOUT_MS;
                break;
            }
            lights[state].turnOn();

            doRule();
        }, timeout);
    }
    
    return that;
}