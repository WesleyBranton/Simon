/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

function handleInstalled(details) {
	// Creates Setting Defaults After Installation
	if (details.reason == 'install') {
		browser.storage.local.set({
			setting: {
				audioEnabled: true
			}
		});
	}
}
browser.runtime.onInstalled.addListener(handleInstalled);