function VolumeControl() {

	getElement('#masterVolume').onkeydown = function(event){ controlVolumeValue(this, event, 'master'); };
	getElement('#musicVolume').onkeydown = function(event){ controlVolumeValue(this, event, 'music'); };
	getElement('#effectVolume').onkeydown = function(event){ controlVolumeValue(this, event, 'effect'); };
	getElement('#masterVolume').onkeyup = function(event){ this.value = settings.volumes.master; };
	getElement('#musicVolume').onkeyup = function(event){ this.value = settings.volumes.music; };
	getElement('#effectVolume').onkeyup = function(event){ this.value = settings.volumes.effect; };
	drawVolumeBar(getElement('#masterVolume'), settings.volumes.master);
	drawVolumeBar(getElement('#musicVolume'), settings.volumes.music);
	drawVolumeBar(getElement('#effectVolume'), settings.volumes.effect);

	function controlVolumeValue(input, event, type) {
		var value = parseInt(input.value);
		if(!isNaN(value)) {
			if(input.value > 100) {
				value = input.value = 100;
			}
			if(input.value < 0) {
				value = input.value = 0;
			}

			switch(event.keyCode) {
			case 37://l
				if(value - 1 >= 0)
					value--; break;
			case 39://r
				if(value + 1 <= 100)
					value++; break;
			case 38://u
				if(value + 5 <= 100)
					value += 5; break;
			case 40://d
				if(value - 5 >= 0)
					value -= 5; break;
			}
		} else {
			input.value = settings.volumes[type];
		}
		settings.volumes[type] = value;
		
		changeMusicAudioVolume();
		drawVolumeBar(input, value);

		config.save();
	}

	function drawVolumeBar(input, value) {
		input.value = value;
		input.title = value + '%';
		input.parentNode.title = value + '%';
		input.style.width = (8 + (295 * value / 100)) + 'px';
	}
	function changeMusicAudioVolume() {
		musicAudio.volume = settings.volumes.master * settings.volumes.music / 10000;
	}

	this.onMouseWheel = function(event) {
		var type;
		var id = event.target.id;
		if(['masterVolume', 'musicVolume', 'effectVolume'].indexOf(id) > -1) {
			type = id.substring(0, id.indexOf('Volume'));
		} else if(nowScreen != 'solo' && !options.poppedOut) {
			type = 'master';
		} else {
			return;
		}
		settings.volumes[type] += Math.sign(event.wheelDelta) * 1;
		if(settings.volumes[type] > 100) settings.volumes[type] = 100;
		if(settings.volumes[type] < 0) settings.volumes[type] = 0;
		changeMusicAudioVolume();
		drawVolumeBar(getElement('#' + type + 'Volume'), settings.volumes[type]);

		config.save();
	}

}