/* 寄存器 */
var PC;
var RV;
var SP;
var R1,R2,R3,R4,R5,R6,R7,R8,R9,R10,R11,R12,R13;
/* 内存 */
var M;

var labelInstrsMap;
var instrs;

var HIGH = 1024;// 栈高地址

function initRegsAndRAM() {
    PC = 0;
    RV = undefined;
    SP = HIGH;
    M = [];
}

function jump(p) {
    PC = p - 1;
}

var FUNC_NAME_ARRAY = ["JUMP", "JMP", "CALL", "RET", "BEQ", "BNE", "BLT", "BGT", "BGE", "BLE"];
var env = {};
env.JUMP = jump;
env.JMP = jump;
env.CALL = function(callerLabel, calleeLabel) {
    SP = SP - 4;// 申请留出来一个空间用以保存caller继续的PC
    M[SP] = [PC, callerLabel];// 保存当前PC
    PC = -1;
    instrs = labelInstrsMap[calleeLabel];
}
env.RET = function() {
    if(SP != HIGH) {
        PC = M[SP][0]; // 返回之前PC
        instrs = labelInstrsMap[M[SP][1]];
    }
    SP = SP + 4; // 恢复调用时的SP
}
env.BEQ = function(n1, n2, p) {
    if(n1 === n2)
        jump(p);
}
env.BNE = function(n1, n2, p) {
    if(n1 !== n2)
        jump(p);
}
env.BLT = function(n1, n2, p) {
    if(n1 < n2)
        jump(p);
}
env.BGT = function(n1, n2, p) {
    if(n1 < n2)
        jump(p);
}
env.BGE = function(n1, n2, p) {
    if(n1 >= n2)
        jump(p);
}
env.BLE = function(n1, n2, p) {
    if(n1 <= n2)
        jump(p);
}

function exec(startPC) {
    PC = startPC || 0;
    var instr;
    var exps, op, args;
    while(PC < instrs.length) {
        instr = instrs[PC];
        exps = instr.match(/^\w+/);
        if(exps && (op = exps[0], FUNC_NAME_ARRAY.indexOf(op) > -1)) {
            args = instr.substr(op.length + 1).split(",");
            args = args.map(eval);
            env[op].apply(null, args);
        } else {// JS Code
            eval(instr);
        }

        PC++;
    }
}

function parse(src) {
    labelInstrsMap = {};
    var lines = src.split("\n");
    var line;
    var label;
    var m;
    for(var i = 0; i < lines.length; i++) {
        line = lines[i].trim();

        if(!line)
            continue;
        if(m = line.match(/^\/\//))
            continue;

        var j = line.length -1;
        while(line[j] == ';') j--;
        line = line.substring(0, j+1);

        if(m = line.match(/^\w+:/)) {
            label = m[0];
            label = label.substring(0, label.length - 1);
            labelInstrsMap[label] = [];
        } else if(m = line.match(/CALL\s(\w+)/)) {
            labelInstrsMap[label].push("CALL '{0}','{1}'" .replace("{0}", label).replace("{1}", m[1]));
        } else {
            labelInstrsMap[label].push(line);
        }
    }
}

window.onload = function(){
    var btnRun = document.getElementById("run");
    var txtCode = document.getElementById("code");
    btnRun.onclick = function() {
        parse(txtCode.value);
        instrs = labelInstrsMap["main"];
        initRegsAndRAM();
        exec();
    }
}