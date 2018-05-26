function Cursor() {
	var self = this;
	function createCursor() {
		var div = $(document.createElement('div'));
		div.attr('id', 'cursor');
		div.css({
			zIndex: 100000000,
			position: 'absolute',
			pointerEvents: 'none',/*穿透none/auto*/
			backgroundRepeat: 'no-repeat',
			display: 'none'
		});

		var childDiv = $(document.createElement('div'));
		childDiv.css({
			zIndex: 100000001,
			backgroundRepeat: 'no-repeat',
			backgroundSize: 'contain'
		});

		div.append(childDiv);

		$(document.body).append(div);

		cursorEl = div.get(0);
		cursorCrEl = childDiv.get(0);
	}

	this.drawRotate = function (time) {
		cursorCrEl.style.transform = cursorCrEl.transform + ' rotate(' + Math.floor((time * 0.032) % 360) + 'deg) ';
	}

	this.startCursorAnimal = function() {
		if(!skinConfig.general.cursorRotate) return;
		cursorTimer = requestAnimationFrame(function(){
			if(gameplaying) {
				cancelAnimationFrame(cursorTimer);
				return;
			}
			self.drawRotate(new Date().getTime());
			cursorTimer = requestAnimationFrame(arguments.callee);
		});
	}

	this.useAnimalCursor = function() {
		overallCursorStyle = 'url("resources/cursor/transparent.png"), default';
		cursorEl.style.width = animalCursorR * 2 + 'px';
		cursorEl.style.height = animalCursorR * 2 + 'px';
		if(imageDataTable['cursormiddle']) {
			cursorEl.style.backgroundImage = imageDataTable['cursormiddle'].url;
			cursorEl.style.backgroundPosition = '22px 22px';
			cursorEl.style.backgroundSize = 32 + 'px ' + 32 + 'px';
		}
		cursorCrEl.style.width = animalCursorR * 2 + 'px';
		cursorCrEl.style.height = animalCursorR * 2 + 'px';
		cursorCrEl.style.backgroundImage = imageDataTable['cursor'].url;
		cursorCrEl.style.backgroundPosition = '0 0';
		cursorCrEl.style.backgroundSize = animalCursorR*2 + 'px ' + animalCursorR*2 + 'px';
		getElement('*').forEach(function(e){ e.style.cursor = overallCursorStyle; });
		cursorCrEl.transform = '';
		cursorCrEl.style.transform = cursorCrEl.transform;
		cursorCrEl.style.display = 'block';
		cursorEl.style.display = 'block';
		this.startCursorAnimal();
	}

	this.stopPlay = function(){
		//设到当前光标位置
		cursorEl.style.transformOrigin = '';
		cursorEl.style.transform = '';
		cursorCrEl.transform = '';
		cursorCrEl.style.transform = cursorCrEl.transform;
		this.pos(mousePos.x, mousePos.y);

		cursorCrEl.style.width = animalCursorR * 2 + 'px';
		cursorCrEl.style.height = animalCursorR * 2 + 'px';
		cursorCrEl.style.backgroundImage = imageDataTable['cursor'].url;
		cursorCrEl.style.backgroundPosition = '0 0';
		cursorCrEl.style.backgroundSize = animalCursorR*2 + 'px ' + animalCursorR*2 + 'px';
		cursorEl.style.width = animalCursorR * 2 + 'px';
		cursorEl.style.height = animalCursorR * 2 + 'px';
		if(imageDataTable['cursormiddle']) {
			cursorEl.style.backgroundImage = imageDataTable['cursormiddle'].url;
			cursorEl.style.backgroundPosition = '22px 22px';
			cursorEl.style.backgroundSize = 32 + 'px ' + 32 + 'px';
		}
		overallCursorStyle = 'url("resources/cursor/transparent.png"), default';
		getElement('*').forEach(function(e){ e.style.cursor = overallCursorStyle; });
		this.startCursorAnimal();
	}

	this.pos = function(x, y) {
		cursorEl.style.left = (x- cursorR) + 'px';
		cursorEl.style.top = (y - cursorR) + 'px';
	}


	this.automaticCursorSizing = function() {
		if(settings.enableAutoCursorSizing)  {
			var cursorS = circleRadius * 2 * 4 / 5;
			cursorR = cursorS / 2;
			cursorCrEl.style.width = cursorS + 'px';
			cursorCrEl.style.height = cursorS + 'px';
			cursorCrEl.style.backgroundPosition = 0 + 'px ' + 0 + 'px';
			cursorCrEl.style.backgroundSize = cursorS + 'px ' + cursorS + 'px';
			cursorEl.style.width = cursorS + 'px';
			cursorEl.style.height = cursorS + 'px';
			if(imageDataTable['cursormiddle']) {
				var cursorOrgS = imageDataTable['cursor'].width;
				var cursormiddleOrgS = imageDataTable['cursormiddle'].width;
				var cursormiddleS = Math.floor(cursorS * (cursormiddleOrgS / cursorOrgS));
				cursorEl.style.backgroundSize = cursormiddleS + 'px ' + cursormiddleS + 'px';
				var p = (cursorS - cursormiddleS) / 2;
				cursorEl.style.backgroundPosition = p + 'px ' + p + 'px';
			}
		} else {
			cursorR = animalCursorR;
		}
	}

	this.changeAutoCursor = function() {
		if(withMods.autoplay || replayMode) {
			overallCursorStyle = 'default';
			getElement('*').forEach(function(e){ e.style.cursor = 'default'; });
			if(imageDataTable['cursormiddle']) {
				cursorEl.style.backgroundImage = imageDataTable['cursormiddle'].url;
				cursorCrEl.style.display = 'block';
			}
		}
		cursorEl.style.transformOrigin = '';
		cursorEl.style.transform = '';
		cursorCrEl.transform = '';
		cursorCrEl.style.transform = cursorCrEl.transform;
	}

	this.load = function() {
		createCursor();

		animalCursorR = imageDataTable['cursor'].width / 2;
		cursorR = animalCursorR;
		cursorEl.style.left = (windowWidth - animalCursorR * 2) / 2 + 'px';
		cursorEl.style.top = (windowHeight - animalCursorR * 2) / 2 + animalCursorR * 2 + 'px';
		this.useAnimalCursor();
	}

	this.load();
}
