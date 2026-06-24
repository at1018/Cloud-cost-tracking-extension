chrome.runtime.onInstalled.addListener(() => {
  console.log('[CloudCost] Sidebar Initialized');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.action === 'openSidebar') {
    sendResponse({ status: 'opening' });
  }
});
