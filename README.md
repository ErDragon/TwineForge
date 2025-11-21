# TwineForge

A lightweight Chrome extension for inspecting and editing variables in **Twine / SugarCube** stories.  
Updated for Manifest V3 and modern browsers.

---

## 🚀 Installation
### Chromium-based browsers (MV3)
1. Download the release ZIP and extract it.
2. Open `chrome://extensions/` → enable **Developer mode**.
3. Click **Load unpacked** and select the folder with `manifest.json`.
4. (Optional) In extension details, enable **Allow access to file URLs** if you want to use it on `file:///` HTML games.

### Firefox (MV2 bundle)
Firefox does not support the MV3 `background.service_worker` used in the Chromium build, so you need the MV2 manifest shipped as `manifest.firefox.json`.

**Quick way:** run `./build-firefox.sh` to create `dist/firefox/` with the correct `manifest.json`, then in `about:debugging` choose *Load Temporary Add-on…* and point to that folder.

**Manual way (if you prefer no script):**
1. Copy `manifest.firefox.json` to `manifest.json` in a separate folder.
2. Copy `background-firefox.js`, `twinehacker.js`, `twinehacker.css`, `show-custom-globals.js`, `load-customglobals.js`, `index.html`, and the `Icons/` + `Skins/` folders into the same folder.
3. In `about:debugging`, choose *Load Temporary Add-on…* and pick that folder. Avoid selecting the Chromium `manifest.json`, or Firefox will show a `background.service_worker is currently disabled` error.

---

## 🕹️ Usage
- Open a Twine/SugarCube game in your browser.  
- Click the TwineForge icon in the toolbar, or use keyboard shortcuts:  
  - **Ctrl+Shift+H** → inject TwineForge UI  
  - **Ctrl+Shift+R** → resets position and size if window got off screen and cannot me moved
- If the game runs inside an `<iframe>` (e.g. itch.io), right-click the frame → *Open frame in new tab* → then use the extension.

---

## 🔒 License
- **Personal use only.**  
- **Redistribution is NOT allowed** without my permission.  
- Any allowed redistributions must keep attribution and must NOT contain malware or monetization.  

For permission requests, contact: `makiteusz565r6@gmail.com`.
