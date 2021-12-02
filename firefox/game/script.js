/**
 * Initialize game
 *   - Load data from Storage API
 */
function init() {
    browser.storage.local.get((data) => {
        audioEnabled = (typeof data.audioEnabled == 'boolean') ? data.audioEnabled : true;
        updateAudioButton();
    });
}

/**
 * Start new game
 */
function startGame() {
    pattern = new Array();
    round = 0;

    UI.button.start.classList.add('hide');
    
    updateRoundCounter();
    startRound();
}

/**
 * Enable/Disable game color buttons
 * @param {boolean} enabled Enable buttons
 */
function toggleGameButtons(enabled) {
    for (const button of Object.values(UI.button.color)) {
        button.disabled = !enabled;
        button.classList.remove('blink');
    }
}

/**
 * Process user game button press event
 * @param {Event} event Button event
 */
function handleGameButtonPress(event) {
	const color = COLOR[event.target.dataset.color];
	buttonPress(color);

    if (checkSelection(color)) {
        ++currentGuessingPosition;

        if (currentGuessingPosition >= pattern.length) {
            startRound();
        }
    } else {
        gameOver();
    }
}

/**
 * Trigger button press effect
 * @param {string} color Color
 */
function buttonPress(color) {
    // Play audio
    if (audioEnabled) {
        AUDIO[color].play();
    }

    // Light up
    UI.button.color[color].classList.add('lit');
    setTimeout(() => {
		UI.button.color[color].classList.remove('lit');
	}, buttonLightDuration);
}

/**
 * Check if user entered color matches pattern
 * @param {string} color Color
 * @returns Is correct
 */
function checkSelection(color) {
    return pattern[currentGuessingPosition] == color;
}

/**
 * Handle game over event
 */
function gameOver() {
    toggleGameButtons(false);
    UI.button.start.classList.remove('hide');
    UI.button.color[pattern[currentGuessingPosition]].classList.add('blink');
}

/**
 * Start next round
 */
function startRound() {
    toggleGameButtons(false);

    ++round;
    updateRoundCounter();
    
    currentGuessingPosition = 0;
    addToPattern();

    setTimeout(() => {
        playPattern(0);
    }, roundDelay);
}

/**
 * Add color to pattern
 */
 function addToPattern() {
    const color = Object.values(COLOR)[Math.floor(Math.random() * 4)];
    pattern.push(color);
}

/**
 * Recursively play pattern
 * @param {number} index Currently on
 */
function playPattern(index) {
    if (index < pattern.length) {
        buttonPress(pattern[index]);

        setTimeout(() => {
            playPattern(++index);
        }, buttonDelay);
    } else {
        toggleGameButtons(true);
    }
}

/**
 * Update the round counter UI
 */
function updateRoundCounter() {
    UI.text.round.textContent = (round < 1) ? 1 : round;
}

/**
 * Toggle audio setting
 */
function toggleAudio() {
    audioEnabled = !audioEnabled;
    updateAudioButton();
    browser.storage.local.set({
        audioEnabled: audioEnabled
    });
}

function updateAudioButton() {
    if (audioEnabled) {
        UI.button.audio.src = '../images/audioon.png';
        UI.button.audio.title = browser.i18n.getMessage('tooltipAudioOff');
    } else {
        UI.button.audio.src = '../images/audiooff.png';
		UI.button.audio.title = browser.i18n.getMessage('tooltipAudioOn');
    }
}

const UI = {
	button: {
        color: {
            red: document.getElementById('button-red'),
            yellow: document.getElementById('button-yellow'),
            green: document.getElementById('button-green'),
            blue: document.getElementById('button-blue')
        },
		start: document.getElementById('button-start'),
        audio: document.getElementById('button-audio')
	},
    text: {
        round: document.getElementById('text-round')
    }
};

const AUDIO = {
    red: new Audio('../audio/red.ogg'),
    yellow: new Audio('../audio/yellow.ogg'),
    green: new Audio('../audio/green.ogg'),
    blue: new Audio('../audio/blue.ogg')
};

const COLOR = {
	red: 'red',
	yellow: 'yellow',
	green: 'green',
	blue: 'blue'
}

UI.button.color.red.addEventListener('click', handleGameButtonPress);
UI.button.color.green.addEventListener('click', handleGameButtonPress);
UI.button.color.blue.addEventListener('click', handleGameButtonPress);
UI.button.color.yellow.addEventListener('click', handleGameButtonPress);
UI.button.start.addEventListener('click', startGame);
UI.button.audio.addEventListener('click', toggleAudio);

const buttonLightDuration = 500;
const buttonDelay = 600;
const roundDelay = 1000;
let audioEnabled = true;

let pattern = new Array();
let currentGuessingPosition = 0;
let round = 0;

i18nParse();
init();