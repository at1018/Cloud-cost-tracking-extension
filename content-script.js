console.log('[CloudCost] content-script loaded');

if (!document.getElementById('cct-sidebar-stylesheet')) {
  const stylesheet = document.createElement('link');
  stylesheet.id = 'cct-sidebar-stylesheet';
  stylesheet.rel = 'stylesheet';
  stylesheet.href = chrome.runtime.getURL('sidebar/sidebar.css');
  document.head.appendChild(stylesheet);
}

if (!document.getElementById('cct-sidebar-module')) {
  const script = document.createElement('script');
  script.id = 'cct-sidebar-module';
  script.type = 'module';
  script.src = chrome.runtime.getURL('sidebar/sidebar.js');
  script.onload = () => console.log('[CloudCost] sidebar module loaded');
  script.onerror = (event) => console.error('[CloudCost] failed to load sidebar module', event);
  document.documentElement.appendChild(script);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[CloudCost] content-script received message', message);
  if (message?.action === 'openSidebar') {
    const event = new CustomEvent('cct-open-sidebar');
    window.dispatchEvent(event);
    sendResponse({ status: 'sidebar-opened' });
  }
});
