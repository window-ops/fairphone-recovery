// Bootloader page. Unlock is required before firmware changes. Coreboot needs
// every partition unlocked as well.

import { pageEl, intro, button, progressBlock } from '../ui/widgets.js';
import { el, dialog, toast, runSteps } from '../ui/ui.js';
import { sys } from '../core/system.js';

function pill(text, on) {
  return `<span class="status-pill ${on ? 'on' : ''}"><span class="dot"></span>${text}</span>`;
}

function runProcess(card, btn, lines, onDone) {
  const prog = progressBlock();
  const fill = prog.querySelector('.progress-fill');
  const label = prog.querySelector('.p-label');
  const log = el('<div class="log"></div>');
  card.appendChild(prog);
  card.appendChild(log);
  btn.disabled = true;
  runSteps(lines, { fill, meta: label, log, onDone });
}

export const page = {
  title: 'Bootloader',
  build(ctx) {
    const root = pageEl();
    root.appendChild(intro('Unlock the bootloader before any firmware change. Coreboot also needs every partition unlocked.'));

    const status = el('<div class="pill-row"></div>');
    status.appendChild(el(pill(sys.bootloaderUnlocked ? 'Bootloader unlocked' : 'Bootloader locked', sys.bootloaderUnlocked)));
    status.appendChild(el(pill(sys.partitionsUnlocked ? 'All partitions unlocked' : 'Partitions locked', sys.partitionsUnlocked)));
    root.appendChild(status);

    // Bootloader card
    const blCard = el(`
      <div class="root-mode">
        <h3>Bootloader</h3>
        <p>Unlocking clears user data on the device. It is the gate for flashing images and patching boot.</p>
      </div>`);
    if (!sys.bootloaderUnlocked) {
      const btn = button({ label: 'Unlock bootloader', variant: 'tonal', iconName: 'lock', block: true });
      btn.addEventListener('click', async () => {
        const ok = await dialog({
          tone: 'warning', iconName: 'lock', danger: true,
          title: 'Unlock bootloader?',
          body: 'This erases all user data and lowers the device security state. Continue?',
          confirmText: 'Unlock', cancelText: 'Cancel',
        });
        if (!ok) return;
        runProcess(blCard, btn, [
          { pct: 40, label: 'Set unlock flag', lines: [{ text: 'oem unlock requested', cls: 'accent' }], ms: 520 },
          { pct: 80, label: 'Erase user data', lines: [{ text: 'wiping userdata, metadata' }], ms: 620 },
          { pct: 100, label: 'Unlocked', lines: [{ text: 'bootloader unlocked', cls: 'ok' }], ms: 480 },
        ], () => { sys.bootloaderUnlocked = true; toast('Bootloader unlocked', 'ok'); ctx.refresh(); });
      });
      blCard.appendChild(btn);
    } else {
      const btn = button({ label: 'Relock bootloader', variant: 'outline', block: true });
      btn.addEventListener('click', async () => {
        const ok = await dialog({
          tone: 'info', iconName: 'lock',
          title: 'Relock bootloader?',
          body: 'Relocking also relocks all partitions and blocks firmware changes.',
          confirmText: 'Relock', cancelText: 'Cancel',
        });
        if (!ok) return;
        sys.bootloaderUnlocked = false;
        sys.partitionsUnlocked = false;
        toast('Bootloader relocked');
        ctx.refresh();
      });
      blCard.appendChild(btn);
    }
    root.appendChild(blCard);

    // Partitions card
    const partCard = el(`
      <div class="root-mode">
        <h3>All partitions</h3>
        <p>Coreboot rewrites the whole storage, so every partition has to be unlocked before flashing it.</p>
      </div>`);
    if (!sys.bootloaderUnlocked) {
      const btn = button({ label: 'Unlock all partitions', variant: 'tonal', iconName: 'disk', block: true });
      btn.disabled = true;
      partCard.appendChild(btn);
    } else if (!sys.partitionsUnlocked) {
      const btn = button({ label: 'Unlock all partitions', variant: 'tonal', iconName: 'disk', block: true });
      btn.addEventListener('click', async () => {
        const ok = await dialog({
          tone: 'warning', iconName: 'disk', danger: true,
          title: 'Unlock all partitions?',
          body: 'Removes the per partition write protection across the device. This is required for coreboot.',
          confirmText: 'Unlock all', cancelText: 'Cancel',
        });
        if (!ok) return;
        runProcess(partCard, btn, [
          { pct: 50, label: 'Clear partition locks', lines: [{ text: 'clearing write protect on all partitions', cls: 'accent' }], ms: 560 },
          { pct: 100, label: 'Unlocked', lines: [{ text: 'all partitions unlocked', cls: 'ok' }], ms: 480 },
        ], () => { sys.partitionsUnlocked = true; toast('All partitions unlocked', 'ok'); ctx.refresh(); });
      });
      partCard.appendChild(btn);
    } else {
      const btn = button({ label: 'Relock all partitions', variant: 'outline', block: true });
      btn.addEventListener('click', () => {
        sys.partitionsUnlocked = false;
        toast('Partitions relocked');
        ctx.refresh();
      });
      partCard.appendChild(btn);
    }
    root.appendChild(partCard);

    return root;
  },
};
