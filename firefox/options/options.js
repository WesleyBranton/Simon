function saveOptions() {
	// Declared Variables
	var audioOption = document.getElementById('audioOption');
	
	// Saves Settings To Local Storage
	browser.storage.local.set({
		setting: {
			audioEnabled: audioOption.checked
		}
	});
}

function restoreOptions() {
	// Loads & Outputs Saved Settings
	browser.storage.local.get('setting', (res) => {
		var audioOption = document.getElementById('audioOption');
		audioOption.checked = res.setting.audioEnabled;
	});
}

restoreOptions();
document.querySelector("form").addEventListener("change", saveOptions);