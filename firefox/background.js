/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

/**
 * Open/Focus game window
 * @async
 */
async function openGame() {
	if (gameWindow == null) {
		gameWindow = await browser.windows.create({
			height: 600,
			width: 400,
			focused: true,
			type: browser.windows.CreateType.PANEL,
			url: 'game/index.html'
		});
	} else {
		browser.windows.update(gameWindow.id, {
			focused: true,
			drawAttention: true
		});
	}
}

/**
 * Remove game window if it's closed
 * @param {number} windowId Window ID
 */
function manageGameWindow(windowId) {
	if (gameWindow != null) {
		if (gameWindow.id == windowId) {
			gameWindow = null;
		}
	}
}

let gameWindow = null;
browser.browserAction.onClicked.addListener(openGame);
browser.windows.onRemoved.addListener(manageGameWindow);