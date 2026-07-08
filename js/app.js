// Application entry point. Wires the stage controls, the device frame and the router.

import * as router from './core/router.js';
import * as input from './core/input.js';
import * as keyboard from './core/keyboard.js';
import { applyDevice, applyFrame } from './core/device.js';

import { page as home } from './pages/home.js';
import { page as flash } from './pages/flash.js';
import { page as partitions } from './pages/partitions.js';
import { page as shell } from './pages/shell.js';
import { page as root } from './pages/root.js';
import { page as mok } from './pages/mok.js';
import { page as coreboot } from './pages/coreboot.js';
import { page as homebrew } from './pages/homebrew.js';
import { page as backup } from './pages/backup.js';
import { page as bootloader } from './pages/bootloader.js';
import { page as linux } from './pages/linux.js';
import { page as antibrick } from './pages/antibrick.js';
import { page as about } from './pages/about.js';

router.register('home', home);
router.register('flash', flash);
router.register('partitions', partitions);
router.register('shell', shell);
router.register('root', root);
router.register('mok', mok);
router.register('coreboot', coreboot);
router.register('homebrew', homebrew);
router.register('backup', backup);
router.register('bootloader', bootloader);
router.register('linux', linux);
router.register('antibrick', antibrick);
router.register('about', about);

function setSegment(groupEl, activeBtn) {
  groupEl.querySelectorAll('button').forEach((b) => b.setAttribute('aria-checked', String(b === activeBtn)));
}

function initStageControls() {
  const deviceGroup = document.getElementById('deviceSelect');
  deviceGroup.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-device]');
    if (!btn) return;
    setSegment(deviceGroup, btn);
    applyDevice(btn.dataset.device);
    router.refresh();
  });

  const frameGroup = document.getElementById('frameSelect');
  frameGroup.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-frame]');
    if (!btn) return;
    setSegment(frameGroup, btn);
    applyFrame(btn.dataset.frame);
  });

  document.getElementById('stageHint').textContent =
    'Navigate with the side keys, touch, or a keyboard (arrows, Enter/Space, Escape). Volume keys also scroll.';
}

function initClock() {
  const clock = document.getElementById('statusClock');
  const tick = () => {
    const d = new Date();
    clock.textContent = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  };
  tick();
  setInterval(tick, 20000);
}

function isPhone() {
  return window.matchMedia('(max-width: 640px)').matches || window.matchMedia('(pointer: coarse)').matches;
}

function applyViewportMode() {
  document.body.classList.toggle('mobile', isPhone());
}

function boot() {
  applyViewportMode();
  window.addEventListener('resize', applyViewportMode);

  applyDevice('fp5');
  applyFrame('on');
  initStageControls();
  initClock();

  document.getElementById('btnBack').addEventListener('click', () => router.back());
  input.setBackHandler(router.back);
  input.init();
  keyboard.init({ onToggle: () => input.refresh() });

  router.replace('home');
}

boot();
