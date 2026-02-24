# TwineForge

A lightweight Chrome extension for inspecting and editing variables in **Twine / SugarCube** stories.  
Updated for Manifest V3 and modern browsers.

---

## 🚀 Installation
1. Download the release ZIP and extract it.  
2. Open `chrome://extensions/` → enable **Developer mode**.  
3. Click **Load unpacked** and select the folder with `manifest.json`.  
4. (Optional) In extension details, enable **Allow access to file URLs** if you want to use it on `file:///` HTML games.

---

## 🦊 Firefox build
1. Use `manifest.firefox.json` as the manifest file for Firefox packages.
2. In temporary installs (`about:debugging`), select `manifest.firefox.json` via **This Firefox** → **Load Temporary Add-on**.
3. Keep `manifest.json` for Chromium-based browsers.
4. To build installable files (`.xpi` and `.zip`), run:
   ```bash
   ./build-firefox.sh
   ```
   Packages are created in `dist/` and can be loaded in Firefox (`about:debugging`) or distributed as files.

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
