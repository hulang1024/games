var settings = {
	version: 1,
	skinName: 'Default',
	enableAutoCursorSizing: true,
	dimValue: 10,
	useCustomColours: false,
	keyoverlayEnabled: true,
	mouseKeyInGameplayingDisabled: false,
	keyBinds: {LeftClick: 90/*Z*/, RightClick: 88/*X*/},
	limitFPS: 0,
	volumes: {
		master: 70,
		music: 90,
		effect: 40
	}
};

function ConfigManager() {
	this.configStore = {};

	this.set = function(key, value){
		//this.configStore[key] = value;
	}

	this.get = function(key) {
		//return this.configStore[key];
	}

	this.save = function() {
		localStorage.osu_player_cfg = JSON.stringify(settings);
	}

	this.initDefaults = function () {
		/*
		this.set('VolumeMaster', 100);
		this.set('VolumeEffect', 100);
		this.set('VolumeMusic', 100);
		this.set('keyOsuLeft', 'Z')
		this.set('keyOsuRight', 'X');
		this.set('keyDisableMouseButtons', false);
		this.set('Skin', 'Default');
		this.set('limitFPS', 0);
		this.set('KeyOverlay', true);*/
	}

	this.load = function() {
		if(localStorage.osu_player_cfg) {
			var obj = JSON.parse(localStorage.osu_player_cfg);
			if(obj.version === 1) {
				for(var p in obj)
					settings[p] = obj[p];
			} else {
				this.save();
			}
		} else {
			this.save();
		}
	}


	this.initDefaults();
	this.load();
}
