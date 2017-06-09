
function getWindowSize() {
	windowWidth  = window.innerWidth  || document.documentElement.clientWidth || document.body.clientWidth;
	windowHeight = window.innerHeight || document.documentElement.clientHeight|| document.body.clientHeight;
}

window.onload = function(){
	getWindowSize();
	window.resolution = {};
	resolution.width = Math.min(1024, window.screen.width);
	resolution.height = Math.min(600, window.screen.height);

	if(! checkUserAgent()) {
		return;
	}

    config.load();
	getBaseData(function(){
		loadGameBasicResources(init);
	});

	function checkUserAgent() {
	    /*
		var chromeIndex = navigator.userAgent.indexOf("Chrome/");
		
		if(chromeIndex == -1) {
			alert('请使用Google Chrome浏览器打开');
			return false;
		}
		var v = parseInt(navigator.userAgent.substring(chromeIndex + 7));
		if(isNaN(v)) {
			alert('检测到你可能是用其它浏览器版本打开本程序，有些游戏效果可能不正常哦。请使用Google Chrome浏览器打开。');
			return false;
		} else if(v < 45) {
			alert('你的浏览器版本可能低于本程序的需求:( 有些游戏效果可能不正常。请升级吧。');
			return false;
		}*/
		return true;
	}

	function getBaseData(continueP) {
		showLoading();
		getJS({
			varInWindow: 'songScript', js: 'songs.js', fromCache: false,
			onerror: function(){
			  alert('未找到songs.js!');
			},
			onload: function(){
				setTimeout(function(){
					songshome = window['songshome'] ? pathsep(songshome) : '';
					skinshome = window['skinshome'] ? pathsep(skinshome) : '';
					osujsons.path = window['osujsons.path'] ? pathsep(osujsons.path) : 'osujsons/';
					skinsBasePath = skinshome + 'Skins/';
					useSkinBasePath = skinsBasePath + settings.skinName + '/';

					getJS({
						js: useSkinBasePath + 'skin.ini.json', fromCache: false,
						onload: function(){
							skinConfig.general.cursorRotate = +skinConfig.general.cursorRotate || 0;
							skinConfig.general.sliderBallFlip = +skinConfig.general.sliderBallFlip || 0;
							skinConfig.general.sliderBallFrames = +skinConfig.general.sliderBallFrames || 1;
							continueP();
						}
					});
				}, 0);
			}
		});
	}

	function getJS(opts) {
		var script = document.createElement('script');
		script.src = opts.js + (opts.fromCache ? '' : '?t=' + +new Date);
		document.body.appendChild(script);
		script.onerror = opts.onerror;
		script.onload = opts.onload;

		if(opts.varInWindow) {
			window[opts.varInWindow] = script;
		}
	}
};

window.onunload = function() {
	if(window.opener == null) {
		window.childWin.close();
	}
};

function initWindowResizeEvent() {
	window.onresize = function(){
		getWindowSize();
		/*
		if(window.opener != null && window.resizes++ > 1) {
			window.close();
			window.opener.location.reload();
			return;
		}*/
		

		var size = {width: windowWidth, height: windowHeight};
		var backgroundSize = windowWidth + 'px ' + scaleHeight(size, windowWidth) + 'px';
		document.body.style.backgroundSize = backgroundSize;
		getElement('#solo').style.backgroundSize = backgroundSize;
		if(!gameplaying) {
			getElement('#gameplay').style.backgroundSize = backgroundSize;

			//调整成绩界面元素尺寸和位置样式
			getElement('#grades').style.backgroundSize = backgroundSize;
			var rankingPanelWidth = windowWidth / 2;
			var image = new Image();
			image.src = useSkinBasePath + 'ranking-panel.png';
			image.onload = function() {
				var rankingPanelHeight = scaleHeight({width:this.width,height:this.height}, rankingPanelWidth)/*windowHeight / 2 + 100*/;
				getElement('#grades>[name=rankingPanel]').style.width = rankingPanelWidth + 'px';
				getElement('#grades>[name=rankingPanel]').style.height = rankingPanelHeight + 'px';
				getElement('#grades>[name=rankingPanel]').style.backgroundSize = rankingPanelWidth + 'px ' + rankingPanelHeight + 'px';
			}

			var rankingWidth = windowWidth / 3, rankingHeight = windowHeight - 250;
			var gap = 10;
			getElement('#grades>[name=rankingTitle]').style.width = 300 + 'px';
			getElement('#grades>[name=rankingTitle]').style.right = 20 + 'px';
			getElement('#grades>[name=rankingTitle]').style.backgroundSize = 300 + 'px ' + 100 + 'px';
			getElement('#grades>[name=ranking]').style.right = 20 + 'px';
			getElement('#grades>[name=ranking]').style.width = rankingWidth + 'px';
			getElement('#grades>[name=ranking]').style.height = rankingHeight + 'px';
			getElement('#grades>[name=ranking]').style.backgroundSize = rankingWidth + 'px ' + rankingHeight + 'px';
			getElement('#grades>[name=replayButton]').style.right = 20 - 10 + 'px';
			getElement('#grades>[name=replayButton]').style.width = rankingWidth + 20 + 'px';
			getElement('#grades>[name=replayButton]').style.top = 100 + rankingHeight + 'px';
			getElement('#grades>#withMods').style.right = 30 + 'px';
			getElement('#grades>#withMods').style.top = rankingHeight + 'px';
		}
 
		osuLogoR = windowHeight / 1.32;
		var left = (windowWidth - osuLogoR) / 2, top = (windowHeight - osuLogoR) / 2;
		var osuLogo = getElement('#osuLogo');
		osuLogo.style.display = 'block';
		osuLogo.style.width = osuLogoR + 'px';
		osuLogo.style.height = osuLogoR + 'px';
		osuLogo.style.left = left + 'px';
		osuLogo.style.top = top + 'px';
		var playButton = getElement('#playButton');
		playButton.style.left = left + osuLogoR - 180 + 'px';
		playButton.style.top =  top + 100 + 'px';
		var settingsButton = getElement('#settingsButton');
		settingsButton.style.left = left + osuLogoR - 180 + 'px';
		settingsButton.style.top =  top + 180 + 'px';
		var exitButton = getElement('#exitButton');
		exitButton.style.left = left + osuLogoR - 180 + 'px';
		exitButton.style.top =  top + 260 + 'px';
		if(nowScreen == 'solo') {
			selectedBeatmap && changeBackground();
			if(songSelect)
				songSelect.size = Math.min(Beatmaps.length, Math.floor((windowHeight - 262) / 70));
		}
	};
}