function MainMenu() {
	var menuLevel = 0;

	var parentE = $('#menu');
	var playButton = parentE.find('#playButton');
	var settingsButton = parentE.find('#settingsButton');
	var backButton = parentE.find('#backButton');
	var exitButton = parentE.find('#exitButton');

	playButton.click(function() {
		$(this).blur();
		options.popOut(false);
		playUIEffectSound('menuhit', settings.skinName == 'Default' ? 3 : 100);
		clearTimeout(timer);
		$('#menu').hide();
		playButton.hide();
		settingsButton.hide();
		exitButton.hide();
		$('#solo').fadeIn();
		menuLevel = 0;
		nowScreen = 'solo';

		new PlaySongSelect();
	});

	settingsButton.click(function() {
		$(this).blur();
		playUIEffectSound('menuclick');
		clearTimeout(timer);
		options.popOut();
	});
	exitButton.click(function() {
		$(this).blur();
		window.close();
		playUIEffectSound('menuclick');
	});

	parentE.mousemove(function() {
		$('#menu .top').show();
	});

	/// osu logo
	$('#osuLogo').mousedown(function(event){
		scaleTo.call(this, 1.1, 1000, 'Out');
	});
	$('#osuLogo').mouseup(function(event){
		scaleTo.call(this, 1.2, 500, 'OutElastic');
	});
	$('#osuLogo').click(function(event){
		menuLevel++;
		if(menuLevel <= 1) {
			playUIEffectSound('menuclick');
			timer = setTimeout(function(){
				playButton.fadeOut();
				settingsButton.fadeOut();
				exitButton.fadeOut();
				$('#menu .top').fadeOut();
				menuLevel--;
			}, 5000);
		} else {
			playButton.click();
			menuLevel = 0;
		}

		menuLevel > 0 ? playButton.show() : playButton.hide();
		menuLevel > 0 ? settingsButton.show() : settingsButton.hide();
		menuLevel > 0 ? exitButton.show() : exitButton.hide();
	});
	$('#osuLogo').mouseover(function() {
		scaleTo.call(this, 1.2, 500, 'OutElastic');
	});
	$('#osuLogo').mouseout(function() {
		scaleTo.call(this, 1.0, 500, 'OutElastic');
	});

	function scaleTo(s, duration, easingType) {
		var w = osuLogoR;
		var h = osuLogoR;
		var ws = w * s;
		var hs = h * s;
		$(this).stop().animate({width: ws, height: hs, margin: (h - hs) / 2}, duration, 'ease' + easingType);
	}
}
