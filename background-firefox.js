const api = typeof browser !== 'undefined' ? browser : chrome;

async function injectTwineForge(tabId) {
  const cssURL = api.runtime.getURL('twinehacker.css');
  const jsURL = api.runtime.getURL('twinehacker.js');
  const loaderCode = `
    (function() {
      try {
        if (window.__TH_LOADER__) return;
        window.__TH_LOADER__ = true;

        if (!document.getElementById('th-style')) {
          const link = document.createElement('link');
          link.id = 'th-style';
          link.rel = 'stylesheet';
          link.href = '${cssURL}';
          document.documentElement.appendChild(link);
        }

        if (!window.__TH_MAIN__) {
          const s = document.createElement('script');
          s.id = 'th-main';
          s.src = '${jsURL}';
          s.onload = () => { window.__TH_MAIN__ = true; };
          document.documentElement.appendChild(s);
        }
      } catch (err) {
        console.error('[TH] inline loader error:', err);
      }
    })();
  `;

  try {
    await api.tabs.executeScript(tabId, { code: loaderCode });
  } catch (e) {
    console.error('Action click error:', e);
  }
}

async function getActiveTabId() {
  const tabs = await api.tabs.query({ active: true, currentWindow: true });
  return tabs && tabs[0] ? tabs[0].id : undefined;
}

api.browserAction.onClicked.addListener(async () => {
  const tabId = await getActiveTabId();
  if (tabId) injectTwineForge(tabId);
});

api.commands.onCommand.addListener(async (cmd) => {
  if (cmd !== 'enable_twine_hacker') return;
  const tabId = await getActiveTabId();
  if (tabId) injectTwineForge(tabId);
});
