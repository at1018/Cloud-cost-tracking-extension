console.log('[CloudCost] content-script loaded');

if (!document.getElementById('cct-sidebar-stylesheet')) {
  const stylesheet = document.createElement('link');
  stylesheet.id = 'cct-sidebar-stylesheet';
  stylesheet.rel = 'stylesheet';
  stylesheet.href = chrome.runtime.getURL('sidebar/sidebar.css');
  document.head.appendChild(stylesheet);
}

if (!document.getElementById('cct-sidebar-module')) {
  // Expose extension base URL for modules running in page context
  try {
    window.__CCT_RUNTIME_BASE = chrome.runtime.getURL('');
  } catch (e) {
    window.__CCT_RUNTIME_BASE = window.__CCT_RUNTIME_BASE || '';
  }

  document.documentElement.setAttribute(
    'data-cct-runtime-base',
    window.__CCT_RUNTIME_BASE
  );

  console.log('[CloudCost] Runtime Base:', window.__CCT_RUNTIME_BASE);

  const script = document.createElement('script');
  script.id = 'cct-sidebar-module';
  script.type = 'module';
  script.src = (window.__CCT_RUNTIME_BASE || chrome.runtime.getURL('')) + 'sidebar/sidebar.js';
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
