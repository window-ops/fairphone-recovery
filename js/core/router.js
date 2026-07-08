// Page registry and navigation stack. Owns the header bar title, back button
// and optional header action for the active page.

import { clear } from '../ui/ui.js';
import * as input from './input.js';
import * as keyboard from './keyboard.js';

const pages = new Map();
let stack = [];
let backInterceptor = null;

export function register(id, def) { pages.set(id, def); }

export function navigate(id, params = {}) {
  if (!pages.has(id)) return;
  if (stack.length > 0) {
    stack[stack.length - 1].scroll = document.getElementById('viewport').scrollTop;
  }
  stack.push({ id, params });
  render();
}

export function replace(id, params = {}) {
  stack = [{ id, params }];
  render();
}

export function back() {
  if (keyboard.isOpen()) { keyboard.hide(); return; }
  if (backInterceptor && backInterceptor()) return;
  if (stack.length <= 1) return;
  const leaving = stack.pop();
  const def = pages.get(leaving.id);
  if (def && def.onHide) def.onHide();
  render();
}

export function currentId() {
  return stack.length ? stack[stack.length - 1].id : null;
}

export function refresh() {
  if (stack.length) render(true);
}

function render(keepScroll = false) {
  const top = stack[stack.length - 1];
  const def = pages.get(top.id);
  const viewport = document.getElementById('viewport');
  const titleEl = document.getElementById('headerTitle');
  const backBtn = document.getElementById('btnBack');
  const actionBtn = document.getElementById('btnHeaderAction');

  const oldScroll = viewport.scrollTop;

  clear(viewport);
  backInterceptor = null;

  if (!keepScroll) viewport.scrollTop = 0;
  
  const ctx = { params: top.params, navigate, back, replace, refresh, setBack(fn) { backInterceptor = fn; } };
  viewport.appendChild(def.build(ctx));

  titleEl.textContent = typeof def.title === 'function' ? def.title(ctx) : def.title;
  backBtn.hidden = stack.length <= 1;

  if (def.action) {
    actionBtn.hidden = false;
    actionBtn.textContent = def.action.label;
    actionBtn.onclick = () => def.action.run(ctx);
  } else {
    actionBtn.hidden = true;
    actionBtn.onclick = null;
  }

  if (def.onShow) def.onShow(ctx, viewport);
  
  if (keepScroll) viewport.scrollTop = oldScroll;
  else if (top.scroll !== undefined) viewport.scrollTop = top.scroll;

  input.refresh(keepScroll);
}
