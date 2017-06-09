Number.prototype.pad2 =function(){ return this>9?this:'0'+this; }      
Date.prototype.format=function (format) {      
	var it=new Date();      
	var it=this;      
	var M=it.getMonth()+1,H=it.getHours(),m=it.getMinutes(),d=it.getDate(),s=it.getSeconds();      
	var n={ 'yyyy': it.getFullYear()      
		,'MM': M.pad2(),'M': M      
		,'dd': d.pad2(),'d': d      
		,'HH': H.pad2(),'H': H      
		,'mm': m.pad2(),'m': m      
		,'ss': s.pad2(),'s': s      
	};      
	return format.replace(/([a-zA-Z]+)/g,function (s,$1) { return n[$1]; });      
};
String.format = function() {
  if(arguments.length == 0) {
    return null;
  } else if(arguments.length == 1) {
    return arguments[0];
  }
  var result = arguments[0];
  for ( var i = 1; i < arguments.length; i++) {
    result = result.replace(new RegExp('\\{' + (i - 1) + '\\}', 'gm'), arguments[i]);
  }
  return result;
};

String.prototype.format = function() {
  var result = this;
  if(arguments.length == 0) {
    return null;
  }
  for (var i = 0; i < arguments.length; i++) {
      result = result.replace(new RegExp('\\{' + (i) + '\\}', 'gm'), arguments[i]);
  }
  return result;
};
String.prototype.repeat = String.prototype.repeat || function(n) {
	var s = this.toString(), result = s;
	for(n--; n > 0; n--) result += s;
	return result;
};

Array.prototype.lastValue = function(){
	var array = this;
	return array[array.length - 1];
};