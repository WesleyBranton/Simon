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