


var mainMenu;
var config = new ConfigManager();
var options;
var cursor;
var volumeControl;
var audioManager;

var
  btnStart, btnChangePlaybackSpeed,
  progress, percent,
  gamefield,
  songSelect,rankingSelect,
  divKeyOverlayArray;
var canvas, canvasContext;
var windowWidth, windowHeight;
var cursorR, animalCursorR;
var gridW = 512, gridH = 384, gamefieldCenter = new Point(gridW / 2 * 1.2, gridH / 2 * 1.2);
var gamefieldCenterBaseX, gamefieldCenterBaseY;
var BorderWidth = 5;

//游戏状态
var pause, skiping, gameplaying = false, waitGameplayingMode = false, isSystemSelect;
var nowSelectedIndex = -1, selectedBeatmap = null;
var nowScreen = 'menu';

//分数
var combo = 0, maxCombo = 0, scoring = 0, accuracy = 100.00, hitCounts = [0,0,0,0,0,0];//x,50,100,300,喝,激
var modScoreMultiplier = 1;

//分数数据库
var scoresDB = {};

//Mods
var currPlaybackRate = 1;
var withMods = {
	autoplay: false,
	relax: false,
	relax2: false,
	spunOut: false,
	noFail: false,
	easy: false,
	hardRock: false,
	halfTime: false,
	doubleTime: false,
	hidden: false
};
var userWithMods = {
	autoplay: false,
	relax: false,
	relax2: false,
	spunOut: false,
	noFail: false,
	easy: false,
	hardRock: false,
	halfTime: false,
	doubleTime: false,
	hidden: false
};
var modSimpleNameTable = {
	relax: 'Relax',
	relax2: 'AP',
	spunOut: 'SO',
	noFail: 'NF',
	easy: 'EZ',
	hardRock: 'HR',
	halfTime: 'HT',
	doubleTime: 'DT',
	hidden: 'HD'
};


var Beatmaps = [];
var approachRate, circleRadius, approachRateMS, approachRateMSStep;
var audioLeadIn;
var stackLeniency;

var arHitObjects = [], movePoints = [], hitScores = [];
var countCircles, countSliders, countSpinners;
var timer;
var cursorTimer, cursorLastUpdateTime = 0;
var timerStartTime = 0;
var skipOffsetTime = 0;
var offsetTime;
var hitObjects = [], timingPoints = [];
var hitObjectIndex = 0;
var currentTimingPoint;
var currentTimingPointIndex;


var errorFilepaths = {};
var hasCmd = true;

var DefaultModARMSTable = [1800, 1680, 1560, 1440, 1320, 1200, 1050, 900, 750, 600, 450];
var EZModARTable = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
var HTModARTable = [-5, -3.67, -2.33, -1, 0.33, 1.67, 3.33, 5, 6.33, 7.67, 9];
var HRModARTable = [0, 1.4, 2.8, 4.2, 5.6, 7, 8.4, 9.8, 10, 10, 10];
var DTModARTable = [5, 5.4, 6.07, 6.6, 7.13, 7.67, 8.33, 9, 9.67, 10.33, 11];
var OD50 = 150, OD100 = 100, OD300 = 50;
var mouseEvent = {}, mousePos = {}, mousePosOnHitTime = {};


var fpsMode;

var skinsBasePath;
var useSkinBasePath;
//皮肤配置
var skinConfig;

var overallCursorStyle;
var devMode = true;

var musicAudio = new Audio();
var effectAudioList = [], effectAudioSet = {};
var imageDataURLSet = [];

//输入状态
var nowKeyIsDown = false;

var autoPlayer = new AutoPlayer();
var inputKeyOverlayer = new InputKeyOverlayer();
var replayer = new Replayer();

var replayMode = false;
var selectedScoreDetails;

function Point(x, y) {
  this.x = x;
  this.y = y;
  this.copy = function() {
    return new Point(this.x, this.y);
  };
  this.equals = function(other) {
    if(other === this)
      return true;
    if(!(other instanceof Point))
      return false;
    return this.x == other.x && this.y == other.y;
  };
  this.toString = function() {
    return '(' + this.x + ',' + this.y + ')';
  };
}

//function Beatmap() {}

function HitObject() {
	//将被打击的时间.(毫秒)
	this.startTime = 0;
	this.endTime = 0;
	this.length = function() { return this.endTime - this.startTime; };

	//物件类型
	this.type = 0;
	//游戏区域中打击物件的位置
	this.position = new Point();
	//打击物件的打击声音
	this.soundType = 0;
	//Is this object the first in a new combo?
	this.newCombo = false;
	//在打击物件上显示的数字
	this.comboNumber = 0;
	this.lastInCombo = false;
	//If this object has a New Combo marker, how many additional colours do we cycle by?
	this.comboColourOffset = 0;
	this.comboColourIndex = 0;
	//原始颜色值
	this.colour = '';

	this.stackIndex = 0;
	this.stackCount = 0;

	//slider
	this.sliderType = '';
	this.nodePos = [];
	this.repeat = 0;
	this.pixelLength = 0;

}

function TimingPoint() {
	this.startTime = 0;
	this.bpm = 0;
	this.sampleSet = '';
	this.custom = null;
	this.volume = 0;
	this.inherited  = false;
	this.kiai = false;
}

/*
按键表示框
输入全局参数: arHitObjects等
*/
function InputKeyOverlayer() {
	var inputKeyCountArray = [];

	this.init = function() {
		nowKeyIsDown = false;
		getElement('#keyOverlay').style.display = settings.keyoverlayEnabled ? 'block' : 'none';
		for(var i = 0; i < 4; i++) {
			inputKeyCountArray[i] = 0;
			divKeyOverlayArray[i].style.transform = 'scale(1.0)';
			divKeyOverlayArray[i].style.backgroundColor = 'white';
			divKeyOverlayArray[i].innerHTML = ['K1','K2','M1','M2'][i];
			divKeyOverlayArray[i].scaleNum = 1.0;
		}
	}

	this.count = function(keyIndex) {
		if(gameplaying && arHitObjects.length > 0) {
	  		++inputKeyCountArray[keyIndex];
		}
	}

	this.down = function(keyIndex) {
		if(!settings.keyoverlayEnabled) return;
		nowKeyIsDown = true;
		if(keyIndex != undefined) {
			var divKeyOverlay = divKeyOverlayArray[keyIndex];
			divKeyOverlay.style.transform = 'scale(0.78)';
			divKeyOverlay.style.backgroundColor = ['yellow', '#FF00FF'][Math.floor(keyIndex / 2)];
			divKeyOverlay.innerHTML = inputKeyCountArray[keyIndex];
		}
	}

	this.up = function(keyIndex) {
		if(!settings.keyoverlayEnabled) return;
		nowKeyIsDown = false;
		if(keyIndex != undefined) {
			var divKeyOverlay = divKeyOverlayArray[keyIndex];
			divKeyOverlay.style.transform = 'scale(1.0)';
			divKeyOverlay.style.backgroundColor = 'white';
		}
	}
}

/*
Relax,Autopilot,Autoplay
输入全局参数: hitObjects等
*/
function AutoPlayer() {
	var moveHitObjectIndex = 0;
	var snDiffTime = null, sliderDiffTime = null;
	var autoplayInputKeySeq = [], autoplayInputKeySeqIndex = 0;
	var cursorPos, cursorPosInGrid;
	var keyIsUping = false;

	this.init = function() {
		moveHitObjectIndex = 0;
		snDiffTime = null, sliderDiffTime = null;
		autoplayInputKeySeqIndex = 0;
		keyIsUping = false;
		cursorPosInGrid = new Point(gamefieldCenter.x, gridH * 1.2 + cursorR * 4);
		calcAutoplayInputKeySeq();
	};

	function calcAutoplayInputKeySeq() {
	  //鼠标单双风格
	  autoplayInputKeySeq.length = 0;
	  var k = 2;
	  for(var i = 0; i < hitObjects.length; ) {
	    var j = i + 1;
	    var lastTime = hitObjects[i].startTime;
	    while(j < hitObjects.length
	    		&& hitObjects[j].startTime - lastTime <= 0.2 * approachRateMS
	    		&& hitObjects[i].colour == hitObjects[j].colour) {
	      lastTime = hitObjects[j].startTime;
	      j++;
	    }

	    if(j - i > 1) {
	      k = 2;
	      for(; i < hitObjects.length  && i < j; i++) {
	        autoplayInputKeySeq.push(k);
	        k = k == 2 ? 3 : 2;
	      }
	    } else {
	      i++;
	      autoplayInputKeySeq.push(2);
	    }
	  }
	}

	this.draw = function(offsetTime) {
		if(moveHitObjectIndex > hitObjects.length - 1) return;
		if(!hitObjects[moveHitObjectIndex].autoHit && moveHitObjectIndex > 0 && keyIsUping) {
			var goodUpTime = Math.min((hitObjects[moveHitObjectIndex].startTime - hitObjects[moveHitObjectIndex - 1].startTime) / 2, OD100);
			if(hitObjects[moveHitObjectIndex - 1].type == 1
				&& offsetTime - hitObjects[moveHitObjectIndex - 1].startTime >= goodUpTime) {
				if(withMods.autoplay) {
					inputKeyOverlayer.up(autoplayInputKeySeq[autoplayInputKeySeqIndex - 1]);
				}
				keyIsUping = false;
			}
		}

		var hitObject = hitObjects[moveHitObjectIndex];
		var diffTime = hitObject.startTime - offsetTime;

		if(diffTime > approachRateMS) {
			return;
		}
		if(snDiffTime == null) {
			snDiffTime = diffTime;
		}

		if(withMods.autoplay) {
			if(diffTime >= 0) {
				var dx, dy;
				if(hitObject.type != 8) {
					dx = hitObject.position.x - cursorPosInGrid.x;
					dy = hitObject.position.y - cursorPosInGrid.y;
				} else {
					dx = hitObject.position.x - cursorPosInGrid.x;
					dy = hitObject.position.y - gridH / 4 - cursorPosInGrid.y;
				}
				dx = (snDiffTime - diffTime) * (dx / snDiffTime);
				dy = (snDiffTime - diffTime) * (dy / snDiffTime);
				cursorPos = new Point(gamefieldCenterBaseX + (cursorPosInGrid.x + dx), gamefieldCenterBaseY + (cursorPosInGrid.y + dy));
				cursorEl.style.left = gamefieldCenterBaseX + (cursorPosInGrid.x + dx - cursorR + BorderWidth / 2) + 'px';
				cursorEl.style.top = gamefieldCenterBaseY + (cursorPosInGrid.y + dy - cursorR + BorderWidth / 2) + 'px';
			}
		}
		if(diffTime <= 1) {
		  	if(!hitObject.autoHit) {
		  		if(withMods.autoplay) {
					mousePosOnHitTime = new Point(cursorPos.x, cursorPos.y);
					inputKeyOverlayer.count(autoplayInputKeySeq[autoplayInputKeySeqIndex]);
				} else {//Relax
					mousePosOnHitTime = mousePos;
				}
		  		judgementHit();
				hitObject.autoHit = true;
		  		if(withMods.autoplay) {
					inputKeyOverlayer.down(autoplayInputKeySeq[autoplayInputKeySeqIndex]);
					if(hitObject.type == 1) {
						autoplayInputKeySeqIndex++;
					}
					keyIsUping = true;
				} else {
					inputKeyOverlayer.down();
				}
		  	}
		}
		if(diffTime <= 0) {
			if(withMods.autoplay) {
				cursorPosInGrid = hitObject.position.copy();
			}
			if(hitObject.type == 2) {//暂时只能画直线
				drawSliderMove(hitObject, offsetTime);
			} else if(hitObject.type == 8) {
				drawSpinnerMove(hitObject, offsetTime);
			} else {
				snDiffTime = null;
				moveHitObjectIndex++;
			}
		}
	}

	function drawSliderMove(hitObject, offsetTime) {
		if(sliderDiffTime == null) {
			if(withMods.autoplay && skinConfig.general.cursorExpand) {
				cursorCrEl.transform = 'scale(1.2)';
				cursorCrEl.style.transform = cursorCrEl.transform;
			}
			sliderDiffTime = getSliderSegmentTimeLength(hitObject);
			sliderRepeat = 1;
		}
		var repeatOneTime = sliderDiffTime;
		var diffTime = repeatOneTime - (hitObject.startTime + repeatOneTime * sliderRepeat - offsetTime);
		if(withMods.autoplay) {
			var revPoint, dx, dy;
			if(sliderRepeat % 2 != 0) {
				dx = hitObject.nodePos.lastValue().x - hitObject.position.x;
				dy = hitObject.nodePos.lastValue().y - hitObject.position.y;
				revPoint = hitObject.position;
			} else {
				dx = hitObject.position.x - hitObject.nodePos.lastValue().x;
				dy = hitObject.position.y - hitObject.nodePos.lastValue().y;
				revPoint = hitObject.nodePos.lastValue();
			}
			dx = diffTime * (dx / repeatOneTime);
			dy = diffTime * (dy / repeatOneTime);
			mousePos.x = gamefieldCenterBaseX + revPoint.x + dx;
			mousePos.y = gamefieldCenterBaseY + revPoint.y + dy;
			cursorEl.style.left = gamefieldCenterBaseX + (revPoint.x + dx - cursorR + BorderWidth / 2) + 'px';
			cursorEl.style.top = gamefieldCenterBaseY + (revPoint.y + dy - cursorR + BorderWidth / 2) + 'px';
		}
		if(diffTime >= repeatOneTime) {
			if(sliderRepeat == hitObject.repeat) {
				moveHitObjectIndex++;
				snDiffTime = null, sliderDiffTime = null;
				if(withMods.autoplay) {
					cursorPosInGrid = (sliderRepeat % 2 != 0 ?
						hitObject.nodePos.lastValue() : hitObject.position).copy();
					if(skinConfig.general.cursorExpand) {
						cursorCrEl.transform = '';
						cursorCrEl.style.transform = cursorCrEl.transform;
					}
					inputKeyOverlayer.up(autoplayInputKeySeq[autoplayInputKeySeqIndex++]);
				} else {
					inputKeyOverlayer.up();
				}
			}
			sliderRepeat++;
		}
	}

	function drawSpinnerMove(hitObject, offsetTime) {
		if(withMods.autoplay) {
			var sdeg = (offsetTime - hitObject.startTime) * 3 % 360 + 3;
			cursorEl.style.transformOrigin = gridH / 4 + 'px 0px';// scale(1.2)
			cursorEl.style.transform = 'translate(' + -60 + 'px,' + (40) + 'px) rotate(' + sdeg + 'deg)';
			cursorEl.style.left = gamefieldCenterBaseX + (cursorPosInGrid.x - cursorR + BorderWidth / 2) + 'px';
			cursorEl.style.top = gamefieldCenterBaseY + (cursorPosInGrid.y - cursorR + BorderWidth / 2)  + 'px';
		}
		if(hitObject.endTime - offsetTime <= 0) {
			moveHitObjectIndex++;
			snDiffTime = null;
			if(withMods.autoplay) {
				cursorEl.style.transform = '';
				cursorEl.style.transformOrigin = '';
				if(skinConfig.general.cursorExpand) {
					cursorCrEl.transform = '';
					cursorCrEl.style.transform = cursorCrEl.transform;
				}
				inputKeyOverlayer.up(autoplayInputKeySeq[autoplayInputKeySeqIndex++]);
				keyIsUping = false;
			}
		}
	}

	this.drawInTimeMove = function drawInTimeMove(autoplayStartTime, offsetTime) {
		var diffTime = autoplayStartTime - offsetTime;
		if(snDiffTime == null) {
			snDiffTime = diffTime;
		}
		if(diffTime <= 0) {
			cursorPosInGrid = gamefieldCenter.copy();
			snDiffTime = null;
		}
		var dy = Math.floor(gamefieldCenter.y - cursorPosInGrid.y);
		dy = (snDiffTime - diffTime) * (dy / snDiffTime);
		cursorEl.style.top = gamefieldCenterBaseY + (cursorPosInGrid.y + dy - cursorR + BorderWidth / 2) + 'px';
	};
}

/*
回放
*/
function Replayer() {
	var lastTime;
	var replayArray = [];
	var index;

	this.setData = function(replayData) {
		replayArray = replayData;
	};

	this.getReplay = function() {
		return replayArray;
	}

	this.init = function() {
		if(replayMode) {
			index = 0;
		} else {
			replayArray = [];
		}
	}
	this.start = function(t) {
	}
	/*
		@param actionNo number 动作代码，定义如下:
		LeftClickKeyDown	1
		RightClickKeyDown	2
		LeftClickKeyUp		3
		RightClickKeyUp		4
		MouseButton1Down	5
		MouseButton2Down	6
		MouseButton1Up		7
		MouseButton2Up		8
	*/
	this.putAction = function(actionNo) {
		replayArray.push([skipOffsetTime + Math.floor(new Date().getTime() - timerStartTime),
			Math.round(mousePos.x * (gridW / gamefieldW)),
			Math.round(mousePos.y * (gridH / gamefieldH)),
			actionNo]);
	}

	this.putMouseMove = function(mousePos) {
		replayArray.push([skipOffsetTime + Math.floor(new Date().getTime() - timerStartTime),
			Math.round(mousePos.x * (gridW / gamefieldW)),
			Math.round(mousePos.y * (gridH / gamefieldH)),
			0]);
	}

	this.draw = function(offsetTime) {
		if(index > replayArray.length - 1
				|| offsetTime < replayArray[index][0]) {
			return;
		}

		var n = replayArray[index][3];
		++index;
		switch(n) {
		case 1:
		case 2:
			mousePosOnHitTime = mousePos;
			inputKeyOverlayer.count(n - 1);
			judgementHit();
			if(skinConfig.general.cursorExpand) {//多处重复代码，待优化
				cursorCrEl.transform = 'scale(1.2)'
				cursorCrEl.style.transform = cursorCrEl.transform;
			}
			inputKeyOverlayer.down(n - 1);
			break;
		case 3:
		case 4:
			mousePosOnHitTime = mousePos;
			inputKeyOverlayer.count(n - 3);
			judgementHit();
			if(skinConfig.general.cursorExpand) {
				cursorCrEl.transform = 'scale(1.2)'
				cursorCrEl.style.transform = cursorCrEl.transform;
			}
			inputKeyOverlayer.up(n - 3);
			break;
		case 5:
		case 6:
			inputKeyOverlayer.count(n - 3);
			if(skinConfig.general.cursorExpand) {
				cursorCrEl.transform = ''
				cursorCrEl.style.transform = cursorCrEl.transform;
			}
			inputKeyOverlayer.down(n - 3);
			break;
		case 7:
		case 8:
			inputKeyOverlayer.count(n - 5);
			if(skinConfig.general.cursorExpand) {
				cursorCrEl.transform = ''
				cursorCrEl.style.transform = cursorCrEl.transform;
			}
			inputKeyOverlayer.up(n - 5);
			break;
		}
		mousePos.x = replayArray[index][1] * (gamefieldW / gridW);
		mousePos.y = replayArray[index][2] * (gamefieldH / gridH);
		cursorEl.style.left = (mousePos.x- cursorR) + 'px';
		cursorEl.style.top = (mousePos.y - cursorR) + 'px';
	}
}

function backSoloFromModSelection() {
  modCalc();
  getElement('#solo').style.display = 'block';
  getElement('#modSelection').style.display = 'none';
  nowScreen = 'solo';
}

function showKeySettings() {
	gameKeydown = document.onkeydown;

	var bindingKeyTr;
	getElement('#keySettings table tr', true).forEach(function(tr){
		tr.children[1].innerHTML = String.fromCharCode(settings.keyBinds[tr.getAttribute('name')]);

		tr.onclick = function() {
			bindingKeyTr = this;
			getElement('#bindingKeyName').innerHTML = this.children[0].innerHTML;
			getElement('#bingdingMsg').style.display = 'block';
			nowScreen = 'keySettings_binding';
		};
	});
	document.onkeydown = function(event) {
		if(event.code == 27) {
			if(nowScreen == 'keySettings_binding') {
				getElement('#bingdingMsg').style.display = 'none';
				nowScreen = 'keySettings';
			} else if(nowScreen == 'keySettings') {
				backOptionsFromKeySettings();
			}
		} else if(65 <= event.keyCode && event.keyCode <= 90) {//暂不接受非字母按键
			settings.keyBinds[bindingKeyTr.getAttribute('name')] = event.keyCode;
			bindingKeyTr.children[1].innerHTML = event.key.toUpperCase();
			getElement('#bingdingMsg').style.display = 'none';
			nowScreen = 'keySettings';
		}
	}
	getElement('#options').style.display = 'none';
	getElement('#keySettings').style.display = 'block';
	nowScreen = 'keySettings';
}

function backOptionsFromKeySettings() {
	document.onkeydown = gameKeydown;
	getElement('#keySettings').style.display = 'none';
	getElement('#options').style.display = 'block';
	nowScreen = 'menu';
	config.save();
}

function resetAllMods() {
	Object.keys(withMods).forEach(function(modName){
		getElement('#' + modName).checked = false;
		getElement('#' + modName).onchange();
	});
}

function initModsEventHandler() {
	getElement('#easy').onchange = function() {
		withMods.easy = this.checked;
		withMods.hardRock = getElement('#hardRock').checked = false;
		selectMod(this);
		selectMod(getElement('#hardRock'));
	};

	getElement('#noFail').onchange = function() {
		withMods.noFail = this.checked;
		selectMod(this);
	};

	getElement('#hardRock').onchange = function() {
		withMods.hardrock = this.checked;
		withMods.easy = getElement('#easy').checked = false;
		selectMod(this);
		selectMod(getElement('#easy'));
	};

	getElement('#halfTime').onchange = function() {
		if(!devMode) return;
		withMods.halfTime = this.checked;
		withMods.doubleTime = getElement('#doubleTime').checked = false;
		selectMod(this);
		selectMod(getElement('#doubleTime'));
	};

	getElement('#doubleTime').onchange = function() {
		if(!devMode) return;
		withMods.doubleTime = this.checked;
		withMods.halfTime = getElement('#halfTime').checked = false;
		selectMod(this);
		selectMod(getElement('#halfTime'));
	};

	getElement('#hidden').onchange = function() {
		withMods.hidden = this.checked;
		selectMod(this);
	};

	getElement('#relax').onchange = function() {
		if(!withMods.autoplay) {
			withMods.relax = this.checked;
			selectMod(this);
		}
	};
	getElement('#relax2').onchange = function() {
		if(!devMode) return;
		if(!(withMods.autoplay || withMods.relax)) {
			withMods.relax2 = this.checked;
			selectMod(this);
		}
	};
	getElement('#spunOut').onchange = function() {
		if(!withMods.autoplay) {
			withMods.spunOut = this.checked;
			selectMod(this);
		}
	};

	getElement('#autoplay').onchange = function() {
		withMods.autoplay = this.checked;
		selectMod(this);
		withMods.relax = getElement('#relax').checked = false;
		withMods.spunOut = getElement('#spunOut').checked = false;
		selectMod(getElement('#relax'));
		selectMod(getElement('#spunOut'));
	};
}

function selectMod(input) {
	if(input.checked) {
		input.parentNode.style.transform = 'rotate(4deg) scale(1.3)';
	} else {
		input.parentNode.style.transform = '';
	}
  var selectedModNames = [];
  for(var modName in withMods) {
	  if(withMods[modName])
		selectedModNames.push(modName.charAt(0).toUpperCase() + modName.substring(1));
  }
  for(var modName in withMods) {
	userWithMods[modName] = withMods[modName];
  }

	calcModScoreMultiplier(withMods);
	getElement('#scoreMultiplier').parentNode.style.color =
		modScoreMultiplier == 1 ? 'white' : modScoreMultiplier > 1 ? 'green' : 'red';
	getElement('#scoreMultiplier').innerHTML = modScoreMultiplier.toFixed(2);

  getElement('#selectedModNames').innerHTML = selectedModNames.join(',');
}

function calcModScoreMultiplier(withMods) {
	modScoreMultiplier = 1.00;
	if(withMods.hardRock && withMods.hidden) {
		modScoreMultiplier = 1.12;
	} else if(withMods.hidden && withMods.noFail && withMods.easy) {
		modScoreMultiplier = 0.27;
	} else if(withMods.hidden && withMods.easy) {
		modScoreMultiplier = 0.53;
	} else if(withMods.hidden && withMods.noFail) {
		modScoreMultiplier = 0.53;
	} else if(withMods.hardRock || withMods.hidden) {
		modScoreMultiplier = 1.06;
	} else if(withMods.easy) {
		modScoreMultiplier = 0.50;
	} else if(withMods.noFail) {
		modScoreMultiplier = 0.50;
	}

	if(withMods.relax || withMods.relax2) {
		modScoreMultiplier = 0;
	}
}

var inited = false;
function init() {
	if(inited) return;
	showLoading(false);

	divKeyOverlayArray = getElement('#gameplay #keyOverlay>div', true);
	progress = getElement('#gameplay #progress');
	percent = getElement('#gameplay #percent');
	gamefield = getElement('#gameplay #gamefield');
	divCombo = getElement('#gameplay #divCombo');
	divScoring = getElement('#gameplay #scoring');
	divAccuracy = getElement('#gameplay #accuracy');
	canvas = getElement('canvas');
	canvasContext = canvas.getContext('2d');


  //
  getElement("#solo>[name=back],#grades>[name=back]", true).forEach(function(btn){
	  btn.style.width = '155px';
	  btn.style.height = scaleHeight(imageDataTable['menu-back'], 155) + 'px';
	  btn.style.backgroundImage = imageDataTable['menu-back'].url;
  });

  getElement('#toolbox>#mods').style.backgroundImage = imageDataTable['selection-mods'].url;
  getElement('#toolbox>#random').style.backgroundImage = imageDataTable['selection-random'].url;

  getElement("#modSelection input", true).forEach(function(input){
	  input.parentNode.style.backgroundImage = imageDataTable['selection-mod-' + input.id.toLowerCase()].url;
  });
  getElement('#skip').style.width = imageDataTable['play-skip'].width + 'px';
  getElement('#skip').style.height = imageDataTable['play-skip'].height + 'px';
  getElement('#skip').style.backgroundImage = imageDataTable['play-skip'].url;
  getElement('#grades>[name=rankingPanel]').style.backgroundImage = imageDataTable['ranking-panel'].url;
  getElement('#grades>[name=rankingTitle]').style.backgroundImage = imageDataTable['ranking-title'].url;

	initMouseEvent();
	initKeyEvent();
	initWindowResizeEvent();
	window.resizes = 0;
	window.onresize();
	document.body.style.backgroundImage = imageDataTable['menu-background'].url;
	document.body.style.backgroundSize = windowWidth + 'px ' + windowHeight + 'px';


	getElement('#musicPlayerBtns').style.display = 'block';
	initMusicAudioEvent();

	cursor = new Cursor();
	volumeControl = new VolumeControl();
	audioManager = new AudioManager();
	mainMenu = new MainMenu();
	options = new Options();


	function initKeyEvent() {
		document.onkeydown = function(event) {
			if(event.repeat) return;
			switch(event.keyCode) {
				case settings.keyBinds.LeftClick:
					clickKeyDown(0);
					break;
				case settings.keyBinds.RightClick:
					clickKeyDown(1);
					break;
				}
				switch(event.keyCode) {
					case 27://escape
						if(nowScreen == 'modSelection') {
							backSoloFromModSelection();
						} else if(nowScreen == 'solo'){
							getElement('#solo [name=back]').onclick();
						} else if(nowScreen == 'gameplay'){
							if(!(withMods.autoplay || replayMode)) {
								musicAudio.pause();
								getElement('#gamefieldMenu').style.display = 'block';
							} else {//自动表演和回放模式直接退出
								backSolo();
							}
							gameplaying = false;
							pause = true;
						} else if(nowScreen == 'grades') {
							getElement('#grades>[name=back]').onclick();
						} else if(nowScreen == 'menu'){
							if(options.poppedOut) {
								return options.onKeyDown(event);
							}
							if(confirm('确认退出?')) {
								window.close();
							}
						} else if(nowScreen == 'keySettings'){
							backOptionsFromKeySettings();
						}
						break;
				case 32://space
					if(skiping) {
						getElement('#skip').click();
					}
					break;
				case 112://F1
					getElement('#toolbox>#mods').onclick();
					break;
				case 113://F2
					getElement('#toolbox>#random').onclick();
					break;
				}
		};
		document.onkeyup = function(event){
			//按键回弹上事件，在游戏中且除自动表演外，会改变光标和影响按键表示框
			if(gameplaying && !replayMode) {
				switch(event.keyCode) {
				case settings.keyBinds.LeftClick:
					clickKeyUp(0);
					break;
				case settings.keyBinds.RightClick:
					clickKeyUp(1);
					break;
				}
			}
		};

		function clickKeyDown(keyIndex) {
			if(gameplaying && !replayMode) {
				if(!withMods.autoplay) {
					if(!skiping)
						replayer.putAction(keyIndex + 1);
					inputKeyOverlayer.count(keyIndex);
				}
				if(!(withMods.autoplay || withMods.relax)) {
					mousePosOnHitTime = mousePos;
					judgementHit();
				}
				if(!withMods.autoplay) {
					if(skinConfig.general.cursorExpand) {
						cursorCrEl.transform = 'scale(1.2)';
						cursorCrEl.style.transform = cursorCrEl.transform;
					}
					inputKeyOverlayer.down(keyIndex);
				}
			}
		}
		function clickKeyUp(keyIndex) {
			if(!withMods.autoplay && !replayMode) {
				if(!skiping)
					replayer.putAction(keyIndex + 3);
				if(skinConfig.general.cursorExpand) {
					cursorCrEl.transform = '';
					cursorCrEl.style.transform = cursorCrEl.transform;
				}
				inputKeyOverlayer.up(keyIndex);
			}
		}
	}

	function initMouseEvent() {
		document.onmousemove = function(event){
			//注意是nowScreen == 'gameplay'，而非gameplaying，为了进入gameplay时就不能点击
			if(!((withMods.autoplay || replayMode) && nowScreen == 'gameplay')) {
				//mouseEvent = event;
				mousePos.x = event.clientX;
				mousePos.y = event.clientY;
				cursorEl.style.left = (mousePos.x- cursorR) + 'px';
				cursorEl.style.top = (mousePos.y - cursorR) + 'px';
			}
			if(gameplaying && !skiping && !(withMods.autoplay || replayMode)) {
				replayer.putMouseMove(mousePos);
			}
		};
		document.onmousedown = function(event) {
			if(gameplaying && settings.mouseKeyInGameplayingDisabled) return;
			if(gameplaying && !replayMode) {
				var whichKeyIndex = {1: 2, 3: 3}[event.which];
				if(!withMods.autoplay) {
					if(!skiping)
						replayer.putAction(6 + (whichKeyIndex - 3));
					inputKeyOverlayer.count(whichKeyIndex);
					inputKeyOverlayer.down(whichKeyIndex);

				}
				if(!(withMods.autoplay || withMods.relax)) {
					mousePosOnHitTime = mousePos;
					judgementHit(whichKeyIndex);
				}
			}
			if(!(withMods.autoplay && gameplaying) && !replayMode && skinConfig.general.cursorExpand) {
				cursorCrEl.transform = 'scale(1.2)'
				cursorCrEl.style.transform = cursorCrEl.transform;
			}
		};
		document.onmouseup = function(event) {
			if(gameplaying && settings.mouseKeyInGameplayingDisabled) return;
			if(gameplaying && !withMods.autoplay && !replayMode) {
				var whichKeyIndex = {1: 2, 3: 3}[event.which];
				if(!skiping)
					replayer.putAction(6 + (whichKeyIndex - 3) + 2);
				inputKeyOverlayer.up(whichKeyIndex);
			}
			if(!(withMods.autoplay && gameplaying) && !replayMode) {
				cursorCrEl.transform = '';
				cursorCrEl.style.transform = cursorCrEl.transform;
			}
		};
		document.onmousewheel = function(event) {
			volumeControl.onMouseWheel(event);
		};
	}
	inited = true;
}


function initGame(){
	window.onresize();
	var selectionDivs = getElement('#toolbox>div', true);
	selectionDivs.forEach(function(div){
		if(div.id == 'line') return;
		div.onmouseover = function(){ this.style.backgroundImage = this.style.backgroundImage.replace(/\.png/, '-over.png'); };
		div.onmouseout = function(){ this.style.backgroundImage = this.style.backgroundImage.replace(/-over\.png/, '.png'); };
	});
	initModsEventHandler();

	getElement('#toolbox>#mods').onclick = function(){
          playUIEffectSound('menuclick');
	  getElement('#solo').style.display = 'none';
	  //document.body.style.background = 'black';
	  getElement('#modSelection').style.display = 'block';
	  nowScreen = 'modSelection';
	};
	getElement('#toolbox>#random').onclick = function(){
      playUIEffectSound('menuclick');
	  isSystemSelect = true;
	  songSelect.options[randInt(0, Beatmaps.length)].onclick();
	  isSystemSelect = false;
	};

	btnStart = getElement('#btnStart');
	btnStart.onmouseover = function() { this.style.transform = 'scale(1.2)'; };
	btnStart.onmouseout = function() { this.style.transform = 'scale(1)'; };
	btnStart.onclick = function(){
		if(musicAudio.canplay || waitGameplayingMode) {
			playUIEffectSound('menuhit');
			getElement('#solo').style.display = 'none';
			getElement('#gameplay').style.display = 'block';
			nowScreen = 'gameplay';
			start();
		}
	}
	getElement('#grades>[name=replayButton]').onclick = function(){
		if(musicAudio.canplay || waitGameplayingMode) {
			stopUIEffectSound('applause');
			getElement('#grades').style.display = 'none';
			getElement('#solo').style.display = 'none';
			getElement('#gameplay').style.display = 'block';
			nowScreen = 'gameplay';
			if(!selectedScoreDetails.withMods || selectedScoreDetails.withMods.indexOf(1) == -1) {
				replayer.setData(selectedScoreDetails.replay);
				replayMode = true;
			}
			start();
		}
	};
	getElement('#btnContinue').onclick = function(){
		if(pause)
			musicAudio.play();
		pause = false;
		getElement('#gamefieldMenu').style.display = 'none';
	};
	getElement('#gamefieldMenu #btnBack').onclick = function(){
		musicAudio.currentTime = getKikaStartTime();
		backSolo();
	};

	getElement('#skip').onclick = function() {
		if(pause || !gameplaying) return;
		playUIEffectSound('menuhit');
		musicAudio.currentTime = ms2s(hitObjects[0].startTime - approachRateMS);
		this.style.display = 'none';
		skiping = false;
	};
	getElement('#solo>[name=back]').onclick = function(){
	  playUIEffectSound('menuback');
	  getElement('#solo').style.display = 'none';
	  getElement('#menu').style.display = 'block';
	  nowScreen = 'menu';
	};
	getElement('#grades>[name=back]').onclick = function() {
	  playUIEffectSound('menuback');
	  stopUIEffectSound('applause');
	  getElement('#grades').style.display = 'none';
	  getElement('#solo').style.display = 'block';
	  showRanking(selectedBeatmap);
	  nowScreen = 'solo';
	}

	getElement('#songSelectOp [name="group"]').onchange = function(){};
	getElement('#songSelectOp [name="sort"]').onchange = function(){
		if(Beatmaps.length == 0) return;
		switch(this.value) {
			case 'artist':
				Beatmaps.sort(function(m1, m2){
					return m1.metadata.artist.charCodeAt(0) - m2.metadata.artist.charCodeAt(0);
				});
				break;
			case 'bpm':
				Beatmaps.sort(function(m1, m2){
					return parseInt(m1.bpmInfo) - parseInt(m2.bpmInfo);
				});
				break;
			case 'creator':
				Beatmaps.sort(function(m1, m2){
					return m1.metadata.creator.charCodeAt(0) - m2.metadata.creator.charCodeAt(0);
				});
				break;
			case 'difficulty':
				Beatmaps.sort(function(m1, m2){
					return m1.difficulty.overallDifficulty - m2.difficulty.overallDifficulty;
				});
				break;
			case 'length': break;
			case 'title':
				Beatmaps.sort(function(m1, m2){
					return m1.metadata.title.charCodeAt(0) - m2.metadata.title.charCodeAt(0);
				});
				break;
			case 'beatmapSetID':
				Beatmaps.sort(function(m1, m2){
					var r = m1.metadata.beatmapSetID - m2.metadata.beatmapSetID;
					return r != 0 ? r : m1.metadata.beatmapID - m2.metadata.beatmapID;
				});
				break;
			case 'beatmapID':
				Beatmaps.sort(function(m1, m2){
					return m1.metadata.beatmapID - m2.metadata.beatmapID;
				});
				break;
		}
		refreshSongSelect();
	};

	//auto auto
	if(!withMods.autoplay)
		getElement('#autoplay').click();
}

function refreshSongSelect() {
	songSelect = getElement('#songSelectColl>select');
	songSelect.innerHTML = '';
	songSelect.size = Math.min(Beatmaps.length+1, Math.floor((windowHeight - 262) / 70));
	var fragment = document.createDocumentFragment();
	for(var i = 0; i < Beatmaps.length; i++){
		var option = document.createElement('option');
		option.value = i;
		var metadata = Beatmaps[i].metadata;
		option.text = metadata.title + "   |"
			+ metadata.artist + ' //' + metadata.creator + "|"
			+ metadata.version;
		option.onclick = function(){
			if((nowScreen == 'solo') && !isSystemSelect && nowSelectedIndex == this.index) {
				nowSelectedIndex = this.index;
				selectedBeatmap = Beatmaps[nowSelectedIndex];
				setNetContent(selectedBeatmap);
				if(musicAudio.canplay || waitGameplayingMode) {
					btnStart.onclick();
				}
				return false;
			}

			this.selected = true;
			nowSelectedIndex = this.index;
			selectedBeatmap = Beatmaps[nowSelectedIndex];
			showLoading();
			musicAudio.src = getSongsBasePath(selectedBeatmap) + selectedBeatmap.general.audioFilename;
			musicAudio.canplay = false;
			if(nowScreen == 'solo') {
				//从KIAI Mode时间开始播放
				musicAudio.currentTime = getKikaStartTime();
			}
			musicAudio.play();
		};

		fragment.appendChild(option);
	}
	songSelect.appendChild(fragment);
	getElement('#songSelectColl').style.display = 'block';
}

function initMusicAudioEvent() {
	musicAudio.ontimeupdate = function() {
	    if(pause || !gameplaying) return;

		var currentTime = musicAudio.currentTime;
		//console.log('currentTime', currentTime)
		if(s2ms(currentTime) >= hitObjects[0].startTime - approachRateMS) {
			getElement('#skip').style.display = 'none';
			skiping = false;
		}
		progress.style.width = (s2ms(currentTime) / hitObjects[hitObjects.length - 1].startTime * 100).toFixed(2) + '%';
	};

	musicAudio.onplay = function(){
	  if(pause || !gameplaying) return;
	};
	musicAudio.onseeked = function(){
	    if(pause || !gameplaying) return;
	    pause = true;
	    cancelAnimationFrame(timer);
	    pause = false;
	    skipOffsetTime = s2ms(musicAudio.currentTime);
	    cursorEl.style.left = gamefieldCenterBaseX + (gamefieldCenter.x - cursorR + BorderWidth / 2) + 'px';
	    cursorEl.style.top =  gamefieldCenterBaseY + (gridH * 1.2 + cursorR * 4) + 'px';
	    startAnimationFrame();
	};
	musicAudio.onpause = function(){
		this.lastState = 'pause';
		sleepStartTime = new Date().getTime();
		cancelAnimationFrame(timer);
	};
	musicAudio.onloadedmetadata = function(){
		if(!gameplaying) {
			calc();
			modCalc();
			changeBackground();
			selectedBeatmap.metadata.length = Math.floor(musicAudio.duration / 60).pad2() + ':' + Math.ceil(musicAudio.duration % 60).pad2();
			showSongDesc(selectedBeatmap);
			setNetContent(selectedBeatmap);
			showRanking(selectedBeatmap);
			getElement('#playerNowplaying').innerHTML = getSongNormalTitle(selectedBeatmap);
			showLoading(false);
		}
	};
	musicAudio.onended = function(){
  	if(nowScreen == 'solo') {
  	  musicAudio.currentTime = getKikaStartTime();
  	  musicAudio.play();
  	} else if(nowScreen == 'menu'){
  		getElement('#musicPlayerBtns #next').onclick();
  	}
	};
	musicAudio.onerror = function(){
		showLoading(false);
		console.log('该文件发生错误:\n' + decodeURI(this.src) + '');
		this.canplay = false;
		waitGameplayingMode = false;
	};
	musicAudio.oncanplaythrough = function(){
		this.canplay = true;
	};
}
function initMusicPlayerEvent() {
	getElement('#musicPlayerBtns #prev').onclick = function() {
		if(nowSelectedIndex - 1 >= 0) {
		  nowSelectedIndex--;
		} else {
		  nowSelectedIndex = Beatmaps.length - 1;
		}
		songSelect.options[nowSelectedIndex].onclick();
	};
	getElement('#musicPlayerBtns #next').onclick = function() {
		if(nowSelectedIndex + 1 < /*playTraces.length*/Beatmaps.length) {
		  nowSelectedIndex++;
		} else {
		  nowSelectedIndex = 0;
		}
		songSelect.options[nowSelectedIndex].onclick();
	};
	getElement('#musicPlayerBtns #pause').onclick = function() {
		if(musicAudio.paused)
			musicAudio.play();
		else
			musicAudio.pause();
	};
	getElement('#musicPlayerBtns #stop').onclick = function() {
		musicAudio.pause();
		musicAudio.currentTime = 0;
	};
	getElement('#musicPlayerBtns #play').onclick = function() {
		musicAudio.play();
	};
}

function startAnimationFrame() {
	var lastUpdateTime = 0;
	var hitObjectIndex = 0;
	var currentTimingPointIndex = 0;
	currentTimingPoint = timingPoints[currentTimingPointIndex];
	var autoplayStartTime, autoplayInTimeDone = true;
	var waitAllEnd = false;
	if(withMods.autoplay) {
		autoplayStartTime = hitObjects[0].startTime - approachRateMS - 1;
		autoplayInTimeDone = false;
	}
	timerStartTime = new Date().getTime();
	replayer.start();
	timer = requestAnimationFrame(function(){
		if(pause) {
			cancelAnimationFrame(timer);
			return;
		}
		var callTimeout = lastUpdateTime != 0 ? Math.floor(new Date().getTime() - lastUpdateTime) : 1;

		if(autoplayInTimeDone && fpsMode == 60){
   			offsetTime = skipOffsetTime + Math.floor(new Date().getTime() - timerStartTime);
   			draw(offsetTime);
			if(replayMode) {
				replayer.draw(offsetTime);
				if(withMods.relax) {
					autoPlayer.draw(offsetTime);
				}
				judgement(offsetTime);
			} else if(withMods.autoplay || withMods.relax) {
				autoPlayer.draw(offsetTime);
				judgement(offsetTime);
			} else {
				judgement(offsetTime);
			}
			offsetTime = skipOffsetTime + Math.floor(new Date().getTime() - timerStartTime);
			drawHitScore(offsetTime);
   		}
		for(var time = callTimeout - 1; time >= 0; time--) {
			offsetTime = skipOffsetTime + (Math.floor(new Date().getTime() - timerStartTime) - time);
			//offsetTime = currentTime - time;
			if(autoplayInTimeDone) {
				//currentTimingPoint必须在过程中计算？
				if(currentTimingPointIndex < timingPoints.length &&
					offsetTime >= timingPoints[currentTimingPointIndex].startTime) {
					currentTimingPoint = timingPoints[currentTimingPointIndex];
					currentTimingPointIndex++;
				}
				//while多个同时物件的情况
				while(hitObjectIndex < hitObjects.length && offsetTime >= hitObjects[hitObjectIndex].startTime - approachRateMS){
					arHitObjects.push(hitObjects[hitObjectIndex]);
					hitObjectIndex++;
				}

				if(fpsMode == 61) {
					draw(offsetTime);
					if(replayMode) {
						replayer.draw(offsetTime);
						if(withMods.relax) {
							autoPlayer.draw(offsetTime);
						}
						judgement(offsetTime);
					} else if(withMods.autoplay || withMods.relax) {
						autoPlayer.draw(offsetTime);
						judgement(offsetTime);
					} else {
						judgement(offsetTime);
					}
					drawHitScore(offsetTime);
				}
				if(hitObjectIndex > hitObjects.length - 1 && arHitObjects.length == 0 && !waitAllEnd) {
					var goodTimeout = 1000;
					setTimeout(gameplayEnd, goodTimeout);
					waitAllEnd = true;
				}
			} else {
				if(autoplayStartTime - offsetTime <= approachRateMS) {
					autoPlayer.drawInTimeMove(autoplayStartTime, offsetTime);
					if(autoplayStartTime - offsetTime <= 0) {
						autoplayInTimeDone = true;
					}
				}
			}
		}
		if(skinConfig.general.cursorRotate)
			cursor.drawRotate(new Date().getTime());

		lastUpdateTime = new Date().getTime();
		timer = requestAnimationFrame(arguments.callee);
	});
}

function getKikaStartTime() {
	var playStartTime = 0;
	calcTimingPoints();
	for(var tp = 0; tp < timingPoints.length; tp++) {
		if(timingPoints[tp].kiai)
			break;
	}
	var hasKika = tp < timingPoints.length;
	if(hasKika) {
		playStartTime = timingPoints[tp].startTime;
	} else if(selectedBeatmap.general.previewTime > 0) {
		playStartTime = selectedBeatmap.general.previewTime;
	}
	return ms2s(playStartTime);
}

function calcCircleRadius(circleSize) {
	return + (23.05 + (7 - circleSize) * 4.48).toFixed(2);
}
function calc() {
	selectedBeatmap.general.sampleSet = selectedBeatmap.general.sampleSet || "Normal";
	audioLeadIn = parseInt(selectedBeatmap.general.audioLeadIn);
	if(selectedBeatmap.difficulty.approachRate) {
		approachRate = selectedBeatmap.difficulty.approachRate;
	} else {
		approachRate = selectedBeatmap.difficulty.overallDifficulty;
	}
	stackLeniency = selectedBeatmap.general.stackLeniency || 0.3;
	selectedBeatmap.difficulty.circleSize = +selectedBeatmap.difficulty.circleSize;
	approachRate = Math.abs(approachRate);
	approachRateMSStep = 150;
	if(0 <= parseInt(approachRate) && parseInt(approachRate) <= 5)
		approachRateMSStep = 120;
	approachRateMS = DefaultModARMSTable[parseInt(approachRate)]
		- (approachRate - parseInt(approachRate)) * approachRateMSStep;
	circleRadius = calcCircleRadius(selectedBeatmap.difficulty.circleSize);
	var comboColours = [];
	var sliderBorder;
	if(settings.useCustomColours || selectedBeatmap.fileFormatVersion <= 3) {
		for(var i = 2; skinConfig.colours['combo'+i]; i++) {
			comboColours.push(skinConfig.colours['combo'+i]);
		}
		comboColours.push(skinConfig.colours['combo1']);
	} else {
		for(var key in selectedBeatmap.colours) {
			if(/^combo\d+$/.test(key)) {
				comboColours.push(selectedBeatmap.colours[key]);
			} else if(key == 'SliderBorder') {
				sliderBorder = selectedBeatmap.colours[key];
			}
		}
	}

	calcTimingPoints();

	selectedBeatmap.hitObjects.sort(function(a, b){
		var startTimeA = parseInt(a[2]);
		var startTimeB = parseInt(b[2]);
		return startTimeA - startTimeB;
	});

	countCircles = countSliders = countSpinners = 0;
	hitObjects = [];
	var currComboColourIndex = 0, currComboNumber = 1;

	var firstHitObjectType = parseInt(selectedBeatmap.hitObjects[0][3]) % 16;
	if([1,2,8].indexOf(firstHitObjectType) == -1) {
		selectedBeatmap.hitObjects[0][3] = firstHitObjectType = firstHitObjectType - 4;
	}
	if(firstHitObjectType == 8) {
		var secondHitObjectType = parseInt(selectedBeatmap.hitObjects[1][3]) % 16;
		if([1,2,8].indexOf(secondHitObjectType) == -1)
			selectedBeatmap.hitObjects[1][3] = secondHitObjectType - 4;
		currComboNumber = 0;
	}
	selectedBeatmap.hitObjects.forEach(function(array, index){
		var hitObject = new HitObject();
		hitObjects.push(hitObject);

		hitObject.index = index;
		hitObject.position.x = parseInt(array[0]);
		hitObject.position.y = parseInt(array[1]);
		hitObject.startTime = parseInt(array[2]);

		/*
		物品类型
		整除16，结果为跳过新颜色数量，
		余数：1=圆圈，2=滑条，8=转盘，其余值为要开始新颜色（下一个颜色）并-4按1,2,8处理）*/
		var type = parseInt(array[3]);
		hitObject.comboColourOffset = Math.floor(type / 16);
		type %= 16;
		if([1,2,8].indexOf(type) > -1) {
			hitObject.comboColourIndex = currComboColourIndex;
			hitObject.comboNumber = currComboNumber;
			hitObject.type = type;
		} else {
			currComboColourIndex = (currComboColourIndex + 1 + hitObject.comboColourOffset) % comboColours.length;
			hitObject.comboColourIndex = currComboColourIndex;
			hitObject.comboNumber = currComboNumber = 1;
			hitObject.newCombo = true;
			hitObject.type = type - 4;
		}
		if(hitObject.comboNumber == 1 && index > 0) {
			hitObjects[index - 1].lastInCombo = true;
		}
		currComboNumber++;
		hitObject.colour = comboColours[hitObject.comboColourIndex];

		if(hitObject.type == 1) countCircles++;
		else if(hitObject.type == 8) countSpinners++;

		if(hitObject.type == 2) {
			var ls = array[5].split('|');
			hitObject.sliderType = ls[0];
			hitObject.nodePos = ls.slice(1).map(function(s){
				return new Point(+s.split(':')[0], +s.split(':')[1]);
			});
			if(hitObject.nodePos.length == 2 && hitObject.nodePos[0].equals(hitObject.position)) {
				hitObject.nodePos = hitObject.nodePos.slice(1);
			}
			hitObject.repeat = + array[6];
			hitObject.pixelLength = + array[7];
		} else if(hitObject.type == 8) {
			hitObject.endTime = + array[5];
		}

		/*（总体）音效，整除2的商：1357=哨声，2367=击钹，4567=拍手 */
		var soundType = array[4] / 2;
		hitObject.soundType = [];
		hitObject.soundTypeFilenames = [];
		hitObject.soundTypeFilepaths = [];

		hitObject.soundType.push('hitnormal');
		var objPrefix;
		if(hitObject.type == 1) {
			objPrefix = 'hit';
		} else if(hitObject.type == 2) {
			objPrefix = 'slider';
		} else if(hitObject.type == 8){
		}

		if([1,3,5,7].indexOf(soundType) > -1)
			hitObject.soundType.push(objPrefix + 'whistle');
		if([2,3,6,7].indexOf(soundType) > -1)
			hitObject.soundType.push(objPrefix + 'finish');
		if([4,5,6,7].indexOf(soundType) > -1)
			hitObject.soundType.push(objPrefix + 'clap');

		if(hitObject.type == 2) {
			hitObject.soundType.push('sliderslide');
		}

		var timingPoint = timingPoints[0];
		if(timingPoints.length == 1) {
			timingPoint = timingPoints[0];
		} else if(timingPoints.length > 1) {
			for(var ti = 1; ti < timingPoints.length; ti++) {
				if(hitObject.startTime < timingPoints[ti].startTime) {
				  timingPoint = timingPoints[ti - 1];
				  break;
				}
			}
		}
		var sampleSet, useBase, nStr;
		if(timingPoint.custom) {
			useBase = getSongsBasePath(selectedBeatmap);
			if(soundType != 0)
				nStr = Math.abs(timingPoint.custom) == 1 ? '' : Math.abs(timingPoint.custom);
			else
				nStr = '';
		} else {
			useBase = useSkinBasePath;
			nStr = '';
		}
		if(timingPoint.sampleSet) {
			sampleSet = timingPoint.sampleSet;
		} else {
			sampleSet = selectedBeatmap.general.sampleSet.toLowerCase();
		}

		for(var si = 0; si < hitObject.soundType.length; si++) {
			var filename = sampleSet + '-' + hitObject.soundType[si] + nStr + '.wav';
			var filepath = useBase + filename;
			hitObject.soundTypeFilenames.push(filename);
			hitObject.soundTypeFilepaths.push(filepath);
		}
	});
	hitObjects[0].newCombo = true;
	hitObjects[hitObjects.length - 1].lastInCombo = true;

	for(var i = 0; i < hitObjects.length; i++) {
		//处理叠放次序，时间点靠前的放在最上，靠后的放在最下
		hitObjects[i].stackIndex = hitObjects.length * 5 - i * 5 - 1;
		//调整间距，编辑器到实际游戏区域
		hitObjects[i].position.x *= 1.2;
		hitObjects[i].position.y *= 1.2;

		for(var nodei = 0; nodei < hitObjects[i].nodePos.length; nodei++) {
			hitObjects[i].nodePos[nodei].x *= 1.2;
			hitObjects[i].nodePos[nodei].y *= 1.2;
		}
	}

	//堆叠效果，当遇到相同位置的并且时间相隔又很近的物件
	for(var i = hitObjects.length - 1; i > 0; ) {
		var hitObject = hitObjects[i];
		var j = i - 1;
		while(j >= 0 && hitObject.startTime - hitObjects[j].startTime <= stackLeniency * approachRateMS
			&& hitObject.position.equals(hitObjects[j].position))
			j--;
		if(j  < i - 1) {
			var offset = BorderWidth - 1;
			for(; i > 0 && i > j + 1; i--) {
				hitObjects[i - 1].position.x = hitObjects[i].position.x - offset;
				hitObjects[i - 1].position.y = hitObjects[i].position.y - offset;
				for(var nodei = 0; nodei < hitObjects[i].nodePos.length; nodei++) {
					if(hitObjects[i - 1].nodePos.length > nodei) {
						hitObjects[i - 1].nodePos[nodei].x = hitObjects[i].nodePos[nodei].x - offset;
						hitObjects[i - 1].nodePos[nodei].y = hitObjects[i].nodePos[nodei].y - offset;
					}
				}
			}
		} else {
			i--;
		}
	}

  var bpmInfo = '?';
 	var bpms = timingPoints.filter(function(p){ return p.inherited; }).map(function(p){ return p.bpm; }).sort(function(a,b) { return a-b; });
 	if(bpms.length > 0) {
 		var minBPM = Math.floor(bpms[0]), maxBPM = Math.floor(bpms.lastValue());
 		bpmInfo = minBPM == maxBPM ? maxBPM : minBPM + '-' + maxBPM + ' (' + maxBPM +')';
 	} else if(bpms.length == 0){
 		bpmInfo = Math.floor(timingPoints.map(function(p){ return p.bpm; }).sort(function(a,b) { return a-b; })[0]);
 	}
 	selectedBeatmap.bpmInfo = bpmInfo;
}

function calcTimingPoints() {
  	timingPoints = [];
  	var mainPoints = [];
		selectedBeatmap.timingPoints.forEach(function(array){
			var timingPoint = new TimingPoint();
			timingPoint.startTime = parseFloat(array[0]);
			var bpmNum = (60000 / array[1]);
			if(bpmNum < 0) {
				var bpmM = Math.abs(100 / array[1]);
				timingPoint.bpm = mainPoints[mainPoints.length - 1].bpm * bpmM;
			} else {
				timingPoint.bpm = bpmNum;
				//if(+ array[6] == 1)
				mainPoints.push(timingPoint);
			}
			timingPoint.bpm = + timingPoint.bpm.toFixed(2);
			timingPoint.sampleSet = ['normal','soft','drum'][array[3] - 1];
			timingPoint.custom = + array[4];//Default,Custom 1,2,3..
			timingPoint.volume = array[5] != undefined ? + parseInt(array[5]) : 100;
			timingPoint.inherited = !!parseInt(array[6]);
			timingPoint.kiai = !!parseInt(array[7]);
			timingPoints.push(timingPoint);
		});
}

function modCalc() {
	if(!selectedBeatmap) return;
	currPlaybackRate = 1;
	if(withMods.easy) {
		approachRate = EZModARTable[parseInt(approachRate)];
		var f = approachRate - parseInt(approachRate);
		approachRateMS = parseInt(DefaultModARMSTable[parseInt(approachRate)] - f * approachRateMSStep);
		circleRadius = calcCircleRadius(selectedBeatmap.difficulty.circleSize - 1);
	}

	if(withMods.hardRock) {
		approachRate = HRModARTable[parseInt(approachRate)];
		var f = approachRate - parseInt(approachRate);
		approachRateMS = parseInt(DefaultModARMSTable[parseInt(approachRate)] - f * approachRateMSStep);
		circleRadius = calcCircleRadius(selectedBeatmap.difficulty.circleSize + 1);
	}

	if(withMods.doubleTime) {
		currPlaybackRate = 1.5;
		approachRate = DTModARTable[parseInt(approachRate)];
		var f = approachRate - parseInt(approachRate);
		if(parseInt(approachRate) > 10) {
			f += parseInt(approachRate) - 10;
			approachRate = 10;
		}
		approachRateMS = parseInt(DefaultModARMSTable[parseInt(approachRate)] - f * approachRateMSStep);
	}

	if(withMods.halfTime) {
		currPlaybackRate = 0.75;
		approachRate = HTModARTable[parseInt(approachRate)];
		approachRateMS = parseInt(DefaultModARMSTable[parseInt(approachRate)]
			- (approachRate - parseInt(approachRate)) * approachRateMSStep);
	}

	approachRateMS = parseInt(approachRateMS);
}

function getSliderSegmentTimeLength(hitObject) {
  return Math.round((600 / currentTimingPoint.bpm) * hitObject.pixelLength / selectedBeatmap.difficulty.sliderMultiplier);
}

function judgementSlide(sx, sy) {
	//参数需要一个时间，而不是动画坐标
	var hitObject = arHitObjects[0];
	if(!hitObject) return;
	var ra = circleRadius * 4.6 / 2;
	var posRight = Math.abs(mousePos.x - (gamefieldCenterBaseX + sx)) < ra
		&& Math.abs(mousePos.y - (gamefieldCenterBaseY + sy)) < ra;

	var nowVolume = settings.volumes.master * settings.volumes.effect * currentTimingPoint.volume / 1000000;
	var audio = effectAudioList[hitObject.index].lastValue();
	if(!audio.src) {
		audio.src = hitObject.soundTypeFilepaths.lastValue();
		audio.volume = nowVolume;
		audio.play();
	}
	if(nowKeyIsDown && posRight) {
		if(audio.currentTime >= audio.duration / 2) {
			audio.currentTime = 0;
			audio.play();
		}
		audio.volume = nowVolume;
	} else {
		audio.volume = 0;
	}
	return nowKeyIsDown && posRight;
}

function judgementEndSlide(sx, sy) {
	//参数需要一个时间，而不是动画坐标
	var hitObject = arHitObjects[0];
	if(!hitObject) return;
	var ra = circleRadius * 4.6 / 2;
	var posRight = Math.abs(mousePos.x - (gamefieldCenterBaseX + sx)) < ra
		&& Math.abs(mousePos.y - (gamefieldCenterBaseY + sy)) < ra;
	if(nowKeyIsDown && posRight) {
		playEffectSound(hitObject, 1);
		if(hitObject.ssliderRepeat == hitObject.repeat) {
			hitObject.hitS = true;
		}
		comboAddOne();
		drawCombo();
	}
	return nowKeyIsDown && posRight;
}

function judgementHit() {
	if(arHitObjects.length == 0) return;

	var offsetTime = skipOffsetTime + Math.floor(new Date().getTime() - timerStartTime)//作为点击时间点
	var hitObject = arHitObjects[0];
	var hitScoreIndex = -1;

	var ra = circleRadius + BorderWidth;
	var posRight = Math.abs(mousePosOnHitTime.x - (gamefieldCenterBaseX + hitObject.position.x)) < ra
		&& Math.abs(mousePosOnHitTime.y - (gamefieldCenterBaseY + hitObject.position.y)) < ra;
	if(!posRight) return;//如果光标不在圈上，不判定分数
	if(hitObject.type == 1) {
		if(Math.abs(offsetTime - hitObject.startTime) <= OD300) {
			removeCircleElements(hitObject);
			hitScoreIndex = 3;
		} else if(Math.abs(offsetTime - hitObject.startTime) <= OD100) {
			removeCircleElements(hitObject);
			hitScoreIndex = 2;
		} else if(Math.abs(offsetTime - hitObject.startTime) <= OD50) {
			removeCircleElements(hitObject);
			hitScoreIndex = 1;
		} else if(Math.abs(offsetTime - hitObject.startTime) > OD50){
			removeCircleElements(hitObject);
			hitScoreIndex = 0;
		}
	} else if(hitObject.type == 2) {
		if(Math.abs(offsetTime - hitObject.startTime) <= OD50) {//暂时判断松
			hitObject.hit = true;
			playEffectSound(hitObject, 0);
			comboAddOne();
			drawCombo();
		}
	}

	if(hitScoreIndex != -1) {
		if(hitScoreIndex > 0) {
			playEffectSound(hitObject);
		}
		arHitObjects = arHitObjects.filter(function(e){ return e.stackIndex != hitObject.stackIndex; });
		var number = [0,50,100,300][hitScoreIndex];
		hitObject.scoreNumber = number;
		var tipType = '';
		if(hitObject.lastInCombo) {
			if(number > 50) {
				var counts = {0: 0, 50: 0, 100: 0, 300: 0};
				var comboLength = 1;
				counts[hitObject.scoreNumber]++;
				if(hitObject.index > 0) {
					for(var i = hitObject.index - 1; !hitObjects[i].newCombo; i--)
						counts[hitObjects[i].scoreNumber]++;
					counts[hitObjects[i].scoreNumber]++;
					comboLength = hitObject.index - i + 1;
				}

				if(counts[300] == comboLength) {
					tipType = 'g';
					hitCounts[5]++;
				} else if(counts[0] + counts[50] == 0) {
					tipType = 'k';
					hitCounts[4]++;
				}
			}
		}
		hitScores = [{hitTime: offsetTime, number: number, tipType: tipType, srcHitObject: hitObject}].concat(hitScores);

		if(hitScoreIndex > 0) {
			comboAddOne();
		} else {
			combo = 0;
		}
		drawCombo();
		hitCounts[hitScoreIndex]++;
		drawScoreAndAccuracy(number);
	}
}


function judgement(offsetTime) {
	hitObject = arHitObjects[0];
	if(!hitObject) return;

	var length;
	if(hitObject.type == 1) {
		length = 0;
	} else if(hitObject.type == 2) {
		length = getSliderSegmentTimeLength(hitObject) * hitObject.repeat;
	} else if(hitObject.type == 8) {
		length = hitObject.endTime - hitObject.startTime;
	}

	var hitScoreIndex = -1;
	if(hitObject.type == 1) {
		if(!hitObject.hit && offsetTime - hitObject.startTime > OD50) {//判定miss
			removeCircleElements(hitObject);
			hitScoreIndex = 0;
		}
	} else if(hitObject.type == 2) {
		if(offsetTime - hitObject.startTime >= length) {//判定miss
			var audio = effectAudioList[hitObject.index].lastValue();
			audio.pause();

			if(hitObject.hit && hitObject.hitS) {
				removeSliderElements(hitObject);
				hitScoreIndex = 3;
			} else if(hitObject.hit || hitObject.hitS) {
				removeSliderElements(hitObject);
				hitScoreIndex = 2;
			} else {
				removeSliderElements(hitObject);
				hitScoreIndex = 0;
			}
		}
	} else if(hitObject.type == 8) {
		if(offsetTime - hitObject.startTime >= length) {
			removeSpinnerElements(hitObject);
			hitScoreIndex = 3;
			playEffectSound(hitObject);
			comboAddOne();
			drawCombo();
		}
	}

	if(hitScoreIndex != -1) {
		arHitObjects = arHitObjects.filter(function(e){ return e.stackIndex != hitObject.stackIndex; });

		//加分
		var number = [0,50,100,300][hitScoreIndex];
		hitObject.scoreNumber = number;
		var tipType = '';
		if(hitObject.lastInCombo) {
			if(number > 50) {
				var counts = {0: 0, 50: 0, 100: 0, 300: 0};
				var comboLength = 1;
				counts[hitObject.scoreNumber]++;
				if(hitObject.index > 0) {
					for(var i = hitObject.index - 1; !hitObjects[i].newCombo; i--)
						counts[hitObjects[i].scoreNumber]++;
					counts[hitObjects[i].scoreNumber]++;
					comboLength = hitObject.index - i + 1;
				}

				if(counts[300] == comboLength) {
					tipType = 'g';
					hitCounts[5]++;
				} else if(counts[0] + counts[50] == 0) {
					tipType = 'k';
					hitCounts[4]++;
				}
			}
		}
		hitScores = [{hitTime: offsetTime, number: number, tipType: tipType, srcHitObject: hitObject}].concat(hitScores);
		if(hitScoreIndex <= 0) {
			combo = 0;
		}
		drawCombo();
		hitCounts[hitScoreIndex]++;
		drawScoreAndAccuracy(number);
	}

}

function getBackgroundPath(beatmap) {
	var bgi = 0;
	if(beatmap.events.length > 0) {
		while(beatmap.events[bgi] && !/^\d+$/.test(beatmap.events[bgi][0])) bgi++;
		if(/^\d+$/.test(beatmap.events[bgi][2]))
			return null;
		var filepath = beatmap.events[bgi][2];
		filepath = getSongsBasePath(beatmap) + filepath.substring(1, filepath.length - 1);
		return filepath;
	}
	return null;
}

function changeBackground() {
	reset('none', 0);
	var imgPath = getBackgroundPath(selectedBeatmap);
	if(imgPath == null) {
		reset(imageDataTable['menu-background'].url, windowWidth + 'px ' + windowHeight + 'px');
		return;
	}
	var loadBeatmapID = selectedBeatmap.metadata.beatmapID;
	var img = new Image();
	img.src = imgPath;
	img.onload = function() {
		if(gameplaying || nowScreen == 'grades' || selectedBeatmap.metadata.beatmapID != loadBeatmapID) return;
		var url = 'url("' + img.src + '")';
		var backgroundSize = windowWidth + 'px ' + scaleHeight({width:windowWidth, height:windowHeight}, windowWidth) + 'px';
		reset(url, backgroundSize);
	};
	img.onerror = function() {
		reset(imageDataTable['menu-background'].url, windowWidth + 'px ' + windowHeight + 'px');
	}

	function reset(url, backgroundSize) {
		getElement('#solo').style.backgroundSize = backgroundSize;
		getElement('#solo').style.backgroundImage = url;
		getElement('#solo').style.backgroundRepeat = 'no-repeat';
		getElement('#gameplay').style.backgroundSize = backgroundSize;
		getElement('#gameplay').style.backgroundImage = url;
		getElement('#gameplay').style.backgroundRepeat = 'no-repeat';

		getElement('#grades').style.backgroundSize = backgroundSize;
		getElement('#grades').style.backgroundImage = url;
		getElement('#grades').style.backgroundRepeat = 'no-repeat';
	}

}


function getSongNormalTitle(beatmap) {
  return beatmap.metadata.artist + ' - ' + beatmap.metadata.title + '[' + beatmap.metadata.version + ']';
}

function getSongShowTitle(beatmap) {
	var source = beatmap.metadata.source;
	if(source) {
		source += ' (' + beatmap.metadata.artist + ')';
  } else {
  	source = beatmap.metadata.artist;
  }
  return source + ' - ' + beatmap.metadata.title + '[' + beatmap.metadata.version + ']';
}

function showSongDesc(beatmap) {
	getElement('#songDesc>*',true).forEach(function(e){
		e.style.display = 'block'
	});
	getElement('#songDesc [name="songName"]').innerHTML = getSongShowTitle(beatmap);
	getElement('#songDesc [name="creator"]').innerHTML = beatmap.metadata.creator;
  getElement('#songDesc [name="length"]').innerHTML = beatmap.metadata.length;
  getElement('#songDesc [name="bpm"]').innerHTML = beatmap.bpmInfo;
  getElement('#songDesc [name="objects"]').innerHTML = beatmap.hitObjects.length;
  countSliders = beatmap.hitObjects.length - countCircles - countSpinners;
  getElement('#songDesc [name="circles"]').innerHTML = countCircles;
  getElement('#songDesc [name="sliders"]').innerHTML = countSliders;
  getElement('#songDesc [name="spinners"]').innerHTML = countSpinners;
  getElement('#songDesc [name="cs"]').innerHTML = beatmap.difficulty.circleSize;
  getElement('#songDesc [name="ar"]').innerHTML = beatmap.difficulty.approachRate || beatmap.difficulty.overallDifficulty;
  getElement('#songDesc [name="od"]').innerHTML = beatmap.difficulty.overallDifficulty;
  getElement('#songDesc [name="hp"]').innerHTML = beatmap.difficulty.HPDrainRate;
  getElement('#songDesc [name="stars"]').innerHTML = '?';

  var odInfo = '缩圈时间（AR）：' + approachRateMS + 'ms，'
  	+ '300：+-' + OD300 + 'ms，'
  	+ '100：+-' + OD100 + 'ms，'
  	+ '50：+-' + OD50 + 'ms';
  getElement('#odInfo').setAttribute('title', odInfo);
}

function setNetContent(beatmap) {
  var url = 'http://osu.ppy.sh/';
  if(beatmap.metadata.beatmapID)
	url += 'b/' + beatmap.metadata.beatmapID;
  else if(beatmap.metadata.beatmapSetID)
	url += 's/' + beatmap.metadata.beatmapSetID;
  getElement('#songDesc #netContent>a').href = url;
}

function clearGamefield() {
	//getElement('#gameplay').style.backgroundSize = windowWidth + 'px ' + windowHeight + 'px';
	for(var circles = getElement('.circle,.slider,.sliderball,.approachcircle,.sliderfollowcircle,.spinner,.pointer,.hitScore', true), i = 0; i < circles.length; i++) {
	  circles[i].style.display = 'none';
	  gamefield.removeChild(circles[i]);
	}
}

function initGameplayUI() {
	//window.onresize();
	showLoading();
	getElement('#skip').style.display = 'none';
	getElement('#gamefieldMenu').style.display = 'none';
	getElement('#gamefield').style.backgroundColor = 'rgba(0,0,0,' + (settings.dimValue / 100)  +')';
	document.title = 'osu!\t\t- ' + getSongNormalTitle(selectedBeatmap);
	progress.style.width = '0%';

	divCombo.innerHTML = '';
	divScoring.innerHTML = '00000000';
	divAccuracy.innerHTML = '100.00%';

	showWithMods(withMods, getElement('#gameplay>#withMods'), 'right');
}

function start() {
	gamefieldW = windowWidth;
	gamefieldH = windowHeight;
	gamefieldCenterBaseX = Math.floor((windowWidth - gridW * 1.2) / 2);
	gamefieldCenterBaseY = Math.floor((windowHeight - gridH * 1.2) / 2);
	combo = 0, maxCombo = 0, scoring = 0, accuracy = 100.00;
	hitScores = [];
	hitCounts = [0,0,0,0,0,0];
	pause = false, skiping = false;
	gameplaying = true;
	arHitObjects = [];
	replayer.init();

	if(settings.limitFPS == 0) {
		if(withMods.autoplay || replayMode) {
			fpsMode = 61;
		} else {
			fpsMode = 60;
		}
	} else {
		fpsMode = settings.limitFPS;
	}

	if(!replayMode) {
		for(var modName in userWithMods) {
			withMods[modName] = userWithMods[modName];
		}
	} else {
		for(var k in withMods) {
			withMods[k] = false;
		}
		if(selectedScoreDetails.withMods) {
			var modi = 1;
			for(var k in withMods) {
				if(selectedScoreDetails.withMods.indexOf(modi) > -1)
					withMods[k] = true;
				modi++;
			}
		}
	}


	calc();
	modCalc();
	calcModScoreMultiplier(withMods);

	initGameplayUI();
	cursor.automaticCursorSizing();
	inputKeyOverlayer.init();

	if(withMods.autoplay || withMods.relax) {
		autoPlayer.init();
	}

	if(musicAudio.canplay && !waitGameplayingMode) {
		cursor.changeAutoCursor();
		musicAudio.pause();
		var requestStartTime =  new Date().getTime();
		effectAudioList = [];
		loadAndOverrideBeatmapSkinResources(hitObjects, function(){
		  setTimeout(function(){
			showLoading(false);
			if(nowScreen == 'gameplay') {
				if(timingPoints[0].startTime > 5000 || hitObjects[0].startTime > 5000 || audioLeadIn > 5000) {
					getElement('#skip').style.display = 'block';
					skiping = true;
				}

				timerStartTime = new Date().getTime();
				musicAudio.playbackRate = currPlaybackRate;
				musicAudio.currentTime = 0;
				musicAudio.play();
			}
		  }, audioLeadIn - (new Date().getTime() - requestStartTime));
		});
	}
}

function showWithMods(withMods, parentDiv, dir) {
	parentDiv.innerHTML = '';
	var modIndex = 0;
	for(var modName in withMods) {
		if(withMods[modName]) {
			var divMod = document.createElement('div');
			var filename = modName.toLowerCase();
			if(modName == 'auto') filename = 'autoplay';
			divMod.style.width = '50px';
			divMod.style.height = '46px';
			divMod.style.backgroundImage = imageDataTable['selection-mod-' + filename].url;
			divMod.style[dir] = (10 + 55 * modIndex++) + 'px';
			parentDiv.appendChild(divMod);
		}
	}
}

function gameplayEnd() {
	stopGameplay();

	if(!replayMode) {
		//保存分数
		var username = (!withMods.autoplay ? 'player' : '!osu');
		selectedScoreDetails = {
			playerUsername: username,
			date: new Date().format('dd/MM/yyyy HH:mm:ss'),
			hitCounts: hitCounts.concat(),
			score: scoring,
			accuracy: accuracy.toFixed(2),
			combo: maxCombo,
			ranking: calcRanking(),
			replay: replayer.getReplay().concat()
		};
		var withModNs = [];
		var modi = 1;
		for(var k in withMods) {
			if(withMods[k])
				withModNs.push(modi);
			modi++;
		}
		if(withModNs.length > 0) {
			selectedScoreDetails.withMods = withModNs.concat();
		}

		if(!withMods.autoplay) {
			if(!scoresDB[selectedBeatmap.metadata.beatmapID]) {
				scoresDB[selectedBeatmap.metadata.beatmapID] = [];
			}
			scoresDB[selectedBeatmap.metadata.beatmapID].push(selectedScoreDetails);
		}
		showNewGrades(selectedScoreDetails);
	} else {
		showOldGrades(selectedScoreDetails);
		replayMode = false;
	}
}


function showRanking(beatmap) {
	var scores = scoresDB[beatmap.metadata.beatmapID];
	if(scores && scores.length > 0) {
		scores.sort(function(score1, score2){
			var r = score2.score - score1.score;
			if(r == 0)
				r = score2.accuracy - score1.accuracy;
			if(r == 0) {
				var ds1 = score1.date.split(' ');
				var dss1 = ds1[0].split('/').reverse().join('/') + ' ' + ds1[1];
				var ds2 = score2.date.split(' ');
				var dss2 = ds2[0].split('/').reverse().join('/') + ' ' + ds2[1];
				r = new Date(dss2) - new Date(dss1);
			}
			return r;
		});
		rankingSelect = getElement('#ranking>select');
		rankingSelect.innerHTML = '';
		rankingSelect.size = Math.max(2, Math.min(scores.length, Math.floor((windowHeight - 250) / 44)));

		getElement('#ranking').style.width = Math.min(windowWidth - 700 - 40, 360) + 'px';
		getElement('#ranking').style.height = rankingSelect.size * 44 + 4 + 'px';
		getElement('#ranking').style.display = 'block';
		var fragment = document.createDocumentFragment();
		for(var i = 0; i < scores.length; i++){
			var score = scores[i];

			var showMods = [];
			if(score.withMods && score.withMods.length > 0) {
				var modi = 1;
				for(var k in withMods) {
					if(score.withMods.indexOf(modi) > -1)
						showMods.push(modSimpleNameTable[k]);
					modi++;
				}
			}

			var option = document.createElement('option');
			option.value = i;
			option.style.backgroundImage = 'url("' + useSkinBasePath + 'ranking-' + score.ranking + '-small.png")';
			option.innerHTML = '&nbsp;'.repeat(16) + score.playerUsername + '&nbsp;'
				+ '得分:' + score.score + '&nbsp;(' + score.combo + 'x)' + '&nbsp;&nbsp;&nbsp;'
				+ score.accuracy + '%' + '&nbsp;'
				+ showMods.join(',');

			option.index = i;
			option.onclick = function(){
				selectedScoreDetails = scoresDB[selectedBeatmap.metadata.beatmapID][this.index];
				getElement('#solo').style.display = 'none';
				showOldGrades(selectedScoreDetails);
			};
			fragment.appendChild(option);
		}
		rankingSelect.appendChild(fragment);
	} else {
		getElement('#ranking').style.display = 'none';
	}
}

function showOldGrades(scoreDetails) {
	showGrades(scoreDetails);
	if(scoreDetails.withMods && scoreDetails.withMods.length > 0) {
		var showMods = [];
		var modi = 1;
		for(var k in withMods) {
			if(scoreDetails.withMods.indexOf(modi) > -1)
				showMods[k] = true;
			modi++;
		}
	}
	showWithMods(showMods, getElement('#grades>#withMods'), 'right');
}

function showNewGrades(scoreDetails) {
	showGrades(scoreDetails);
	showWithMods(withMods, getElement('#grades>#withMods'), 'right');
	playUIEffectSound('applause');
}

function showGrades(scoreDetails) {
	document.title = 'osu!';
	getElement('#gameplay').style.display = 'none';
	getElement('#grades').style.display = 'block';
	nowScreen = 'grades';

	getElement('#grades>[name=rankingPanel]').innerHTML = '';
	getElement('#grades>[name=rankingPanel]').innerHTML += ('&nbsp;'.repeat(10) + '{0}<br>'
		+ '300:{1}&nbsp;&nbsp;激:{2}<br>'
		+ '100:{3}&nbsp;&nbsp;喝:{4}<br>'
		+ '&nbsp;50:{5}&nbsp;&nbsp;X:{6}<br>').format(scoreDetails.score,
			scoreDetails.hitCounts[3], scoreDetails.hitCounts[5],
			scoreDetails.hitCounts[2], scoreDetails.hitCounts[4],
			scoreDetails.hitCounts[1], scoreDetails.hitCounts[0])
	getElement('#grades>[name=rankingPanel]').innerHTML += 'Combo: ' + scoreDetails.combo + 'x' + '<br>';
	getElement('#grades>[name=rankingPanel]').innerHTML += 'Accuracy: ' + scoreDetails.accuracy + '%';
	getElement('#grades>[name=title]>[name=song]').innerHTML = getSongNormalTitle(selectedBeatmap);
	getElement('#grades>[name=title]>[name=creator]').innerHTML = 'Beatmap by ' + selectedBeatmap.metadata.creator;
	getElement('#grades>[name=title]>[name=date]').innerHTML = 'Played by ' + scoreDetails.playerUsername + ' on ' + scoreDetails.date + '.';
	getElement('#grades>[name=ranking]').style.backgroundImage = imageDataTable['ranking-' + scoreDetails.ranking].url;
}

function calcRanking() {
	var ranking;
	if(accuracy >= 100) {
		ranking = 'X';
		if(withMods.hidden)
			ranking += 'H';
	}
	else if(accuracy > 90) {
		ranking = 'S';
		if(withMods.hidden)
			ranking += 'H';
	}
	else if(accuracy > 80) ranking = 'A';
	else if(accuracy > 70) ranking = 'B';
	else if(accuracy > 60) ranking = 'C';
	else ranking = 'D';
	return ranking;
}

function backSolo() {
	replayMode = false;
	showLoading(false);
	stopGameplay();
	setTimeout(function(){
		document.title = 'osu!';
		getElement('#gameplay').style.display = 'none';
		getElement('#solo').style.display = 'block';
		nowScreen = 'solo';
	}, 100);
}

function stopGameplay() {
	gameplaying = false;
	waitGameplayingMode = false;
	cancelAnimationFrame(timer);
	cursor.stopPlay();
	for(var modName in userWithMods) {
		withMods[modName] = userWithMods[modName];
	}


	for(var i in effectAudioList) {
		for(var j = 0; j < effectAudioList[i].length; j++) {
			var audio = effectAudioList[i][j];
			if(audio) {
				audio.pause();
				audio.currentTime = 0;
			}
		}
	}

	clearGamefield();
}

function drawHitScore(offsetTime) {
	var hitScoreEl;
	for(var i = 0;i < hitScores.length; i++) {
		var hitScore = hitScores[i];
		if(hitScore.show) {
			hitScoreEl = hitScore.elem;
		} else {
			hitScoreEl = document.createElement('div');
			hitScoreEl.className = 'hitScore';
			hitScoreEl.style.cursor = overallCursorStyle;
			hitScoreEl.style.zIndex = hitScore.srcHitObject.stackIndex - 1;

			var srcHitObject = hitScore.srcHitObject;
			var position = srcHitObject.position;
			if(srcHitObject.type == 2) {
				position = [position, srcHitObject.nodePos.lastValue()][srcHitObject.repeat % 2];
			}
			var scoreName = 'hit' + hitScore.number + hitScore.tipType;
			var size = imageDataTable[scoreName];
			var width = circleRadius * 2;
			if(hitScore.number < 100 && hitScore.tipType == '')
				width = circleRadius * 2 / 4 * 2;
			var height = scaleHeight(size, width);
			hitScoreEl.style.left = gamefieldCenterBaseX + (position.x - width / 2) + 'px';
			var y = gamefieldCenterBaseY + (position.y - height / 2);
			hitScoreEl.y = y;
			hitScoreEl.style.top = y + 'px';
			hitScoreEl.style.width = width + 'px';
			hitScoreEl.style.height = height + 'px';
			hitScoreEl.style.backgroundImage = imageDataTable[scoreName].url;
			hitScoreEl.style.backgroundSize = 'contain';
			hitScoreEl.style.opacity = 1;
			gamefield.appendChild(hitScoreEl);
			hitScore.elem = hitScoreEl;
			hitScore.show = true;
		}

		if(offsetTime - hitScore.hitTime > 200) {
			var diffTime = (1000 - 200) - (offsetTime - hitScore.hitTime);
			hitScoreEl.style.opacity = diffTime * (1 / (1000 - 200));
			if(diffTime <= 0) {
				hitScoreEl.style.display = 'none';
				gamefield.removeChild(hitScoreEl);
				hitScores = hitScores.filter(function(e){ return e.srcHitObject.stackIndex != hitScore.srcHitObject.stackIndex; });
			}
		}
	}

}

function drawScoreAndAccuracy(hitVal) {
	//计算积分
	var difficultyMultiplier = 1;
	var comboMultiplier = Math.max(maxCombo - 1, 0);
	scoring += Math.round(hitVal + hitVal * (comboMultiplier * difficultyMultiplier * modScoreMultiplier) / 25);
	divScoring.innerHTML = '0'.repeat(8 - scoring.toString().length) + scoring;

	//计算准确度
	var hitCountTotal = hitCounts.slice(0,4).reduce(function(n, m){ return m + n }, 0);
	accuracy = (hitCounts[1] * 50 + hitCounts[2] * 100 + hitCounts[3] * 300) / (hitCountTotal * 300) * 100;
	divAccuracy.innerHTML = accuracy.toFixed(2) + '%';
}

function comboAddOne() {
	combo++;
	if(combo > maxCombo)
		maxCombo = combo;
}

function drawCombo() {
	if(combo > 0) divCombo.innerHTML = combo + 'x';
	else divCombo.innerHTML = '';
}

function playUIEffectSound(filename, volume) {
	var filepath = useSkinBasePath + filename;
	var audio = effectAudioSet[filepath + '.wav'] || effectAudioSet[filepath + '.mp3'];
	if(audio) {
		if(volume == undefined) {
			volume = 100;
		}
		audio.volume = settings.volumes.master * settings.volumes.effect * volume / 1000000;
		audio.play();
	}
}

function stopUIEffectSound(filename) {
	var filepath = useSkinBasePath + filename;
	var audio = effectAudioSet[filepath + '.wav'] || effectAudioSet[filepath + '.mp3'];
	if(audio && !audio.ended) {
		audio.pause();
		audio.currentTime = 0;
	}
}

function playEffectSound(hitObject, s) {
	var nowVolume = settings.volumes.master * settings.volumes.effect * currentTimingPoint.volume / 1000000;
	var slist = effectAudioList[hitObject.index];
	if(hitObject.type == 2) {//此音效逻辑不对
		var audio = slist[s];
		audio.src = hitObject.soundTypeFilepaths[0];
		audio.volume = nowVolume;
		audio.play();
	} else {
		for(var si = 0; si < hitObject.soundTypeFilepaths.length; si++) {
			var filepath = hitObject.soundTypeFilepaths[si];
			if(!errorFilepaths[filepath]) {
				var audio = slist[si];
				if(audio) {
					audio.src = filepath;
					audio.volume = nowVolume;
          try {
					    audio.play();
          } catch(e) {}
				}
			}
		}
	}
}

function draw(offsetTime) {
	var diffTime;
	var callTime = new Date().getTime();
	var hitObject, circle, slider, sliderEndCircle, sliderFollowCircle, sliderBall,
		spinnerCircle, spinnerBottom, spinnerTop, spinnerMiddle,
		approachcircle, pointer1, pointer2;
	for(var appi = 0; appi < arHitObjects.length; appi++) {
		hitObject = arHitObjects[appi];
		if(hitObject.disappear) continue;

		//初始化显示元素
		if(hitObject.hitCircleShow || hitObject.spinnerShow) {
			hitCircle = hitObject.hitCircleElement;
			slider = hitObject.sliderElement;
			sliderEndCircle = hitObject.sliderEndCircleElement;
			sliderFollowCircle = hitObject.sliderFollowCircleElement;
			sliderBall = hitObject.sliderBallElement;
			pointer1 = hitObject.sliderPointer1Element;
			pointer2 = hitObject.sliderPointer2Element;
			spinnerCircle = hitObject.spinnerCircleElement;
			spinnerTop = hitObject.spinnerTopElement;
			spinnerBottom = hitObject.spinnerBottomElement;
			spinnerMiddle = hitObject.spinnerMiddleElement;
			approachcircle = hitObject.approachcircleElement;
		} else {
			var fragment = document.createDocumentFragment();
			//滑条,暂时都画成直线滑条
			if(hitObject.type != 8) {
				if(hitObject.type == 2) {
					var rotateDeg = degree(hitObject.position, hitObject.nodePos.lastValue());

					slider = document.createElement('div');
					slider.className = 'slider';
					slider.style.cursor = overallCursorStyle;
					slider.style.zIndex = hitObject.stackIndex;
					slider.style.left = gamefieldCenterBaseX + (hitObject.position.x - circleRadius - BorderWidth / 2) + 'px';
					slider.style.top = gamefieldCenterBaseY + (hitObject.position.y - circleRadius - BorderWidth / 2) + 'px';
					var dx = hitObject.nodePos.lastValue().x - hitObject.position.x,
						dy = hitObject.nodePos.lastValue().y - hitObject.position.y;
					var len = Math.abs(Math.sqrt(dx * dx + dy * dy)) + circleRadius * 2/*hitObject.pixelLength * 1.2*/;
					slider.style.width = len + 'px';
					slider.style.height = circleRadius * 2 + 'px';
					slider.style.backgroundColor = 'rgb(' +
						(skinConfig.colours.sliderTrackOverride ? skinConfig.colours.sliderTrackOverride : hitObject.colour) + ')';
					slider.style.border = BorderWidth + 'px solid rgb(' + skinConfig.colours.sliderBorder + ')';
					slider.style.transformOrigin = (circleRadius + BorderWidth) + 'px' + ' '
						+ (circleRadius + BorderWidth) + 'px';
					slider.style.transform = 'rotate(' + rotateDeg + 'deg)';
					slider.style.opacity = 0.82;
					fragment.appendChild(slider);
					hitObject.sliderElement = slider;

					sliderEndCircle = document.createElement('div');
					sliderEndCircle.className = 'circle';
					sliderEndCircle.style.cursor = overallCursorStyle;
					sliderEndCircle.style.zIndex = hitObject.stackIndex;
					sliderEndCircle.style.left = gamefieldCenterBaseX + (hitObject.nodePos.lastValue().x - circleRadius - BorderWidth / 2) + 'px';
					sliderEndCircle.style.top = gamefieldCenterBaseY + (hitObject.nodePos.lastValue().y - circleRadius - BorderWidth / 2) + 'px';
					sliderEndCircle.style.width = circleRadius * 2 + 'px';
					sliderEndCircle.style.height = circleRadius * 2 + 'px';
					sliderEndCircle.style.backgroundColor = 'rgb(' + hitObject.colour + ')';
					sliderEndCircle.style.border = BorderWidth + 'px solid white';
					sliderEndCircle.style.opacity = 1;
					fragment.appendChild(sliderEndCircle);
					hitObject.sliderEndCircleElement = sliderEndCircle;

					if(hitObject.repeat > 1) {
						pointer1 = document.createElement('div');
						pointer1.className = 'pointer';
						pointer1.style.cursor = overallCursorStyle;
						pointer1.style.zIndex = hitObject.stackIndex + 2;
						var pointerW = circleRadius * 2 * 3 / 4;
						var pointerH = scaleHeight(imageDataTable['reversearrow'], pointerW);
						pointer1.style.left = gamefieldCenterBaseX + (hitObject.nodePos.lastValue().x - pointerW / 2 + BorderWidth / 2) + 'px';
						pointer1.style.top = gamefieldCenterBaseY + (hitObject.nodePos.lastValue().y - pointerH / 2 + BorderWidth / 2) + 'px';
						pointer1.style.width = pointerW + 'px';
						pointer1.style.height = pointerH + 'px';
						pointer1.style.backgroundSize = pointerW + 'px ' + pointerH + 'px';
						pointer1.style.backgroundImage = imageDataTable['reversearrow'].url;
						pointer1.style.transform = 'rotate(' + (180 + rotateDeg) + 'deg)';
						pointer1.style.opacity = 1;
						fragment.appendChild(pointer1);
						hitObject.sliderPointer1Element = pointer1;
					}
					if(hitObject.repeat > 2) {
						pointer2 = document.createElement('div');
						pointer2.className = 'pointer';
						pointer2.style.cursor = overallCursorStyle;
						pointer2.style.zIndex = hitObject.stackIndex + 2;
						pointer2.style.left = gamefieldCenterBaseX + (hitObject.position.x - pointerW / 2) + 'px';
						pointer2.style.top = gamefieldCenterBaseY + (hitObject.position.y - pointerH / 2) + 'px';
						pointer2.style.width = pointerW + 'px';
						pointer2.style.height = pointerH + 'px';
						pointer2.style.backgroundSize = pointerW + 'px ' + pointerH + 'px';
						pointer2.style.backgroundImage = imageDataTable['reversearrow'].url;
						pointer2.style.transform = 'rotate(' + rotateDeg + 'deg)';
						pointer2.style.opacity = 0;
						fragment.appendChild(pointer2);
						hitObject.sliderPointer2Element = pointer2;
					}

					sliderFollowCircle = document.createElement('div');
					sliderFollowCircle.style.display = 'none';
					sliderFollowCircle.className = 'sliderfollowcircle';
					sliderFollowCircle.style.cursor = overallCursorStyle;
					sliderFollowCircle.style.zIndex = hitObject.stackIndex + 3;
					sliderFollowCircle.size = circleRadius * 4.6;
					sliderFollowCircle.style.width = sliderFollowCircle.size  + 'px';
					sliderFollowCircle.style.height = sliderFollowCircle.size + 'px';
					sliderFollowCircle.style.backgroundSize = sliderFollowCircle.size + 'px ' + sliderFollowCircle.size + 'px';
					sliderFollowCircle.style.backgroundImage = (imageDataTable['sliderfollowcircle'] || imageDataTable['sliderfollowcircle-0']).url;
					sliderFollowCircle.style.opacity = 0;
					fragment.appendChild(sliderFollowCircle);
					hitObject.sliderFollowCircleElement = sliderFollowCircle;

					sliderBall = document.createElement('div');
					sliderBall.className = 'sliderball';
					sliderBall.style.cursor = overallCursorStyle;
					sliderBall.style.zIndex = hitObject.stackIndex + 4;
					sliderBall.style.width = circleRadius * 2 + BorderWidth * 2 + 'px';
					sliderBall.style.height = circleRadius * 2 + BorderWidth * 2 + 'px';
					sliderBall.style.left = gamefieldCenterBaseX + (hitObject.position.x - circleRadius - BorderWidth / 2) + 'px';
					sliderBall.style.top = gamefieldCenterBaseY + (hitObject.position.y - circleRadius - BorderWidth / 2) + 'px';
					sliderBall.style.transform = 'rotate(' + rotateDeg + 'deg)';
					sliderBall.rotateDeg = rotateDeg;
					fragment.appendChild(sliderBall);
					hitObject.sliderBallElement = sliderBall;
				}

				//普通圈圈,或滑条头部圈
				hitCircle = document.createElement('div');
				hitCircle.className = 'circle';
				hitCircle.style.cursor = overallCursorStyle;
				hitCircle.id = 'circle' + hitObject.stackIndex;
				hitCircle.style.zIndex = hitObject.stackIndex;
				hitCircle.style.left = gamefieldCenterBaseX + (hitObject.position.x - circleRadius - BorderWidth / 2) + 'px';
				hitCircle.style.top = gamefieldCenterBaseY + (hitObject.position.y - circleRadius - BorderWidth / 2) + 'px';
				hitCircle.style.width = circleRadius * 2 + 'px';
				hitCircle.style.height = circleRadius * 2 + 'px';
				hitCircle.style.backgroundColor = 'rgb(' + hitObject.colour + ')';
				hitCircle.style.border = BorderWidth + 'px solid rgb(255,255,255)';
				if(hitObjects.length < 5000) {//圈圈过多不显示数字
					var digits = hitObject.comboNumber.toString();
					var fontWidth = Math.floor((circleRadius - 4) / digits.length);
					var posBase = Math.floor((circleRadius * 2 - fontWidth * digits.length) / 2);
					var imageUrls = [], imagePoss = [], imageSizes = [];
					for(var i = 0; i < digits.length; i++) {
						imageUrls.push(imageDataTable[skinConfig.fonts.hitCirclePrefix + '-' + digits[i]].url);

						//var size = fontHitCirclePxSizes[digits[i]];
						//var fontHeight = size.height + (fontWidth / (size.width / size.height) - size.height);
						var fontHeight = fontWidth;
						var posCenterY = Math.floor((circleRadius * 2 - fontHeight) / 2);
						imagePoss.push(posBase + i * fontWidth + 'px ' + posCenterY + 'px ');
						imageSizes.push(fontWidth + 'px ' + fontHeight + 'px ');
					}
					hitCircle.style.backgroundImage = imageUrls.join(',');
					hitCircle.style.backgroundSize = imageSizes.join(',');
					hitCircle.style.backgroundPosition = imagePoss.join(',')

				}
				hitCircle.style.opacity = 1;
				fragment.appendChild(hitCircle);
				hitObject.hitCircleElement = hitCircle;
				hitObject.hitCircleShow = true;

				if(!withMods.hidden) {
					approachcircle = document.createElement('div');
					approachcircle.className = 'approachcircle';
					approachcircle.style.cursor = overallCursorStyle;
					approachcircle.style.zIndex = hitObject.stackIndex + 2;
					approachcircle.style.borderColor = 'rgb(' + hitObject.colour + ')';
					approachcircle.style.opacity = 0;
					fragment.appendChild(approachcircle);
					hitObject.approachcircleElement = approachcircle;
				}
			}
			//转盘
			else if(hitObject.type == 8) {
				var spinnerR = gridW / 2;
				spinnerCircle = document.createElement('div');
				spinnerBottom = document.createElement('div');
				spinnerTop = document.createElement('div');
				spinnerMiddle = document.createElement('div');
				if(imageDataTable['spinner-circle']) {
					spinnerCircle.className = 'spinner';
					spinnerCircle.style.zIndex = 5;//转盘在物件栈最底层
					spinnerCircle.style.backgroundImage = imageDataTable['spinner-circle'].url;
					spinnerCircle.style.left = gamefieldCenterBaseX + (hitObject.position.x - spinnerR - BorderWidth / 2) + 'px';
					spinnerCircle.style.top = gamefieldCenterBaseY + (hitObject.position.y - spinnerR - BorderWidth / 2) + 'px';
					spinnerCircle.style.width = spinnerR * 2 + 'px';
					spinnerCircle.style.height = spinnerR * 2 + 'px';
					spinnerCircle.style.cursor = overallCursorStyle;
				}
				if(imageDataTable['spinner-bottom']) {
					spinnerBottom.className = 'spinner';
					spinnerBottom.style.zIndex = 5;//转盘在物件栈最底层
					spinnerBottom.style.backgroundImage = imageDataTable['spinner-bottom'].url;
					spinnerBottom.style.left = gamefieldCenterBaseX + (hitObject.position.x - spinnerR - BorderWidth / 2) + 'px';
					spinnerBottom.style.top = gamefieldCenterBaseY + (hitObject.position.y - spinnerR - BorderWidth / 2) + 'px';
					spinnerBottom.style.width = spinnerR * 2 + 'px';
					spinnerBottom.style.height = spinnerR * 2 + 'px';
					spinnerBottom.style.cursor = overallCursorStyle;
				}
				if(imageDataTable['spinner-top']) {
					spinnerTop.className = 'spinner';
					spinnerTop.style.zIndex = 5;
					spinnerTop.style.backgroundImage = imageDataTable['spinner-top'].url;
					spinnerTop.style.left = gamefieldCenterBaseX + (hitObject.position.x - spinnerR - BorderWidth / 2) + 'px';
					spinnerTop.style.top = gamefieldCenterBaseY + (hitObject.position.y - spinnerR - BorderWidth / 2) + 'px';
					spinnerTop.style.width = spinnerR * 2 + 'px';
					spinnerTop.style.height = spinnerR * 2 + 'px';
					spinnerTop.style.boxShadow = '0 0 2px 0 black';
					spinnerTop.style.cursor = overallCursorStyle;
				}
				if(imageDataTable['spinner-middle']) {
					spinnerMiddle.className = 'spinner';
					spinnerMiddle.style.zIndex = 5;
					spinnerMiddle.style.backgroundImage = imageDataTable['spinner-middle'].url;
					spinnerMiddle.style.left = gamefieldCenterBaseX + (hitObject.position.x - (spinnerR + 6) - BorderWidth / 2) + 'px';
					spinnerMiddle.style.top = gamefieldCenterBaseY + (hitObject.position.y - (spinnerR + 6) - BorderWidth / 2) + 'px';
					spinnerMiddle.style.width = (spinnerR + 6) * 2 + 'px';
					spinnerMiddle.style.height = (spinnerR + 6) * 2 + 'px';
					spinnerMiddle.style.cursor = overallCursorStyle;
				}
				fragment.appendChild(spinnerCircle);
				hitObject.spinnerCircleElement = spinnerCircle;
				fragment.appendChild(spinnerBottom);
				hitObject.spinnerBottomElement = spinnerBottom;
				fragment.appendChild(spinnerTop);
				hitObject.spinnerTopElement = spinnerTop;
				fragment.appendChild(spinnerMiddle);
				hitObject.spinnerMiddleElement = spinnerMiddle;
				hitObject.spinnerShow = true;
			}
			gamefield.appendChild(fragment);
		}

		//更新帧
		if(hitObject.type != 8) {
			diffTime = hitObject.startTime - /*offsetTime*/(offsetTime + Math.floor(new Date().getTime() - callTime));
			if(withMods.hidden) {
				var opa = diffTime * (1 / approachRateMS);
				hitCircle.style.opacity = opa;
				if(slider) {
					slider.style.opacity = opa;
				}
				if(sliderEndCircle) {
					sliderEndCircle.style.opacity = opa;
				}
				if(pointer1) pointer1.style.opacity = opa;
				if(pointer2) pointer2.style.opacity = opa;
			} else {
				approachcircle.style.opacity = (approachRateMS - diffTime) * (1 / approachRateMS * 2);
				var nowBorderWidth = BorderWidth / 1.4 + diffTime * (BorderWidth / 1.4 / approachRateMS);
				approachcircle.style.borderWidth = nowBorderWidth + 'px';
				var nowAppRadius = circleRadius + BorderWidth / 2 + diffTime
					* ((circleRadius * 3.5 - circleRadius - BorderWidth / 2) / approachRateMS);
				approachcircle.style.width =  nowAppRadius * 2 + 'px';
				approachcircle.style.height = nowAppRadius * 2 + 'px';
				approachcircle.style.left = gamefieldCenterBaseX + (hitObject.position.x - nowAppRadius - nowBorderWidth / 2) + 'px';
				approachcircle.style.top = gamefieldCenterBaseY + (hitObject.position.y - nowAppRadius - nowBorderWidth / 2) + 'px';
			}

			if(diffTime <= 0) {
				if(!withMods.hidden && !hitObject.approachcircleElement.removed) {
					gamefield.removeChild(hitObject.approachcircleElement);
					hitObject.approachcircleElement.removed = true;
				}
				if(!hitObject.hitCircleElement.removed) {
					gamefield.removeChild(hitObject.hitCircleElement);
					hitObject.hitCircleElement.removed = true;
				}
				if(hitObject.type == 2) {
					if(!hitObject.segmentTimeLength) {
						hitObject.segmentTimeLength = getSliderSegmentTimeLength(hitObject);
						hitObject.ssliderRepeat = 1;
						sliderBall.sliderBallFrameIndex  = 0;
						sliderBall.frames = 0;
						sliderFollowCircle.style.opacity = 1;
					}
					var sdiffTime = hitObject.segmentTimeLength -
						(hitObject.startTime + hitObject.segmentTimeLength * hitObject.ssliderRepeat - /*offsetTime*/(offsetTime + Math.floor(new Date().getTime() - callTime)));

					var revPoint, dx, dy, dxr, dyr;
					if(hitObject.ssliderRepeat % 2 != 0) {
						dx = Math.floor(hitObject.nodePos.lastValue().x - hitObject.position.x);
						dy = Math.floor(hitObject.nodePos.lastValue().y - hitObject.position.y);
						revPoint = hitObject.position;
					} else {
						dx = Math.floor(hitObject.position.x - hitObject.nodePos.lastValue().x);
						dy = Math.floor(hitObject.position.y - hitObject.nodePos.lastValue().y);
						revPoint = hitObject.nodePos.lastValue();
					}
					dxr = dx / hitObject.segmentTimeLength, dyr = dy / hitObject.segmentTimeLength;
					dx = sdiffTime * dxr, dy = sdiffTime * dyr;
					if(judgementSlide(revPoint.x + dx, revPoint.y + dy)) {
						sliderFollowCircle.style.display = 'block';
						sliderFollowCircle.style.left = gamefieldCenterBaseX + (revPoint.x + dx - sliderFollowCircle.size / 2) + 'px';
						sliderFollowCircle.style.top = gamefieldCenterBaseY + (revPoint.y + dy - sliderFollowCircle.size / 2) + 'px';
					} else {
						sliderFollowCircle.style.display = 'none';
					}

					if((fpsMode == 61 && sliderBall.frames % 16 == 0) || fpsMode != 61) {
						sliderBall.sliderBallFrameIndex = ++sliderBall.sliderBallFrameIndex % skinConfig.general.sliderBallFrames;
						sliderBall.style.backgroundImage = imageDataTable['sliderb' + sliderBall.sliderBallFrameIndex].url;
						sliderBall.style.left = gamefieldCenterBaseX + (revPoint.x + dx - circleRadius - BorderWidth / 2) + 'px';
						sliderBall.style.top = gamefieldCenterBaseY + (revPoint.y + dy - circleRadius - BorderWidth / 2) + 'px';
					}
					sliderBall.frames++;

					if(sdiffTime >= hitObject.segmentTimeLength) {
						if(hitObject.repeat > 1) {
							if(hitObject.repeat > 2) {
								pointer2.style.opacity = 1;
							}
							if(hitObject.ssliderRepeat == hitObject.repeat - 1)
								if(hitObject.ssliderRepeat % 2 == 0) {
									pointer2.style.opacity = 0;
								} else {
									pointer1.style.opacity = 0;
								}
						}

						if(hitObject.ssliderRepeat == hitObject.repeat) {
							removeSliderElements(hitObject);
						}
						if(skinConfig.general.sliderBallFlip) {
							sliderBall.rotateDeg += 180;
							sliderBall.style.transform = 'rotate(' + sliderBall.rotateDeg + 'deg)';
						}

						judgementEndSlide(revPoint.x + dx, revPoint.y + dy);
						hitObject.ssliderRepeat++;
					}
				}
			}

		}
		else if(hitObject.type == 8) {
			if(hitObject.startTime - offsetTime <= 0) {
				var transform = '';
				if(offsetTime >= hitObject.startTime +  hitObject.length / 2) {
					transform = 'scale(1.1) ';
					spinnerMiddle.style.transform = transform;
				}
				var sdeg = (offsetTime - hitObject.startTime) % 360;
				spinnerTop.style.transform = transform + 'rotate(' + sdeg + 'deg)';
				spinnerBottom.style.transform = transform + 'rotate(' + -sdeg + 'deg)';
				if(hitObject.endTime - offsetTime <= 0) {
					spinnerTop.style.transform = 'scale(1.2)';
					removeSpinnerElements(hitObject);
				}
			}
		}
	}
}

//宽高成比例缩放公式n=w/h,h2=(w+x)/n-h,h=h+h2
function scaleHeight(size, scaleWidth) {
	return size.height + (scaleWidth / (size.width / size.height) - size.height);
}

function degree(p1,p2) {
	return Math.atan2((p2.y - p1.y), (p2.x - p1.x)) * (180 / Math.PI);
}

function removeSliderElements(hitObject) {
	removeCircleElements(hitObject);
	if(hitObject.sliderPointer1Element && !hitObject.sliderPointer1Element.removed) {
		gamefield.removeChild(hitObject.sliderPointer1Element);
		hitObject.sliderPointer1Element.removed = true;
	}
	if(hitObject.sliderPointer2Element && !hitObject.sliderPointer2Element.removed) {
		gamefield.removeChild(hitObject.sliderPointer2Element);
		hitObject.sliderPointer2Element.removed = true;
	}
	if(!hitObject.sliderFollowCircleElement.removed) {
		gamefield.removeChild(hitObject.sliderFollowCircleElement);
		hitObject.sliderFollowCircleElement.removed = true;
	}
	if(!hitObject.sliderBallElement.removed) {
		gamefield.removeChild(hitObject.sliderBallElement);
		hitObject.sliderBallElement.removed = true;
	}
	if(!hitObject.sliderEndCircleElement.removed) {
		gamefield.removeChild(hitObject.sliderEndCircleElement);
		hitObject.sliderEndCircleElement.removed = true;
	}
	if(!hitObject.sliderElement.removed) {
		gamefield.removeChild(hitObject.sliderElement);
		hitObject.sliderElement.removed = true;
	}
	hitObject.disappear = true;
}

function removeSpinnerElements(hitObject) {
	if(!hitObject.spinnerCircleElement.removed) {
		gamefield.removeChild(hitObject.spinnerCircleElement);
		hitObject.spinnerCircleElement.removed = true;
	}
	if(!hitObject.spinnerTopElement.removed) {
		gamefield.removeChild(hitObject.spinnerTopElement);
		hitObject.spinnerTopElement.removed = true;
	}
	if(!hitObject.spinnerMiddleElement.removed) {
		gamefield.removeChild(hitObject.spinnerMiddleElement);
		hitObject.spinnerMiddleElement.removed = true;
	}
	if(!hitObject.spinnerBottomElement.removed) {
		gamefield.removeChild(hitObject.spinnerBottomElement);
		hitObject.spinnerBottomElement.removed = true;
	}
	hitObject.disappear = true;
}

function removeCircleElements(hitObject) {
	if(!withMods.hidden && !hitObject.approachcircleElement.removed) {
		gamefield.removeChild(hitObject.approachcircleElement);
		hitObject.approachcircleElement.removed = true;
	}
	if(!hitObject.hitCircleElement.removed) {
		gamefield.removeChild(hitObject.hitCircleElement);
		hitObject.hitCircleElement.removed = true;
	}
	hitObject.disappear = true;
}

function showLoading(b) {
	var elem = getElement('#loading');
	elem.style.left = (windowWidth - 16) / 2 + 'px';
	elem.style.top = (windowHeight - 16) / 2 + 'px';
	elem.style.display = b === undefined ? 'block' : 'none';
}

function randInt(n, m) {
  return Math.floor(Math.random() * (m - n)) + n;
}

function s2ms(s) { return Math.floor(s * 1000); }
function ms2s(ms) { return Math.floor(ms / 1000); }

function getSongsBasePath(beatmap) {
	var artist = beatmap.metadata.artist.replace(/\./g, '');
	var title = beatmap.metadata.title.replace(/\./g, '');
	return songshome + 'Songs/' + beatmap.metadata.beatmapSetID + ' ' + artist + ' - ' + title + '/';
}

function pathsep(path) {
	path = path.replace(/\\/g,'/');
	var endc = path.charAt(path.length - 1);
	return endc == '/' ? path :  path + '/';
}

function loadGameBasicResources(callback) {
	//全局界面中的声音
	var wavFilenames = ["menuhit", "menuclick", "menuback", "applause"];
	var mp3Filenames = ["applause"];
	var pngFilenames = [
		"cursor", "cursormiddle",
		"play-skip", "menu-back",
		"selection-mods", "selection-random",
		"selection-mods-over", "selection-random-over",
		"selection-mod-easy", "selection-mod-nofail", "selection-mod-halftime",
		"selection-mod-hardrock", "selection-mod-suddendeath", "selection-mod-doubletime",
		"selection-mod-hidden",
		"selection-mod-relax", "selection-mod-relax2", "selection-mod-spunout",
		"selection-mod-autoplay",
		"ranking-panel", "ranking-title",
		"ranking-A", "ranking-B", "ranking-C", "ranking-D", "ranking-S", "ranking-X", "ranking-SH", "ranking-XH",
		//gameplay
		"spinner-circle", "spinner-bottom", "spinner-top", "spinner-middle",
		"hit0", "hit50", "hit100", "hit300", "hit300g", "hit300k", "hit100k",
		"reversearrow", "sliderfollowcircle","sliderfollowcircle-0",
	];
	var jpgFileanmes = ["menu-background"];
	var randomDefaultBgReqs = [];
	if(settings.skinName == 'Default') {
		jpgFileanmes = [];
		var bgs = ["bg1"];
		randomDefaultBgReqs = [{contentType: 'image', filename: "menu-background",
			filepath: useSkinBasePath + bgs[randInt(0, bgs.length)] + '.jpg', cache: true}];
	}
	var appPngFilenames = ["transparent"];

	//滑条球帧
	for(var i = 0; i < skinConfig.general.sliderBallFrames; i++) {
		pngFilenames.push('sliderb' + i);
	}
	//字体
	for(var i = 0; i < 10; i++) {
		pngFilenames.push(skinConfig.fonts.hitCirclePrefix + '-' + i);
	}

	loadResources([]
		.concat(wavFilenames.map(function(filename){
			return {contentType: 'audio', filepath: useSkinBasePath + filename + '.wav', cache: true}; }))
		.concat(pngFilenames.map(function(filename){
			return {contentType: 'image', filename: filename, filepath: useSkinBasePath + filename + '.png', cache: true}; }))
		.concat(appPngFilenames.map(function(filename){
			return {contentType: 'image', filename: "resources/" + filename, filepath: "resources/" + filename + '.png', cache: true}; }))
		.concat(jpgFileanmes.map(function(filename){
			return {contentType: 'image', filename: filename, filepath: useSkinBasePath + filename + '.jpg', cache: true}; }))
		.concat(randomDefaultBgReqs),
		callback);
}

function loadAndOverrideBeatmapSkinResources(hitObjects, allLoadedCallback) {
	//从玩一个图谱到结束的用到的皮肤
	var mp3Filenames = [
		"applause"
	];
	var wavFilenames = ["applause"];
	/*
	var sampleSets = ['normal', 'soft'],
		hitObjectTypePrefixs = ['hit', 'slider'],
		soundTypes = ['normal', 'clap', 'finish', 'whistle'];
	for(var si = 0; si < sampleSets.length; si++) {
		for(var hi = 0; hi < hitObjectTypePrefixs.length; hi++) {
			for(var ti = 0; ti < soundTypes.length; ti++) {
				if(hi == 1 && [0,1,2].indexOf(ti) > -1) continue;
				wavFilenames.push(sampleSets[si] + '-' + hitObjectTypePrefixs[hi] + soundTypes[ti]);
			}
		}
	}*/
	var pngFilenames = [
		//"cursor", "cursormiddle",//暂不支持图谱内光标
		"play-skip",
		"spinner-circle", "spinner-bottom", "spinner-top", "spinner-middle",
		"hit0", "hit50", "hit100", "hit300", "hit300g", "hit300k", "hit100k",
		"reversearrow", "sliderfollowcircle","sliderfollowcircle-0",
		"ranking-panel", "ranking-title",
		"ranking-A", "ranking-B", "ranking-C", "ranking-D", "ranking-S", "ranking-X", "ranking-SH", "ranking-XH"
	];

	//声音override
  var soundTypeFilepathSet = {};
  hitObjects.forEach(function(hitObject){
    hitObject.soundTypeFilepaths.forEach(function(filepath){
      soundTypeFilepathSet[filepath] = 1;
    });
  });
  var reqList = [];
  for(var filepath in soundTypeFilepathSet)
    reqList.push({contentType: 'audio', filepath: filepath});
  loadResources(reqList
	.concat(pngFilenames.map(function(filename){
		return {contentType: 'image', filename: filename, filepath: useSkinBasePath + filename + '.png'}; }))
	.concat(wavFilenames.map(function(filename){
		return {contentType: 'audio', filepath: useSkinBasePath + filename + '.wav'}; })
	.concat(mp3Filenames.map(function(filename){
		return {contentType: 'audio', filepath: useSkinBasePath + filename + '.mp3'}; }))), callback);

  function callback() {
    soundTypeFilepathSet = {};
	hitObjects.forEach(function(hitObject){
		effectAudioList[hitObject.index] = [];
		for(var i = 0; i < hitObject.soundTypeFilepaths.length; i++) {
			var sfilepath;
			if(errorFilepaths[hitObject.soundTypeFilepaths[i]]) {
			  sfilepath = useSkinBasePath + hitObject.soundTypeFilenames[i];
			  hitObject.soundTypeFilepaths[i] = sfilepath;
				soundTypeFilepathSet[sfilepath] = 1;
			} else {
				sfilepath = hitObject.soundTypeFilepaths[i];
			}
			effectAudioList[hitObject.index].push(new Audio());
			if(hitObject.type == 2) {
				effectAudioList[hitObject.index].push(new Audio());
				effectAudioList[hitObject.index].push(new Audio());
			}
		}
	});
	reqList = [];
	for(var filepath in soundTypeFilepathSet) {
	  reqList.push({contentType: 'audio', filepath: filepath});
	}
	reqList.length ? loadResources(reqList, allLoadedCallback) : allLoadedCallback();
  }
}

var imageDataTable = {};

function loadResources(requestList, allLoadedCallback) {
  var loadedCnt = 0;
  for(var i = 0; i < requestList.length; i++) {
    var req = requestList[i];
	  var c = req.cache ? '' : '?t=' + +new Date;
    try {
      if(req.contentType == 'image') {
        var image = new Image();
  	  bindLoadEvent(image, 'load');
        image.src = req.filepath + c;
        image.filepath = req.filepath;
        image.filename = req.filename;
      } else if(req.contentType == 'audio') {
        var audio = new Audio();
  	  bindLoadEvent(audio, 'canplaythrough');
        audio.src = req.filepath + c;
        audio.filepath = req.filepath;
      }
    } catch(e) {}
  }

  function bindLoadEvent(resObj, eventName) {
    if(! allLoadedCallback) return;
    resObj['on' + eventName] = function() {
      loadedCnt++;
      if(this instanceof HTMLImageElement) {
      	if(this.filename) {
	      	imageDataTable[this.filename] = {width: this.width, height: this.height, url: 'url("' + this.src + '")'};
	      }
      } else {
      	effectAudioSet[this.filepath] = this;
      }
      errorFilepaths[this.filepath] = 0;
      if(loadedCnt >= requestList.length) {
        allLoadedCallback();
      }
    };
    resObj.onerror = function() {
      loadedCnt++;
	  	errorFilepaths[this.filepath] = 1;
      if(loadedCnt >= requestList.length) {
        allLoadedCallback();
      }
    };
	resObj.onabort = resObj.onerror;
  }
}

function getElement(selector, array){
	var elems = document.querySelectorAll(selector);
	return !array && elems.length == 1 ? elems[0] : [].slice.call(elems);
}
