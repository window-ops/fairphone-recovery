// Virtual BIOS style keyboard. Replaces the phone keyboard for typable elements.
// It appears when a text field gains focus and types into that field.

import { el } from '../ui/ui.js';

let root = null;
let field = null;
let shift = false;
let notify = () => {};
const letterKeys = [];

const ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
];
const SYMBOLS = ['-', '_', '.', '/', ':', ',', '=', '+'];

function isLetter(ch) { return ch >= 'a' && ch <= 'z'; }

function insert(ch) {
  if (!field) return;
  const s = field.selectionStart == null ? field.value.length : field.selectionStart;
  const e = field.selectionEnd == null ? field.value.length : field.selectionEnd;
  field.value = field.value.slice(0, s) + ch + field.value.slice(e);
  const pos = s + ch.length;
  field.setSelectionRange(pos, pos);
  field.dispatchEvent(new Event('input', { bubbles: true }));
  field.focus();
}

function backspace() {
  if (!field) return;
  const s = field.selectionStart == null ? field.value.length : field.selectionStart;
  const e = field.selectionEnd == null ? field.value.length : field.selectionEnd;
  if (s === e && s > 0) {
    field.value = field.value.slice(0, s - 1) + field.value.slice(e);
    field.setSelectionRange(s - 1, s - 1);
  } else {
    field.value = field.value.slice(0, s) + field.value.slice(e);
    field.setSelectionRange(s, s);
  }
  field.dispatchEvent(new Event('input', { bubbles: true }));
  field.focus();
}

function enter() {
  if (!field) return;
  field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  field.focus();
}

function toggleShift() {
  shift = !shift;
  letterKeys.forEach((k) => { k.textContent = shift ? k.dataset.ch.toUpperCase() : k.dataset.ch; });
}

function keyBtn(ch) {
  const btn = el(`<button type="button" class="vkbd-key" data-nav>${ch}</button>`);
  btn.dataset.ch = ch;
  if (isLetter(ch)) letterKeys.push(btn);
  btn.addEventListener('mousedown', (e) => e.preventDefault());
  btn.addEventListener('click', () => {
    const out = isLetter(ch) && shift ? ch.toUpperCase() : ch;
    insert(out);
  });
  return btn;
}

function specialBtn(labelText, fn, size) {
  const btn = el(`<button type="button" class="vkbd-special ${size || ''}" data-nav>${labelText}</button>`);
  btn.addEventListener('mousedown', (e) => e.preventDefault());
  btn.addEventListener('click', fn);
  return btn;
}

function buildRow(children) {
  const row = el('<div class="vkbd-row"></div>');
  children.forEach((c) => row.appendChild(c));
  return row;
}

function buildKeyboard() {
  root = el('<div class="vkbd" hidden></div>');
  root.addEventListener('mousedown', (e) => e.preventDefault());
  ROWS.forEach((r) => root.appendChild(buildRow(r.map(keyBtn))));
  root.appendChild(buildRow(SYMBOLS.map(keyBtn)));
  root.appendChild(buildRow([
    specialBtn('Shift', toggleShift, 'wide'),
    specialBtn('Space', () => insert(' '), 'grow'),
    specialBtn('Del', backspace, 'wide'),
    specialBtn('Enter', enter, 'wide'),
    specialBtn('Done', hide, 'wide'),
  ]));
  document.getElementById('screen').appendChild(root);
}

function isTypable(node) {
  return node && node.matches && node.matches('input[type="text"], textarea') && !node.readOnly;
}

export function isOpen() { return root ? !root.hidden : false; }

export function navTargets() {
  if (!root) return [];
  return Array.from(root.querySelectorAll('.vkbd-key, .vkbd-special'));
}

export function show(target) {
  field = target;
  root.hidden = false;
  notify();
  target.scrollIntoView({ block: 'nearest' });
}

export function hide() {
  if (!root || root.hidden) return;
  root.hidden = true;
  shift = false;
  letterKeys.forEach((k) => { k.textContent = k.dataset.ch; });
  if (field) { const f = field; field = null; f.blur(); }
  notify();
}

export function init(opts = {}) {
  notify = opts.onToggle || (() => {});
  buildKeyboard();
  const screen = document.getElementById('screen');

  screen.addEventListener('focusin', (e) => {
    if (isTypable(e.target)) show(e.target);
  });

  screen.addEventListener('focusout', () => {
    setTimeout(() => {
      const a = document.activeElement;
      if (!isTypable(a)) hide();
    }, 0);
  });
}
