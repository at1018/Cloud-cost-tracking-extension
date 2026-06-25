const openSidebarButton = document.getElementById('open-sidebar');
openSidebarButton.addEventListener('click', () => {
  console.log('[CloudCost] popup clicked');
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]?.id) return;
    chrome.tabs.sendMessage(tabs[0].id, { action: 'openSidebar' }, (response) => {
      if (chrome.runtime.lastError) {
        console.warn('[CloudCost] sendMessage failed, injecting content script fallback', chrome.runtime.lastError);
        const tabId = tabs[0].id;
        // Inject the extension's content script which will load the sidebar module
        chrome.scripting.executeScript({ target: { tabId }, files: ['content-script.js'] }, (injectionResults) => {
          if (chrome.runtime.lastError) {
            console.error('[CloudCost] fallback injection failed', chrome.runtime.lastError);
          } else {
            console.log('[CloudCost] fallback content-script injected', injectionResults);
          }
          window.close();
        });
      } else {
        console.log('[CloudCost] popup message response', response);
        window.close();
      }
    });
  });
});
