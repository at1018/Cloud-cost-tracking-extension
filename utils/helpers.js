import { DEFAULT_SELECTIONS } from './constants.js';

export function buildInstanceOptions(selectElement, options) {
  selectElement.innerHTML = '';
  options.forEach((option) => {
    const opt = document.createElement('option');
    opt.value = option;
    opt.textContent = option;
    selectElement.appendChild(opt);
  });
}

export function getSavedSelections() {
  const selections = { ...DEFAULT_SELECTIONS };
  try {
    const raw = window.localStorage.getItem('cct-selections');
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...selections, ...parsed };
    }
  } catch (error) {
    console.warn('[CloudCost] Failed to load stored selections', error);
  }
  return selections;
}

export function saveSelections(values) {
  try {
    window.localStorage.setItem('cct-selections', JSON.stringify(values));
    chrome.storage.local.set(values);
  } catch (error) {
    console.warn('[CloudCost] Failed to save selections', error);
  }
}

export function formatCurrency(value) {
  return `$${value.toFixed(4)}`;
}
