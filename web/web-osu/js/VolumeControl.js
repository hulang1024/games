function VolumeControl() {

	getElement('#masterVolume').onchange = function(event){ controlVolumeValue(this, event, 'master'); };
	getElement('#musicVolume').onchange = function(event){ controlVolumeValue(this, event, 'music'); };
	getElement('#effectVolume').onchange = function(event){ controlVolumeValue(this, event, 'effect'); };
	getElement('#masterVolume').value = settings.volumes.master;
	getElement('#musicVolume').value =  settings.volumes.music;
	getElement('#effectVolume').value = settings.volumes.effect;

	function controlVolumeValue(input, event, type) {
		settings.volumes[type] = value;
		changeMusicAudioVolume();

		config.save();
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
		getElement('#' + type + 'Volume').value = settings.volumes[type];

		config.save();
	}

}
