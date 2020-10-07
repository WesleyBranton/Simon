/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

// Initialization
disableGame();
document.getElementById('btnStart').addEventListener('click',function() {
	document.getElementById('btnStart').style.display = 'none';
	document.getElementById('btnStart').textContent = 'PLAY AGAIN';
	document.getElementById('btnRed').className = '';
	document.getElementById('btnGreen').className = '';
	document.getElementById('btnBlue').className = '';
	document.getElementById('btnYellow').className = '';
	disableGame();
	runPattern();
});
document.getElementById('btnRed').addEventListener('click',pressRed);
document.getElementById('btnGreen').addEventListener('click',pressGreen);
document.getElementById('btnBlue').addEventListener('click',pressBlue);
document.getElementById('btnYellow').addEventListener('click',pressYellow);
browser.storage.local.get('setting', (res) => {
	var audioEnabled = res.setting.audioEnabled;
	if (audioEnabled) {
		browser.storage.local.set({
			setting: {
				audioEnabled: false
			}
		});
	} else {
		browser.storage.local.set({
			setting: {
				audioEnabled: true
			}
		});
	}
	toggleAudio();
});
document.getElementById('audioToggle').addEventListener('click',toggleAudio);
var patternInc = 2;
var userInc = 0;
var patternCol = new Array();
var round = 2;

function pressRed() {
	// If user selects red button
	var color = 'Red';
	var pressBy = 'user';
	buttonPress(color,pressBy);
}
function pressGreen() {
	// If user selects green button
	var color = 'Green';
	var pressBy = 'user';
	buttonPress(color,pressBy);
}
function pressBlue() {
	// If user selects blue button
	var color = 'Blue';
	var pressBy = 'user';
	buttonPress(color,pressBy);
}
function pressYellow() {
	// If user selects yellow button
	var color = 'Yellow';
	var pressBy = 'user';
	buttonPress(color,pressBy);
}

function buttonPress(color,pressBy) {
	// Plays audio
	browser.storage.local.get('setting', (res) => {
		if (res.setting.audioEnabled) {
			var audio = document.getElementById('aud' + color);
			audio.play();
		}
	});
	
	// Lights up
	var button = document.getElementById('btn' + color);
	button.style.filter = 'brightness(150%)';
	setTimeout(function() {
		button.style.filter = 'brightness(100%)';
	},500);
		
	// Detects button press or computer pattern
	if (pressBy == 'user') {
		checkSelection(color);
	} else {
		setTimeout(runPattern,600);
	}
}

function checkSelection(colorSel) {
	// Determines what color is correct
	var colorLook = patternCol[userInc];
	if (colorLook == colorSel) {
		// If the user is correct
		userInc++;
		if (!patternCol[userInc]) {
			// If the round is complete
			userInc = 0;
			disableGame();
			setTimeout(runPattern,1000);
		}
	} else {
		// If the user is wrong
		document.getElementById('btn' + colorLook).className = 'blink';
		disableGame();
		document.getElementById('btnStart').style.display = 'inline-block';
		patternInc = 2;
		userInc = 0;
		patternCol = [];
		round = 2;
	}
}

function runPattern() {
	if (round == patternInc) {
		// Generates color
		document.getElementById('round').textContent = 'Round: ' + (round - 1);
		var colors = ['Red','Green','Blue','Yellow'];
		var pressBy = 'comp';
		var genCol = Math.floor(Math.random() * 4);
		genCol = colors[genCol];
		patternInc--;
		patternCol.push(genCol);
		runPattern();
	} else if (round > patternInc && patternInc > 0) {
		// Play pattern
		var genCol = patternCol[round-patternInc-1];
		var pressBy = 'comp';
		patternInc--;
		buttonPress(genCol,pressBy);
	} else {
		enableGame();
		round++;
		patternInc = round;
	}
}

function disableGame() {
	// Prevents user from clicking game buttons
	document.getElementById('btnRed').disabled = true;
	document.getElementById('btnGreen').disabled = true;
	document.getElementById('btnBlue').disabled = true;
	document.getElementById('btnYellow').disabled = true;
}

function enableGame() {
	// Allows user to click game buttons
	document.getElementById('btnRed').disabled = false;
	document.getElementById('btnGreen').disabled = false;
	document.getElementById('btnBlue').disabled = false;
	document.getElementById('btnYellow').disabled = false;
}

function toggleAudio() {
	browser.storage.local.get('setting', (res) => {
		var audioEnabled = res.setting.audioEnabled;
		var audioToggle = document.getElementById('audioToggle');
		if (audioEnabled) {
			// Disables game audio
			audioToggle.src = '../images/audiooff.png';
			audioToggle.title = 'Turn audio on';
			audioEnabled = false;
			browser.storage.local.set({
				setting: {
					audioEnabled: false
				}
			});
		} else {
			// Enables game audio
			audioToggle.src = '../images/audioon.png';
			audioToggle.title = 'Turn audio off';
			audioEnabled = true;
			browser.storage.local.set({
				setting: {
					audioEnabled: true
				}
			});
		}
	});
}
