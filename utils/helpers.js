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
  const num = Number(value) || 0;
  return `$${num.toFixed(4)}`;
}

export function validatePositiveNumber(value) {
  const n = Number(value);
  if (Number.isNaN(n) || n < 0) return false;
  return true;
}

export function showInlineError(el, msg) {
  if (!el) return;
  let err = el.parentElement.querySelector('.cct-error');
  if (!err) {
    err = document.createElement('div');
    err.className = 'cct-error';
    el.parentElement.appendChild(err);
  }
  err.textContent = msg;
}

export function clearInlineError(el) {
  if (!el) return;
  const err = el.parentElement.querySelector('.cct-error');
  if (err) err.remove();
}
