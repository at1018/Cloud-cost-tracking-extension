const openSidebarButton = document.getElementById('open-sidebar');
openSidebarButton.addEventListener('click', () => {
  console.log('[CloudCost] popup clicked');
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]?.id) return;
    chrome.tabs.sendMessage(tabs[0].id, { action: 'openSidebar' }, (response) => {
      console.log('[CloudCost] popup message response', response);
      window.close();
    });
  });
});
