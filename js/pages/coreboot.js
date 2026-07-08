// Coreboot flasher. Backs up stock firmware, ports coreboot to arm64, repartitions
// the internal storage to a PC style GPT, then writes the new firmware.

import { pageEl, intro, banner, button, progressBlock } from '../ui/widgets.js';
import { el, esc, dialog, toast, logLine } from '../ui/ui.js';
import { currentDevice } from '../core/device.js';
import { addBackup } from './backup.js';
import { sys } from '../core/system.js';
import { runRebootDemo } from './home.js';

const STEPS = [
  { key: 'backup', text: 'Back up stock firmware to /nand/firmware-backup.img', log: 'dumping bootloader, modem, vbmeta, persist', ms: 700 },
  { key: 'download', text: 'Download coreboot into /nand', log: 'fetching coreboot into /nand, the NAND module near the recovery chip', ms: 650 },
  { key: 'port', text: 'Port and cross-compile for arm64', log: 'building payload for aarch64 target', ms: 900 },
  { key: 'repartition', text: 'Repartition internal storage to GPT', log: 'creating PC style GPT layout (all partitions removed)', ms: 800, danger: true },
  { key: 'flash', text: 'Write coreboot and firmware payload', log: 'flashing coreboot + UEFI payload from /nand', ms: 750 },
  { key: 'reboot', text: 'Reboot to firmware setup', log: 'handoff to coreboot', ms: 500 },
];

export const page = {
  title: 'Flash coreboot',
  build(ctx) {
    const dev = currentDevice();
    const root = pageEl();
    root.classList.add('page--coreboot');
    root.appendChild(intro('Replace the stock firmware on the ' + dev.name + ' with coreboot. The storage is converted to a GPT so the phone behaves like a PC.'));

    root.appendChild(banner({
      tone: 'danger', iconName: 'warning',
      title: 'This erases the whole device',
      text: 'Converting the internal storage to GPT for coreboot compatibility removes every existing partition. The stock firmware is backed up first so the original layout can be written back.',
    }));

    if (sys.coreboot) {
      root.appendChild(el('<span class="status-pill on"><span class="dot"></span>coreboot installed this session</span>'));
    }

    const stepsWrap = el('<div class="group" style="padding:8px 12px;"><div class="coreboot-steps"></div></div>');
    const stepsList = stepsWrap.querySelector('.coreboot-steps');
    const stepEls = STEPS.map((s, i) => {
      const done = sys.coreboot;
      const node = el(`
        <div class="coreboot-step ${done ? 'done' : ''}" data-key="${s.key}">
          <span class="marker">${done ? '\u2713' : i + 1}</span>
          <span>${esc(s.text)}</span>
        </div>`);
      stepsList.appendChild(node);
      return node;
    });
    root.appendChild(stepsWrap);

    const prog = progressBlock();
    root.appendChild(prog);
    const log = el('<div class="log" hidden></div>');
    root.appendChild(log);

    const beginBtn = button({
      label: sys.coreboot ? 'Reboot to firmware setup' : 'Begin coreboot flash',
      variant: sys.coreboot ? 'filled' : 'destructive',
      iconName: 'board', block: true,
    });
    root.appendChild(beginBtn);

    const fill = prog.querySelector('.progress-fill');
    const label = prog.querySelector('.p-label');
    const pctEl = prog.querySelector('.p-pct');

    if (sys.coreboot) {
      fill.classList.add('success');
      fill.style.width = '100%';
      pctEl.textContent = '100%';
      label.textContent = 'coreboot active';
      log.hidden = false;
      log.textContent = 'coreboot installed. Firmware backup saved to Backup and restore.';
    }

    beginBtn.addEventListener('click', async () => {
      if (sys.coreboot) {
        runRebootDemo(ctx, 'recovery');
        return;
      }
      if (!sys.bootloaderUnlocked || !sys.partitionsUnlocked) {
        await dialog({
          tone: 'warning', iconName: 'lock',
          title: 'Unlock required',
          body: 'Flashing coreboot needs the bootloader and all partitions unlocked. Open the Bootloader page first.',
          confirmText: 'OK', cancelText: '',
        });
        return;
      }
      const first = await dialog({
        tone: 'danger', iconName: 'warning', danger: true,
        title: 'Convert to GPT?',
        body: 'All partitions on the internal storage will be deleted during the switch to a PC style layout.',
        confirmText: 'I understand', cancelText: 'Cancel',
      });
      if (!first) return;
      const second = await dialog({
        tone: 'danger', iconName: 'board', danger: true,
        title: 'Flash coreboot now?',
        body: 'The stock firmware backup is written first, then coreboot replaces it. Continue?',
        confirmText: 'Flash coreboot', cancelText: 'Go back',
      });
      if (!second) return;

      beginBtn.disabled = true;
      document.getElementById('btnBack').hidden = true;
      ctx.setBack(() => true);
      log.hidden = false;
      log.textContent = '';
      fill.classList.add('danger');

      let i = 0;
      const run = () => {
        if (i >= STEPS.length) {
          fill.classList.remove('danger');
          fill.classList.add('success');
          fill.style.width = '100%';
          pctEl.textContent = '100%';
          label.textContent = 'coreboot active';
          sys.coreboot = true;
          addBackup({
            name: 'pre-flash',
            size: '256 MiB',
            parts: 'stock firmware (bootloader, modem, vbmeta, persist)',
          });
          toast('coreboot flashed. Backup saved to Backup and restore.', 'ok');
          beginBtn.disabled = false;
          // Replace so the navigation stack has only this page, hiding the back button
          ctx.replace('coreboot');
          return;
        }
        const step = STEPS[i];
        const node = stepEls[i];
        node.classList.add('active');
        label.textContent = step.text;
        fill.style.width = Math.round(((i + 0.5) / STEPS.length) * 100) + '%';
        pctEl.textContent = Math.round(((i + 0.5) / STEPS.length) * 100) + '%';
        logLine(log, '> ' + step.log, step.danger ? 'warn' : 'accent');
        setTimeout(() => {
          node.classList.remove('active');
          node.classList.add('done');
          node.querySelector('.marker').innerHTML = '\u2713';
          i += 1;
          run();
        }, step.ms);
      };
      run();
    });

    return root;
  },
};
