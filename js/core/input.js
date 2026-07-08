// Navigation across touch, keyboard and the on-screen volume plus power keys.
// A single focus ring moves over elements marked with data-nav inside the viewport.

import { isModalOpen } from '../ui/ui.js';
import * as keyboard from './keyboard.js';

let targets = [];
let index = -1;
let backHandler = () => {};
let keyNavActive = false;

export function setBackHandler(fn) { backHandler = fn; }
export function isKeyNavActive() { return keyNavActive; }

function apply() {
  const show = keyNavActive;
  targets.forEach((t, i) => t.classList.toggle('is-focused', show && i === index));
  const active = targets[index];
  if (show && active) active.scrollIntoView({ block: 'nearest' });
}

function activateKeyNav() {
  keyNavActive = true;
  apply();
}

const HW_BTN_IDS = ['hwVolUp', 'hwVolDown', 'hwPower'];

function deactivateKeyNav(e) {
  // Pointer clicks on the on-screen hw buttons are intentional key-nav gestures
  if (e && HW_BTN_IDS.some((id) => document.getElementById(id)?.contains(e.target))) return;
  if (!keyNavActive) return;
  keyNavActive = false;
  targets.forEach((t) => t.classList.remove('is-focused'));
  modalButtons().forEach((b) => b.classList.remove('is-focused'));
}

const INTERACTIVE = 'button, [href], input, select, textarea, [role="switch"], [data-nav]';

export function refresh(keepState = false) {
  const oldIndex = index;
  if (keyboard.isOpen()) {
    targets = keyboard.navTargets().filter((e) => !e.disabled && e.offsetParent !== null);
    index = targets.length ? (keepState && oldIndex >= 0 && oldIndex < targets.length ? oldIndex : 0) : -1;
    apply();
    return;
  }
  const screen = document.getElementById('screen');
  targets = Array.from(screen.querySelectorAll(INTERACTIVE)).filter((e) => (
    !e.disabled &&
    !e.hasAttribute('hidden') &&
    !e.closest('.vkbd') &&
    !e.closest('.dialog-layer') &&
    !e.closest('.toast-layer') &&
    e.offsetParent !== null
  ));
  const vp = document.getElementById('viewport');
  if (keyNavActive && targets.length) {
    if (keepState && oldIndex >= 0 && oldIndex < targets.length) {
      index = oldIndex;
    } else {
      const start = targets.findIndex((e) => vp.contains(e));
      index = start >= 0 ? start : 0;
    }
  } else {
    index = -1;
  }
  apply();
}

const SCROLL_STEP = 120;
function viewportEl() { return document.getElementById('viewport'); }

export function moveDown() {
  activateKeyNav();
  if (isModalOpen()) { modalStep(1); return; }
  if (!targets.length || index >= targets.length - 1) {
    viewportEl().scrollBy({ top: SCROLL_STEP });
    return;
  }
  index += 1;
  apply();
}

export function moveUp() {
  activateKeyNav();
  if (isModalOpen()) { modalStep(-1); return; }
  if (!targets.length || index <= 0) {
    viewportEl().scrollBy({ top: -SCROLL_STEP });
    return;
  }
  index -= 1;
  apply();
}

export function select() {
  if (isModalOpen()) { modalSelect(); return; }
  const active = targets[index];
  if (active) active.click();
}

// Dialog navigation for the volume and power keys.
let modalIndex = -1;

function modalButtons() {
  const layer = document.getElementById('dialogLayer');
  if (!layer || layer.hidden) return [];
  return Array.from(layer.querySelectorAll('.btn')).filter((b) => b.offsetParent !== null && !b.disabled);
}

function applyModal() {
  const show = keyNavActive;
  const btns = modalButtons();
  btns.forEach((b, i) => b.classList.toggle('is-focused', show && i === modalIndex));
}

function modalStep(dir) {
  const btns = modalButtons();
  if (!btns.length) return;
  if (modalIndex < 0) modalIndex = btns.length - 1;
  else modalIndex = (modalIndex + dir + btns.length) % btns.length;
  applyModal();
}

function modalSelect() {
  const btns = modalButtons();
  if (!btns.length) return;
  if (modalIndex < 0) {
    const cancelIdx = btns.findIndex((x) => x.classList.contains('cancel'));
    modalIndex = cancelIdx >= 0 ? cancelIdx : 0;
  }
  const b = btns[modalIndex];
  if (b) b.click();
}

function isTextField(node) {
  return node && (node.tagName === 'INPUT' || node.tagName === 'SELECT' || node.tagName === 'TEXTAREA');
}

function onKey(e) {
  const active = document.activeElement;
  if (!isModalOpen() && isTextField(active)) {
    if (e.key === 'Escape') active.blur();
    // When the on-screen keyboard is open, vertical arrows act as volume keys.
    // If key navigation is active, Enter and Space act as the power button.
    if (!keyboard.isOpen()) return;
    const isNav = e.key === 'ArrowUp' || e.key === 'ArrowDown' || (keyNavActive && (e.key === 'Enter' || e.key === ' '));
    if (!isNav) return;
  }
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault(); moveDown(); break;
    case 'ArrowUp':
      e.preventDefault(); moveUp(); break;
    case 'Enter':
    case ' ':
      e.preventDefault(); select(); break;
    case 'Escape':
    case 'Backspace':
    case 'ArrowLeft':
      if (!isModalOpen()) { e.preventDefault(); backHandler(); }
      break;
    default:
      break;
  }
}

export function init() {
  document.addEventListener('keydown', onKey);

  // Deactivate key-nav highlighting on any pointer interaction
  const pointerEvents = ['mousedown', 'touchstart', 'pointerdown'];
  pointerEvents.forEach((ev) =>
    document.addEventListener(ev, deactivateKeyNav, { passive: true })
  );

  const bind = (id, fn) => {
    const b = document.getElementById(id);
    if (!b) return;
    b.addEventListener('mousedown', (e) => e.preventDefault());
    b.addEventListener('click', () => fn());
  };
  bind('hwVolUp', moveUp);
  bind('hwVolDown', moveDown);
  bind('hwPower', select);

  const dl = document.getElementById('dialogLayer');
  if (dl) {
    new MutationObserver(() => {
      const btns = modalButtons();
      if (!btns.length) { modalIndex = -1; return; }
      const cancelIdx = btns.findIndex((b) => b.classList.contains('cancel'));
      modalIndex = cancelIdx >= 0 ? cancelIdx : 0;
      applyModal();
    }).observe(dl, { childList: true });
  }
}
