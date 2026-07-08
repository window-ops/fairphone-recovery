// Shared UI helpers: DOM building, toasts, modal dialogs and simulated processes.

import { icon } from './icons.js';

let modalOpen = false;
export function isModalOpen() { return modalOpen; }

// Build a single element from an HTML string.
export function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

export function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

const toastLayer = () => document.getElementById('toastLayer');

export function toast(message, type = '') {
  const node = el(`<div class="toast ${type}">${esc(message)}</div>`);
  toastLayer().appendChild(node);
  setTimeout(() => node.remove(), 2600);
}

// Modal dialog. Resolves true on confirm, false on cancel or dismiss.
export function dialog(opts) {
  const {
    tone = 'info',
    iconName = tone === 'danger' ? 'warning' : tone === 'warning' ? 'warning' : 'info',
    title = '',
    body = '',
    confirmText = 'Continue',
    cancelText = 'Cancel',
    danger = false,
  } = opts;

  const layer = document.getElementById('dialogLayer');
  return new Promise((resolve) => {
    const box = el(`
      <div class="dialog" role="dialog" aria-modal="true" aria-label="${esc(title)}">
        <div class="dialog-head">
          <div class="dialog-icon ${tone}">${icon(iconName, 22)}</div>
          <div class="dialog-title">${esc(title)}</div>
        </div>
        <div class="dialog-body">${body}</div>
        <div class="dialog-actions">
          ${cancelText ? `<button type="button" class="btn cancel">${esc(cancelText)}</button>` : ''}
          <button type="button" class="btn confirm ${danger ? 'danger' : ''}">${esc(confirmText)}</button>
        </div>
      </div>`);

    clear(layer);
    layer.appendChild(box);
    layer.hidden = false;
    modalOpen = true;

    const finish = (value) => {
      document.removeEventListener('keydown', onKey, true);
      layer.hidden = true;
      clear(layer);
      modalOpen = false;
      resolve(value);
    };

    const onKey = (e) => {
      if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); finish(true); }
      else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); finish(false); }
    };
    document.addEventListener('keydown', onKey, true);

    box.querySelector('.confirm').addEventListener('click', () => finish(true));
    const cancelBtn = box.querySelector('.cancel');
    if (cancelBtn) cancelBtn.addEventListener('click', () => finish(false));
    layer.addEventListener('click', (e) => { if (e.target === layer) finish(false); }, { once: true });
  });
}

// Append a coloured line to a log element and keep it scrolled to the bottom.
export function logLine(logEl, text, cls = '') {
  const span = el(`<div>${cls ? `<span class="${cls}">${esc(text)}</span>` : esc(text)}</div>`);
  logEl.appendChild(span);
  logEl.scrollTop = logEl.scrollHeight;
}

// Run a sequence of steps, advancing a progress fill and writing log lines.
// steps: [{ pct, label, lines: [{ text, cls }], ms }]
export function runSteps(steps, refs) {
  const { fill, meta, log, onDone, tone } = refs;
  let cancelled = false;
  let i = 0;

  if (fill && tone) fill.classList.add(tone);

  const next = () => {
    if (cancelled) return;
    if (i >= steps.length) { if (onDone) onDone(); return; }
    const step = steps[i];
    i += 1;
    if (fill && typeof step.pct === 'number') fill.style.width = step.pct + '%';
    if (meta) meta.textContent = step.label || '';
    if (log && step.lines) step.lines.forEach((ln) => logLine(log, ln.text, ln.cls || ''));
    setTimeout(next, step.ms == null ? 520 : step.ms);
  };

  next();
  return { cancel() { cancelled = true; } };
}
