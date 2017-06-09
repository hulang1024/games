
function ConfigManager() {
	this.configStore = {};
	
	this.set = function(key, value){
		this.configStore[key] = value;
	}

	this.get = function(key) {
		return this.configStore[key];
	}
		
	this.save = function() {
		localStorage.tetris_player_cfg_json = JSON.stringify(this.configStore);
	}
	
	this.initDefaults = function () {
		this.configStore['left'] = 'Left';
		this.configStore['right'] = 'Right';
		this.configStore['down'] = 'Down';
		this.configStore['drop'] = 'Space';
		this.configStore['rotate'] = 'Up';
		this.configStore['play'] = 'Enter';
		this.configStore['colors'] = 'darkorange,darkviolet,mediumblue,red,lightseagreen,yellow,lime,white,gray,transparent,#2e3337';
	}
	
	this.load = function() {
		if(localStorage.tetris_player_cfg_json) {
			var obj = JSON.parse(localStorage.tetris_player_cfg_json);
			for(var p in obj)
				this.configStore[p] = obj[p];
		}
	}
	
	this.initDefaults();
	this.load();
}

function MainMenu() {
    $('#play').click(function(){
        $(this).blur();
        options.popOut(false);
        if(pause) {
            T.applySettings();
            $('#gamefield').fadeIn();
            $('#pause').show();
        } else {
            T.newGame();
		}
	});
    
	$('#settings').click(function(){
		$(this).blur();
		options.popOut();
	});
}

function PauseMenu() {
	var selfElem = $('#pause');
	$('#pause [name=continue]').click(function(){
		selfElem.fadeOut('normal');
		T.continueGame();
	});
	$('#pause [name=restart]').click(function(){
		selfElem.fadeOut('normal');
		T.restart();
	});
}

function Options() {
	var self = this;
	var poppedOut = false;
	
	this.popOut = function(b) {
		if(b != undefined) {
			poppedOut = b;
		} else {
			poppedOut = !poppedOut;
		}
		if(poppedOut) {
			$('#options').stop().show().animate({width:'500px', opacity:0.5}, 'normal','swing', function(){
				$(this).css({background: 'rgba(0,0,0,0.5)', opacity: 1});
			});
		} else {
			$('#options').stop().animate({width:'0px', opacity:0.0}, 'normal','swing', function(){
				$(this).css({background: 'rgba(0,0,0,0.0)', opacity: 0});
			});
		}
	};
    
	this.load = function() {
		$('#options input.key').each(function(){
			var keyName = this.name;
			this.onkeyup = function(event){
				this.value = event.code.replace(/Arrow|Key/g,'');
				config.set(keyName, this.value);
				config.save();
			}
		});
		
		for(var k in config.configStore) {
			$('#options input[name=' + k + ']').val(config.get(k));
		}
	}

	this.load();
	
	$('#options #save').click(function(){
		$('#options input').each(function(){
			config.set(this.name,this.value.trim());
		});
		config.save();
		updateSettings();
		$(document.body).css('backgroundColor', menuBackgroundColor);
	});
	$('#options [name=back]').click(function(){
		self.popOut();
	});
	$('#options #reset').click(function(){
		config.initDefaults();
		self.load();
		config.save();
	});
	
	this.onKeyDown = function(event) {
		switch(event.code) {
			case 'Escape':
				if(!poppedOut) return false;
				this.popOut(false);
				return true;
			}
	};
}

function T() {
	var MAP_R = 20;
	var MAP_C = 10;
	var BLOCK_R = 4;
	var BLOCK_C = 4;
	var BLOCKS = [
	//I
	[
	 [[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]],
	 [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
	 [[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0]],
	 [[0,0,0,0],[0,0,0,0],[1,1,1,1],[0,0,0,0]]
	],
	//L
	[
	 [[1,0,0,0],[1,0,0,0],[1,1,0,0],[0,0,0,0]],
	 [[1,1,1,0],[1,0,0,0],[0,0,0,0],[0,0,0,0]],
	 [[0,1,1,0],[0,0,1,0],[0,0,1,0],[0,0,0,0]],
	 [[0,0,0,0],[0,0,1,0],[1,1,1,0],[0,0,0,0]]
	],
	//J
	[
	 [[0,0,1,0],[0,0,1,0],[0,1,1,0],[0,0,0,0]],
	 [[0,0,0,0],[1,0,0,0],[1,1,1,0],[0,0,0,0]],
	 [[1,1,0,0],[1,0,0,0],[1,0,0,0],[0,0,0,0]],
	 [[1,1,1,0],[0,0,1,0],[0,0,0,0],[0,0,0,0]]
	],
	//O
	[
	 [[1,1,0,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]],
	 [[1,1,0,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]],
	 [[1,1,0,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]],
	 [[1,1,0,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]],
	],
	//S
	[
	 [[0,1,1,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]],
	 [[0,1,0,0],[0,1,1,0],[0,0,1,0],[0,0,0,0]],
	 [[0,0,0,0],[0,1,1,0],[1,1,0,0],[0,0,0,0]],
	 [[1,0,0,0],[1,1,0,0],[0,1,0,0],[0,0,0,0]]
	],
	//T
	[
	 [[1,1,1,0],[0,1,0,0],[0,0,0,0],[0,0,0,0]],
	 [[0,0,1,0],[0,1,1,0],[0,0,1,0],[0,0,0,0]],
	 [[0,0,0,0],[0,1,0,0],[1,1,1,0],[0,0,0,0]],
	 [[1,0,0,0],[1,1,0,0],[1,0,0,0],[0,0,0,0]]
	],
	//Z
	[
	 [[1,1,0,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]],
	 [[0,0,1,0],[0,1,1,0],[0,1,0,0],[0,0,0,0]],
	 [[0,0,0,0],[1,1,0,0],[0,1,1,0],[0,0,0,0]],
	 [[0,1,0,0],[1,1,0,0],[1,0,0,0],[0,0,0,0]]
	]
	];

	var map;
	var enabledShadow = true;
	var shadow = {};
	var thisBlock, nextBlock;
	var nowr, nowc;
	var msSpeed = 500;
	var score = 0;
	var killedLines = 0;

	initBaseUI();
	
	this.ctrl = function(cmd, sender) {
	  if((pause && cmd != 'play') || (over && cmd != 'play'))
		return;

		//play effect
		//keyEffectAudio.play();
		
	  var hr = nowr;
	  var hc = nowc;

	  switch(cmd) { 
		case 'left':
		  hc--;
		  break;
		case 'right':
		  hc++;
		  break;
		case 'down':
		  hr++;
		  break;
		case 'rotate':
		  if(canRotate()) {
			easeBlock();
			if(enabledShadow)
			  easeShadow();
			thisBlock.dir =(thisBlock.dir + 1) % 4;
			drawBlock();
			if(enabledShadow) {
			  makeShadow();
			  drawShadow();
			}
		  }
		  return;
		  break;
		case 'drop':
		  if(canMove(nowr + 1, nowc)) {
			easeBlock();
			if(enabledShadow)
			  easeShadow();
			makeShadow();
			nowr = shadow.r - 1;
			nowc = shadow.c;
			drawBlock();
		  }
		  return;
		  break;
		case 'play':
				if(over) {
					$('[name=play]').attr('title','暂停');
				  this.newGame();
				  return;
				}
		  pause = !pause;
		  if(pause) {
					this.pauseGame();
		  } else {
					playing = true;
			timer = setInterval(loop, msSpeed);
			timekeeper.start();
			$('[name=play]').attr('title','暂停');
					showPause(false);
		  }
		  break;
			case 'pause':
				if(playing) {
					this.pauseGame();
				}
				break;
	  }
	  
	  if(canMove(hr, hc)) {
		easeBlock();
		if(enabledShadow)
		  easeShadow();
		nowr = hr;
		nowc = hc;
		drawBlock();
		if(enabledShadow) {
		  makeShadow();
		  drawShadow();
		}
	  }

	}
				
	this.pauseGame = function() {
		pause = true;
		clearInterval(timer);
		timekeeper.stop();
		$('[name=play]').attr('title','继续');
		showPause();
	}

	this.continueGame = function() {
		this.ctrl('play');
	}

	this.newGame = function() {
		updateSettings();
		
		map = [];
		for(var r = 0; r < MAP_R; r++) {
			map.push([]);
			for(var c = 0; c < MAP_C; c++) {
				map[r][c] = {};
				map[r][c].b = 0;
			}
		}
	  over = false;
		killedLines = 0; 
		score = 0;
		
		$('#time').text('00 : 00');
		$('#score').text(score);
		$('#killedLines').text(killedLines);
		
	  drawMap();
	  thisBlock = createNewBlock();
	  nextBlock = createNewBlock();
	  drawBlock();
	  drawNextBlock();
	  if(enabledShadow) {
		makeShadow();
		drawShadow();
	  }
		this.applySettings();
				
		$('#gamefield').fadeIn();
		showPause(false);
		pause = false;
		timer = setTimeout(function(){
			timer = setInterval(loop, msSpeed);
			timekeeper.restart();
			playing = true;
		}, 500);
	}
				
	this.restart = function() {
		clearInterval(timer);
		timekeeper.stop();
		this.newGame();
	}


	function initBaseUI() {
	  var size = 26;
		windowWidth  = window.innerWidth  || document.documentElement.clientWidth || document.body.clientWidth;
		windowHeight = window.innerHeight || document.documentElement.clientHeight|| document.body.clientHeight;

	  var space = getElementById('space');
	  space.style.position = 'relative';
	  space.style.width = size * MAP_C + (MAP_C + 1) * 3 + 1 + 'px';
	  space.style.height = size * MAP_R + (MAP_R + 1) * 3 + 1 + 'px';
				
		var gamefield = $('#gamefield');
		gamefield.css({
			width: size * MAP_C + 400,
			left: (windowWidth - $(space).width()) / 2
		});
	  for(var r = 0; r < MAP_R; r++) {
		for(var c = 0; c < MAP_C; c++) {
		  var div = document.createElement('div');
		  div.id = r + '-' + c;
		  div.style.position = 'absolute';
		  div.style.top = size * r + (r + 1) * 3 + 'px';
		  div.style.left = size * c + (c + 1) * 3 + 'px';
		  div.style.width = size + 'px';
		  div.style.height = size + 'px';
		  space.appendChild(div);
		}
	  }
	  
	  var nextBlockDiv = getElementById('nextBlock');
	  for(var r = 0; r < BLOCK_R; r++) {
		for(var c = 0; c < BLOCK_C; c++) {
		  var div = document.createElement('div');
		  div.id = r + '-' + c;
		  div.style.position = 'absolute';
		  div.style.top = size * r + (r + 1) * 3 + 'px';
		  div.style.left = size * c + (c + 1) * 3 + 'px';
		  div.style.width = size + 'px';
		  div.style.height = size + 'px';
		  nextBlockDiv.appendChild(div);
		}
	  } 
	  
	  timekeeper = new Timekeeper('time');
	}

	var popSyncAnimalDone = true;
	function loop() {
	  if(!popSyncAnimalDone)
		return;
	  if(canMove(nowr + 1, nowc)) {
		easeBlock();
		nowr++;
		drawBlock();
	  } else {
		fall();//因异步,要及时更新状态
		if(enabledShadow) {
		  easeShadow();
		  drawBlock();
			}
			//fallEffectAudio.play();
		if(nowr == 0) {
		  drawMap();
		  drawBlock();
		  clearInterval(timer);
		  timekeeper.stop();
		  overGame();
		  return;
		}
		
		score += 10;
		//printMapState();
		var rows = checkFullRows();
		if(rows.length > 0) {
		  showPop(rows);
		  popRows(rows);
		  //printMapState();
		  popSyncAnimalDone = false;
		  setTimeout(function(){
				  //popEffectAudio.play();
			drawMap();
			thisBlock = nextBlock;
			nextBlock = createNewBlock();
			drawNextBlock();
			if(canMove(nowr + 1, nowc)) {
			  drawBlock();
			  if(enabledShadow) {
				makeShadow();
				drawShadow();
			  }
			}
					
			score += Math.pow(2, rows.length - 1) * 100;
			killedLines += rows.length;
			getElementById('score').innerHTML = score;
			getElementById('killedLines').innerHTML = killedLines;
			
			popSyncAnimalDone = true;
		  }, msSpeed / 3);
		} else {
		  getElementById('score').innerHTML = score;
		  thisBlock = nextBlock;
		  nextBlock = createNewBlock();
		  drawNextBlock();
		  if(canMove(nowr + 1, nowc)) {
			drawBlock();
			if(enabledShadow) {
			  makeShadow();
			  drawShadow();
			}
		  }
		}
	  }
	}

	function createNewBlock() {
	  nowr = 0;
	  nowc = MAP_C / 2 - BLOCK_C / 2;
	  var rn = randInt(0, BLOCKS.length);
	  return new Block(rn, 0);
	}

	function Block(type, dir) {
	  this.type = type;
	  this.dir = dir;
	}

	function makeShadow() {
	  shadow.r = nowr;
	  shadow.c = nowc;
	  while(canMove(shadow.r, shadow.c)) {
		shadow.r++;
	  }
	}

	function canMove(r, c) {
	  for(var i = 0; i < BLOCK_R; i++)
		for(var j = 0; j < BLOCK_C; j++) {
		  if(!BLOCKS[thisBlock.type][thisBlock.dir][i][j])
			continue;
		  var mr = r + i;
		  var mc = c + j;
		  if(!(isInMap(mr, mc) && isEmptyInMap(mr, mc)))
			return false;
	   }
	  return true;
	}

	function canRotate() {
	  var currDirBlock = BLOCKS[thisBlock.type][thisBlock.dir];
	  var nextDirBlock = BLOCKS[thisBlock.type][(thisBlock.dir + 1) % 4];
	  var rotateBlcok = [];
	  for(var i = 0; i < BLOCK_R; i++) {
		rotateBlcok.push([]);
		for(var j = 0; j < BLOCK_C; j++)
		  rotateBlcok[i][j] = currDirBlock[i][j] | nextDirBlock[i][j];
	  }

	  for(var i = 0; i < BLOCK_R; i++)
		for(var j = 0; j < BLOCK_C; j++) {
		  if(rotateBlcok[i][j]) {
			var mr = nowr + i;
			var mc = nowc + j;
			if(! (isInMap(mr, mc) && isEmptyInMap(mr, mc)))
			  return false;
		  }
	  }
	  return true;
	}

	function fall() {
	  var block = BLOCKS[thisBlock.type][thisBlock.dir];
	  for(var i = 0; i < BLOCK_R; i++)
		for(var j = 0; j < BLOCK_C; j++)
		  if(block[i][j]) {
			var box = map[nowr + i][nowc + j];
			box.b = block[i][j];
			box.c = thisBlock.type;
		  }
	}

	function checkFullRows() {
	  var rows = [];
	  var full;
	  for(var r = nowr; r < MAP_R; r++) {
		full = true;
		for(var c = 0; full && c < MAP_C; c++)
		  full = map[r][c].b;
		if(full)
		  rows.push(r);
	  }
	  return rows;
	}

	function showPop(rows) {
	  var space = getElementById('space');
	  for(var i = 0; i < rows.length; i++)
		for(var c = 0; c < MAP_C; c++) {
		  var box = space.children[rows[i] * MAP_C + c];
		  box.style.backgroundColor = 'transparent';
		  box.style.border = '1px solid transparent';
		}
	}

	function popRows(rows) {
	  for(var i = 0; i < rows.length; i++)
		for(var r = rows[i] - 1; r >= 0; r--)
		  for(var j = 0; j < MAP_C; j++) {
			map[r + 1][j].b = map[r][j].b;
			map[r + 1][j].c = map[r][j].c;
		  }
	}

	function isInMap(r, c) {
	  return (0 <= r && r < MAP_R) && (0 <= c && c < MAP_C);
	}

	function isEmptyInMap(r, c) {
	  return map[r][c].b == 0;
	}

	function drawMap() {
	  var blockEls = getElementById('space').children;
	  for(var i = 0; i < MAP_R; i++)
		for(var j = 0; j < MAP_C; j++) {
		  var div = blockEls[i * MAP_C + j];
		  if(map[i][j].b) {
			div.style.backgroundColor = colors[map[i][j].c];
			div.style.border = '1px solid ' + colors[map[i][j].c];
		  } else {
			div.style.backgroundColor = 'transparent';
			div.style.border = '1px solid ' + mapBorderColor;
		  }
		}
	}

	function drawBlock() {
	  var blockEls = getElementById('space').children;
	  var block = BLOCKS[thisBlock.type][thisBlock.dir];
	  for(var i = 0; i < BLOCK_R; i++)
		for(var j = 0; j < BLOCK_C; j++) {
		  if(block[i][j]) {
			var div = blockEls[(nowr + i) * MAP_C + (nowc + j)];
			div.style.backgroundColor = colors[thisBlock.type];
			div.style.border = '1px solid ' + colors[thisBlock.type];
		  }
		}
	}

	function drawNextBlock() {
	  var nextBlockEls = getElementById('nextBlock').children;
	  var block = BLOCKS[nextBlock.type][nextBlock.dir];
	  for(var i = 0; i < BLOCK_R; i++)
		for(var j = 0; j < BLOCK_C; j++) {
		  var div = nextBlockEls[i * BLOCK_C + j];
		  if(block[i][j]) {
			div.style.backgroundColor = colors[nextBlock.type];
			div.style.border = '1px solid ' + colors[nextBlock.type];
		  } else {
			div.style.backgroundColor = 'transparent';
			div.style.border = '1px solid transparent';
		  }
		}
	}

	function easeBlock() {
	  var blockEls = getElementById('space').children;
	  var block = BLOCKS[thisBlock.type][thisBlock.dir];
	  for(var i = 0; i < BLOCK_R; i++)
		for(var j = 0; j < BLOCK_C; j++) {
		  if(block[i][j]) {
			var div = blockEls[(nowr * MAP_C + nowc) + (i * MAP_C + j)];
			div.style.backgroundColor = 'transparent';
			div.style.border = '1px solid ' + mapBorderColor;
		  }
		}
	}

	function drawShadow() {
	  var blockEls = getElementById('space').children;
	  var block = BLOCKS[thisBlock.type][thisBlock.dir];
	  for(var i = 0; i < BLOCK_R; i++)
		for(var j = 0; j < BLOCK_C; j++) {
		  if(block[i][j]) {
			var div = blockEls[(shadow.r + i - 1) * MAP_C + (shadow.c + j)];
			div.style.border = '1px solid ' + shadowBorderColor;
		  }
		}
	}

	function easeShadow() {
	  var blockEls = getElementById('space').children;
	  var block = BLOCKS[thisBlock.type][thisBlock.dir];
	  for(var i = 0; i < BLOCK_R; i++)
		for(var j = 0; j < BLOCK_C; j++) {
		  if(block[i][j]) {
			var div = blockEls[(shadow.r + i - 1) * MAP_C + (shadow.c + j)];
			div.style.border = '1px solid ' + mapBorderColor;
		  }
		}
	}

	function overGame() {
		over = true;
		$('[name=play]').attr('title','重新开始');
		showPause();
	}

	function showPause(show) {
	  var div = $('#pause');
		if(show != undefined) {
			div.hide();
			return;
		}
		
		var space = $('#space');
	  div.css('width', space.css('width'));
	  div.css('height', space.css('height'));
	  div.css('line-height', div.css('height'));
	  div.css('border', space.css('border'));
		div.show();
		
		var buttons = $('#pause button');
		var btnHeight = 50, btnWidth = 120;
		var bx = (div.width() - btnWidth) / 2;
		var by = (div.height() - btnHeight * buttons.length) / 2;
		buttons.each(function(index){
			$(this).css({
				left: bx,
				top: by + (index * btnHeight + index * 20),
				display: 'none'
			}).fadeIn();
		});
	}
	
	this.applySettings = function() {
		updateSettings();
		getElementById('space').style.border = '2px solid ' + spaceBorderColor;
		drawMap();
		drawBlock();
		drawNextBlock();
		drawShadow();
	}


	function printMapState() {
	  var debug = getElementById('debug');
	  var html = '';
	  for(var r = 0; r < MAP_R; r++) {
		for(var c = 0; c < MAP_C; c++)
		  html += map[r][c].b;
		html += '</br>';
	  }
	  debug.innerHTML = html;
	};

	this.onKeyDown = function(event) {
		if(event.code == 'Escape') {
			if(pause) {
				this.continueGame();
			} else {
				this.pauseGame();
			}
			return;
		}
	  var cmd = cmdFromKeyCode(event.code);
	  if(playing) {
			this.ctrl(cmd);
		}	
	};

	this.onKeyUp = function(event) {
	};

	function cmdFromKeyCode(keyCode) {
		keyCode = keyCode.replace(/Arrow|Key/g,'').toLowerCase();
		for(var k in config.configStore)
			if(config.get(k).toLowerCase() == keyCode) 
				return k;
	}
}

var colors, spaceBorderColor, mapBorderColor, shadowBorderColor, menuBackgroundColor;
var pause = false, over = false, playing = false;
var timer;
var timekeeper;
var config, mainMenu, pauseMenu, options, T;

window.onload = function() {
	config = new ConfigManager();
	pauseMenu = new PauseMenu();
	options = new Options();
	mainMenu = new MainMenu();
	T = new T();
	updateSettings();
	$(document.body).css('backgroundColor', menuBackgroundColor);

	document.onkeydown = function(event) {
		event = (event || window.event);
		options.onKeyDown(event);
        T.onKeyDown(event);
	}
	document.onkeyup = function(event) {
		T.onKeyUp(event || window.event);
	}
}

function updateSettings() {
	colors = config.get('colors').split(',');
	shadowBorderColor = colors[7]
	mapBorderColor = colors[8];
	spaceBorderColor = colors[9];
	menuBackgroundColor = colors[10];
}

function randInt(n, m) {
  return Math.floor(Math.random() * (m - n)) + n;
}

function getElementById(id) {
  return document.getElementById(id);
}