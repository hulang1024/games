function Timekeeper(elemId) {
  var elem = document.getElementById(elemId);
  function to2p(n) { return n > 9 ? n : '0' + n; }

  var time = {h: 0, m: 0, s: 0};
  var timer;
  this.timekeep = function() {
    ++time.s;
    if(time.s == 60) {
      time.s = 0;
      ++time.m;
    }
    if(time.m == 60) {
      time.m = 0;
      ++time.h;
    }
    var str;
    str = to2p(time.m) + ' : ' + to2p(time.s);
    if(time.h > 0)
      str = to2p(time.h) + ' : ' + str;
    elem.innerHTML = str;
  }

  this.start = function() {
    timer = setInterval(this.timekeep, 1000);
  }

  this.stop = function() {
    if(timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  this.restart = function() {
    if(timer) {
      this.stop();
    }
	time.h = time.m = time.s = 0;
    this.start();
  }
}
