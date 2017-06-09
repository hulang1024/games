function PlaySongSelect() {
	$('#songDesc>*').hide();
	if(selectedBeatmap) {
		showSongDesc(selectedBeatmap);
	}

	if(!(window.beatmapDBLoading || window.beatmapDBLoading)) {
		window.beatmapDBLoading = true;
		showLoading();
		
			initGame();

			//加载osu文件json
			var loadedCnt = 0;
			for(var j = 0; j < osujsons.length; j++) {
				var st = document.createElement('script');
				st.src = osujsons.path + osujsons[j] + '.json';
				document.body.insertBefore(st, songScript);
				st.index = j;
				st.onload = function() {
					document.body.removeChild(this);
					Beatmaps[this.index] = eval('BeatmapID' + osujsons[this.index]);
					loadedCnt++;
					if(loadedCnt == osujsons.length) {
						continueP();
					}
				};
				st.onerror = function(){
					document.body.removeChild(this);
					loadedCnt++;
					if(loadedCnt == osujsons.length) {
						continueP();
					}
				}
			}

		function continueP() {
			var st = document.createElement('script');
			st.src = 'scoresDB.json' + '?t=' + +new Date;//避免缓存
			document.body.insertBefore(st, songScript);
			st.onload = function() {
				window.beatmapDBLoaded = true;
				Beatmaps = Beatmaps.filter(function(beatmap){ return beatmap != undefined; })
				refreshSongSelect();
				initMusicPlayerEvent();
				//songSelect.options[randInt(0, Beatmaps.length)].onclick();
				showLoading(false);
			}
		}
	}
}