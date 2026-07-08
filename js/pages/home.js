// Home menu. Standard recovery actions live inline; advanced tools open their pages.
// After coreboot is installed, the Android based tools are replaced by Linux tools.

import { pageEl, labelledGroup, row, banner as bannerFn } from '../ui/widgets.js';
import { el, logLine, dialog, toast } from '../ui/ui.js';
import { currentDevice } from '../core/device.js';
import { sys } from '../core/system.js';

export function runRebootDemo(ctx, target) {
  const screen = document.getElementById('screen');
  const overlay = el(`
    <div class="boot-screen">
      <div class="boot-title">Demonstration reboot</div>
      <div class="boot-log" id="bootLog"></div>
    </div>`);
  screen.appendChild(overlay);
  const log = overlay.querySelector('#bootLog');
  const lines = [
    { t: 'This build simulates a reboot. No real restart happens.', c: 'dim' },
    { t: '$ svc power reboot ' + target, c: 'accent' },
    { t: '$ stop', c: 'accent' },
    { t: '$ start', c: 'accent' },
    { t: '$ setprop sys.boot_completed 0', c: 'accent' },
    { t: '$ /system/bin/recovery --show_text', c: 'accent' },
    { t: 'Returning to the recovery screen...', c: 'ok' },
  ];
  let i = 0;
  const tick = () => {
    if (i >= lines.length) {
      setTimeout(() => { overlay.remove(); ctx.replace('home'); }, 650);
      return;
    }
    logLine(log, lines[i].t, lines[i].c);
    i += 1;
    setTimeout(tick, 470);
  };
  tick();
}

async function reboot(ctx, target) {
  const ok = await dialog({
    tone: 'info', iconName: 'reboot',
    title: 'Reboot ' + target + '?',
    body: 'The device restarts into <b>' + target + '</b>. Any running recovery task stops.',
    confirmText: 'Reboot', cancelText: 'Cancel',
  });
  if (ok) runRebootDemo(ctx, target);
}

async function powerOff() {
  const ok = await dialog({
    tone: 'info', iconName: 'power',
    title: 'Power off?',
    body: 'The device turns off. In this demo the screen stays for inspection.',
    confirmText: 'Power off', cancelText: 'Cancel',
  });
  if (ok) toast('Power off requested');
}

async function wipeCache() {
  const ok = await dialog({
    tone: 'warning', iconName: 'broom',
    title: 'Wipe cache partition?',
    body: 'Clears cached app and system data. Personal data stays intact.',
    confirmText: 'Wipe cache', cancelText: 'Cancel',
  });
  if (ok) toast('Cache partition wiped', 'ok');
}

async function factoryReset() {
  const ok = await dialog({
    tone: 'danger', iconName: 'trash', danger: true,
    title: 'Factory reset',
    body: 'This erases all user data and installed apps on the active slot. The action cannot be undone.',
    confirmText: 'Erase everything', cancelText: 'Keep data',
  });
  if (ok) toast('User data erased', 'ok');
}

async function applyOta() {
  const ok = await dialog({
    tone: 'info', iconName: 'update',
    title: 'Apply update package',
    body: 'Sideload a signed OTA package over ADB onto the inactive slot.',
    confirmText: 'Wait for package', cancelText: 'Cancel',
  });
  if (ok) toast('Listening for ADB sideload', 'ok');
}

function androidHome(ctx, dev) {
  const root = pageEl();

  root.appendChild(labelledGroup('System', [
    row({ iconName: 'reboot', title: 'Reboot system now', sub: 'Boot the active slot', chevron: false, onClick: () => reboot(ctx, 'system') }),
    row({ iconName: 'chip', tone: 'neutral', title: 'Reboot to bootloader', sub: 'fastboot mode', chevron: false, onClick: () => reboot(ctx, 'bootloader') }),
    row({ iconName: 'power', tone: 'neutral', title: 'Power off', chevron: false, onClick: powerOff }),
  ]));

  const lock = sys.bootloaderUnlocked ? (sys.partitionsUnlocked ? 'unlocked, all partitions' : 'unlocked') : 'locked';
  root.appendChild(labelledGroup('Security', [
    row({ iconName: 'lock', tone: sys.bootloaderUnlocked ? 'neutral' : 'warning', title: 'Bootloader', sub: lock, onClick: () => ctx.navigate('bootloader') }),
  ]));

  root.appendChild(labelledGroup('Install', [
    row({ iconName: 'install', title: 'Flash ROM', sub: 'Write a system image to a slot', onClick: () => ctx.navigate('flash') }),
    row({ iconName: 'update', title: 'Apply update package', sub: 'ADB sideload', chevron: false, onClick: applyOta }),
  ]));

  root.appendChild(labelledGroup('Storage', [
    row({ iconName: 'disk', title: 'Partitions', sub: 'Layout, slots and mounts', onClick: () => ctx.navigate('partitions') }),
    row({ iconName: 'broom', tone: 'warning', title: 'Wipe cache partition', chevron: false, onClick: wipeCache }),
    row({ iconName: 'trash', tone: 'destructive', title: 'Factory reset', sub: 'Erase user data', chevron: false, onClick: factoryReset }),
    row({ iconName: 'archive', title: 'Backup and restore', sub: 'Save or roll back partitions', onClick: () => ctx.navigate('backup') }),
  ]));

  root.appendChild(labelledGroup('Advanced', [
    row({ iconName: 'terminal', title: 'Shell', sub: 'Recovery command line', onClick: () => ctx.navigate('shell') }),
    row({ iconName: 'disc', title: 'Homebrew', sub: 'Run bootable media from RAM', onClick: () => ctx.navigate('homebrew') }),
    row({ iconName: 'shield', title: 'Root manager', sub: 'Temporary or permanent root', onClick: () => ctx.navigate('root') }),
    row({ iconName: 'key', tone: 'warning', title: 'MOK manager', sub: 'Machine Owner Keys', onClick: () => ctx.navigate('mok') }),
    row({ iconName: 'board', tone: 'destructive', title: 'Flash coreboot firmware', sub: 'Repartition and replace firmware', onClick: () => ctx.navigate('coreboot') }),
    row({ iconName: 'lifebuoy', title: 'Anti-brick tools', sub: 'Repair a device stuck at boot', onClick: () => ctx.navigate('antibrick') }),
  ]));

  root.appendChild(labelledGroup(dev.name, [
    row({ iconName: 'info', tone: 'neutral', title: 'About this recovery', sub: dev.soc + ' \u00b7 ' + dev.aspect, onClick: () => ctx.navigate('about') }),
  ]));

  return root;
}

function corebootHome(ctx, dev) {
  const root = pageEl();

  root.appendChild(bannerFn({
    tone: 'info', iconName: 'board',
    title: 'coreboot is installed',
    text: 'Android based functions are unavailable. This recovery screen runs from a small NVRAM chip near the SoC, so it stays reachable.',
  }));

  root.appendChild(labelledGroup('System', [
    row({ iconName: 'reboot', title: 'Reboot system now', sub: 'Boot the active slot', chevron: false, onClick: () => reboot(ctx, 'system') }),
    row({ iconName: 'power', tone: 'neutral', title: 'Power off', chevron: false, onClick: powerOff }),
  ]));

  root.appendChild(labelledGroup('Linux', [
    row({ iconName: 'install', title: 'Install ARM Linux', sub: sys.linuxInstalled ? 'installed' : 'phosh or plasma', onClick: () => ctx.navigate('linux') }),
    row({ iconName: 'lifebuoy', title: 'Install Librephone', sub: sys.librephone ? 'installed, basic calling' : 'FSF, basic calling', onClick: () => ctx.navigate('linux') }),
  ]));

  root.appendChild(labelledGroup('Storage', [
    row({ iconName: 'disk', title: 'Partitions', sub: 'coreboot GPT layout', onClick: () => ctx.navigate('partitions') }),
    row({ iconName: 'archive', title: 'Backup and restore', sub: 'Save or roll back partitions', onClick: () => ctx.navigate('backup') }),
  ]));

  root.appendChild(labelledGroup('Tools', [
    row({ iconName: 'disc', title: 'Homebrew', sub: 'Run bootable media from RAM', onClick: () => ctx.navigate('homebrew') }),
    row({ iconName: 'lifebuoy', title: 'Anti-brick tools', sub: 'Repair a device stuck at boot', onClick: () => ctx.navigate('antibrick') }),
  ]));

  root.appendChild(labelledGroup('Unavailable after coreboot', [
    row({ iconName: 'install', title: 'Flash ROM', sub: 'Android image', disabled: true }),
    row({ iconName: 'update', title: 'Apply update package', sub: 'Android OTA', disabled: true }),
    row({ iconName: 'shield', title: 'Root manager', sub: 'Android root', disabled: true }),
    row({ iconName: 'key', title: 'MOK manager', sub: 'Android boot keys', disabled: true }),
  ]));

  root.appendChild(labelledGroup(dev.name, [
    row({ iconName: 'info', tone: 'neutral', title: 'About this recovery', sub: dev.soc + ' \u00b7 ' + dev.aspect, onClick: () => ctx.navigate('about') }),
  ]));

  return root;
}

export const page = {
  title: 'Recovery Setup',
  build(ctx) {
    const dev = currentDevice();
    return sys.coreboot ? corebootHome(ctx, dev) : androidHome(ctx, dev);
  },
};
