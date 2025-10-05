// MV3 service worker

async function injectTwineForge(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      // zero plików! wstrzykujemy funkcję inline
      func: () => {
        try {
          if (window.__TH_LOADER__) return;       // guard, żeby nie dublować
          window.__TH_LOADER__ = true;

          // CSS – tylko raz
          if (!document.getElementById('th-style')) {
            const link = document.createElement('link');
            link.id = 'th-style';
            link.rel = 'stylesheet';
            link.href = chrome.runtime.getURL('twinehacker.css');
            document.documentElement.appendChild(link);
          }

          // JS – tylko raz
          if (!window.__TH_MAIN__) {
            const s = document.createElement('script');
            s.id = 'th-main';
            s.src = chrome.runtime.getURL('twinehacker.js');
            s.onload = () => { window.__TH_MAIN__ = true; };
            document.documentElement.appendChild(s);
          }
        } catch (err) {
          console.error('[TH] inline loader error:', err);
        }
      }
    });
  } catch (e) {
    console.error('Action click error:', e);
  }
}

// Helper: aktywna karta
async function getActiveTabId() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.id;
}

// Klik w ikonę
chrome.action.onClicked.addListener(async () => {
  const tabId = await getActiveTabId();
  if (tabId) injectTwineForge(tabId);
});

// Skróty klawiaturowe (opcjonalnie)
chrome.commands.onCommand.addListener(async (cmd) => {
  if (cmd !== 'enable_twine_hacker') return;
  const tabId = await getActiveTabId();
  if (tabId) injectTwineForge(tabId);
});
