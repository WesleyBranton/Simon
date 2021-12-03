/**
 * Initialize game
 *   - Load data from Storage API
 */
function init() {
    UI.input.nickname.placeholder = browser.i18n.getMessage('fieldNickname');
    UI.button.highscores.title = browser.i18n.getMessage('headerHighscores');

    browser.storage.local.get((data) => {
        audioEnabled = (typeof data.audioEnabled == 'boolean') ? data.audioEnabled : true;
        updateAudioButton();

        highscores = (typeof data.highscores == 'object') ? data.highscores : new Array();
        sortHighscores();
        updateHighscores();

        lastUsedName = (typeof data.lastUsedName == 'string') ? data.lastUsedName : null;
        UI.input.nickname.value = lastUsedName;
    });
}

/**
 * Start new game
 */
function startGame() {
    pattern = new Array();
    round = 0;

    UI.container.pregame.classList.add('hide');
    UI.button.highscores.classList.add('hide');

    formatNickname();
    lastUsedName = (UI.input.nickname.value.length > 0) ? UI.input.nickname.value : null;
    browser.storage.local.set({
        lastUsedName: lastUsedName
    });
    
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
    clearTimeout(timeoutGameOver);
	const color = COLOR[event.target.dataset.color];
	buttonPress(color);

    if (checkSelection(color)) {
        ++currentGuessingPosition;

        if (currentGuessingPosition >= pattern.length) {
            startRound();
        } else {
            timeoutGameOver = setTimeout(() => {
                gameOver();
            }, maxWaitTime + buttonLightDuration);
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
        AUDIO[color].currentTime = 0;
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
    UI.container.pregame.classList.remove('hide');
    UI.button.highscores.classList.remove('hide');
    UI.button.color[pattern[currentGuessingPosition]].classList.add('blink');

    --round;
    updateRoundCounter();

    if (isHighscore(round)) {
        const index = addHighscore(round, lastUsedName);
        changeScreen('highscores');
        highlightHighscore(index);
    }
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
        timeoutGameOver = setTimeout(() => {
            gameOver();
        }, maxWaitTime);
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

/**
 * Update label and icon of audio button
 */
function updateAudioButton() {
    if (audioEnabled) {
        UI.button.audio.src = '../images/audioon.png';
        UI.button.audio.title = browser.i18n.getMessage('tooltipAudioOff');
    } else {
        UI.button.audio.src = '../images/audiooff.png';
		UI.button.audio.title = browser.i18n.getMessage('tooltipAudioOn');
    }
}

/**
 * Check if score is a new highscore
 * @param {number} score Score
 * @returns Is highscore
 */
function isHighscore(score) {
    if (score > 0) {
        if (highscores.length < maxHighscoresSaved) {
            return true;
        } else {
            return score > highscores[highscores.length - 1].score;
        }
    }
}

/**
 * Save new highscore to storage
 * @param {number} score Score
 * @returns Index of new score
 */
function addHighscore(score) {
    const newHighscore = {
        name: lastUsedName,
        score: score,
        date: Date.now()
    };
    highscores.push(newHighscore);
    sortHighscores();

    if (highscores.length > maxHighscoresSaved) {
        highscores = highscores.slice(0, maxHighscoresSaved);
    }

    updateHighscores();

    browser.storage.local.set({
        highscores: highscores
    });

    return highscores.indexOf(newHighscore);
}

/**
 * Sort highscores by score and date
 */
function sortHighscores() {
    highscores.sort((a, b) => {
        if (a.score == b.score) {
            return a.date - b.date;
        } else {
            return b.score - a.score;
        }
    });
}

/**
 * Update highscore list in UI
 */
function updateHighscores() {
    UI.table.highscores.textContent = '';

    for (const highscore of Object.values(highscores)) {
        createHighscoreRow(highscore);
    }

    for (let i = highscores.length; i < maxHighscoresSaved; i++) {
        createHighscoreRow({
            name: '---',
            score: '--'
        });
    }
}

/**
 * Highlight row on highscores table
 * @param {number} index Row index
 */
function highlightHighscore(index) {
    UI.table.highscores.children[index].classList.add('highlight');
}

/**
 * Remove highlight from all highscore rows
 */
function unhighlightHighscore() {
    for (const row of UI.table.highscores.children) {
        row.classList.remove('highlight');
    }
}

/**
 * Add highscore row to UI
 * @param {object} highscore Highscore
 */
function createHighscoreRow(highscore) {
    const row = document.createElement('tr');
    const name = document.createElement('td');
    const score = document.createElement('td');

    name.textContent = (highscore.name != null) ? highscore.name : browser.i18n.getMessage('highscoreUnknownName');
    score.textContent = highscore.score;

    row.appendChild(name);
    row.appendChild(score);
    UI.table.highscores.appendChild(row);
}

/**
 * Change visible screen
 * @param {string} screen Screen
 */
function changeScreen(screen) {
    for (const s of Object.values(UI.screen)) {
        s.classList.add('hide');
    }

    UI.screen[screen].classList.remove('hide');
    unhighlightHighscore();
}

/**
 * Format nickname to acceptable format
 */
function formatNickname() {
    let nickname = UI.input.nickname.value;
    nickname = nickname.trim().toUpperCase();

    if (nickname.length > 3) {
        nickname = nickname.substring(0, 3);
    }

    UI.input.nickname.value = nickname;
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
        audio: document.getElementById('button-audio'),
        back: document.getElementById('button-back'),
        highscores: document.getElementById('button-highscores')
	},
    text: {
        round: document.getElementById('text-round')
    },
    input: {
        nickname: document.getElementById('input-nickname')
    },
    container: {
        pregame: document.getElementById('container-pregame')
    },
    table: {
        highscores: document.getElementById('table-highscores')
    },
    screen: {
        game: document.getElementById('screen-game'),
        highscores: document.getElementById('screen-highscores')
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
UI.button.highscores.addEventListener('click', () => { changeScreen('highscores'); });
UI.button.back.addEventListener('click', () => { changeScreen('game'); });
UI.input.nickname.addEventListener('keyup', formatNickname);

const buttonLightDuration = 500;
const buttonDelay = 600;
const roundDelay = 1000;
const maxHighscoresSaved = 10;
const maxWaitTime = 2000;
let timeoutGameOver = null;
let audioEnabled = true;
let highscores = new Array();
let lastUsedName = null;

let pattern = new Array();
let currentGuessingPosition = 0;
let round = 0;

i18nParse();
init();