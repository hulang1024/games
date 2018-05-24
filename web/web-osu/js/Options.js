function Options() {
	var self = this;
	this.poppedOut = false;

	this.popOut = function(b) {
		if(b != undefined) {
			this.poppedOut = !b;
		}
		if(this.poppedOut) {
			$('#options').stop().animate({width:'0px'}, 300, 'easeOut', function(){
				$(this).hide();
			});
		} else {
			$('#options').stop().show().animate({width:'380px'}, 300, 'easeOut', function(){
				$(this).show();
			});
		}
		this.poppedOut = !this.poppedOut;
	}

	this.load = function() {
		var fragment = document.createDocumentFragment();
		for(var i = 0; i < window.skins.length; i++) {
			var option = document.createElement('option');
			option.value = window.skins[i];
			option.text = option.value;
			option.onclick = function(){
				this.selected = true;
				settings.skinName = this.value;
				config.save();
				location.reload();
			};
			fragment.appendChild(option);
		}
		getElement('#options #skins').onchange = function(){
				settings.skinName = this.value;
				config.save();
				location.reload();
		}
		getElement('#options #skins').appendChild(fragment);
		getElement('#options #fps>[value="' + settings.limitFPS + '"]').selected = true;
		getElement('#options #skins>[value="' + settings.skinName + '"]').selected = true;
		getElement('#options #enableAutoCursorSizing').checked = settings.enableAutoCursorSizing;
		getElement('#options #dim').value = settings.dimValue;
		getElement('#options #disableBackground').checked = settings.bgDisabled;
		getElement('#options #enableKeyoverlay').checked = settings.keyoverlayEnabled;
		getElement('#options #disableMouseKeyInGameplaying').checked = settings.mouseKeyInGameplayingDisabled;

	}

	this.load();

	this.onKeyDown = function(event) {
		switch(event.keyCode) {
			case 27://esc
				if(!this.poppedOut) return false;
				this.popOut(false);
				return true;
			}
	}

	$('#options button[name=back]').click(function(){
		playUIEffectSound('menuclick');
		self.popOut();
		menuLevel = 0;
	});

	$('#options #reset').click(function(){
		config.initDefaults();
		self.load();
		config.save();
	});
	$('#options #fps').change(function(){
		settings.limitFPS = this.value;
		config.save();
	});
	$('#options #enableKeyoverlay').change(function(){
		settings.keyoverlayEnabled = this.checked;
		config.save();
	});
	$('#options #disableMouseKeyInGameplaying').change(function(){
		settings.mouseKeyInGameplayingDisabled = this.checked;
		config.save();
	});
	$('#options #enableAutoCursorSizing').change(function(){
		settings.enableAutoCursorSizing = this.checked;
		config.save();
	});

	$('#options #dim').change(function(){
		settings.dimValue = this.value;
		config.save();
	});
}
