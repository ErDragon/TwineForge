// Cross-browser background worker (Chrome + Firefox)

const extApi = typeof browser !== 'undefined' ? browser : chrome;

function toPromise(fn) {
  return new Promise((resolve, reject) => {
    try {
      fn((result) => {
        const lastError = chrome?.runtime?.lastError;
        if (lastError) reject(new Error(lastError.message));
        else resolve(result);
      });
    } catch (err) {
      reject(err);
    }
  });
}

async function queryActiveTab() {
  if (extApi.tabs?.query.length <= 1) {
    const tabs = await extApi.tabs.query({ active: true, currentWindow: true });
    return tabs?.[0];
  }

  const tabs = await toPromise((cb) => extApi.tabs.query({ active: true, currentWindow: true }, cb));
  return tabs?.[0];
}

async function executeLoader(tabId) {
  const payload = {
    target: { tabId },
    func: () => {
      try {
        if (window.__TH_LOADER__) return;
        window.__TH_LOADER__ = true;

        const runtimeApi = (typeof browser !== 'undefined' ? browser : chrome).runtime;

        if (!document.getElementById('th-style')) {
          const link = document.createElement('link');
          link.id = 'th-style';
          link.rel = 'stylesheet';
          link.href = runtimeApi.getURL('twinehacker.css');
          document.documentElement.appendChild(link);
        }

        if (!window.__TH_MAIN__) {
          const s = document.createElement('script');
          s.id = 'th-main';
          s.src = runtimeApi.getURL('twinehacker.js');
          s.onload = () => {
            window.__TH_MAIN__ = true;
          };
          document.documentElement.appendChild(s);
        }
      } catch (err) {
        console.error('[TH] inline loader error:', err);
      }
    }
  };

  if (extApi.scripting.executeScript.length <= 1) {
    return extApi.scripting.executeScript(payload);
  }

  return toPromise((cb) => extApi.scripting.executeScript(payload, cb));
}

async function injectTwineForge(tabId) {
  try {
    await executeLoader(tabId);
  } catch (err) {
    console.error('[TH] inject failed:', err);
  }
}

extApi.action.onClicked.addListener(async () => {
  const tab = await queryActiveTab();
  if (tab?.id) {
    await injectTwineForge(tab.id);
  }
});

extApi.commands.onCommand.addListener(async (cmd) => {
  if (cmd !== 'enable_twine_hacker') return;
  const tab = await queryActiveTab();
  if (tab?.id) {
    await injectTwineForge(tab.id);
  }
});
