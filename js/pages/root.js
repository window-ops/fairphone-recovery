// Root manager. Temporary root lasts until reboot; permanent root patches boot.

import { pageEl, intro, banner, button } from '../ui/widgets.js';
import { el, dialog, toast, runSteps } from '../ui/ui.js';
import { sys } from '../core/system.js';
import { addBackup } from './backup.js';

const rootState = { mode: 'none' };

function statusPill() {
  if (rootState.mode === 'permanent') return '<span class="status-pill on"><span class="dot"></span>Permanent root active</span>';
  if (rootState.mode === 'temp') return '<span class="status-pill temp"><span class="dot"></span>Temporary root until reboot</span>';
  return '<span class="status-pill"><span class="dot"></span>Root not granted</span>';
}

export const page = {
  title: 'Root manager',
  build(ctx) {
    const root = pageEl();
    root.appendChild(intro('Grant a shell elevated rights for this session, or patch the boot image so root persists across reboots.'));
    root.appendChild(el(statusPill()));

    // Temporary root card
    const tempCard = el(`
      <div class="root-mode">
        <h3>Temporary root</h3>
        <p>Mounts an overlay and starts a privileged daemon. Everything reverts on the next reboot. Verified boot state stays unchanged.</p>
      </div>`);
    const tempBtn = button({
      label: rootState.mode === 'temp' ? 'Revoke temporary root' : 'Grant until reboot',
      variant: rootState.mode === 'temp' ? 'outline' : 'tonal', block: true,
    });
    tempBtn.addEventListener('click', () => {
      if (rootState.mode === 'temp') { rootState.mode = 'none'; toast('Temporary root revoked'); }
      else { rootState.mode = 'temp'; toast('Temporary root granted', 'ok'); }
      ctx.refresh();
    });
    tempCard.appendChild(tempBtn);
    root.appendChild(tempCard);

    // Permanent root card
    const permCard = el(`
      <div class="root-mode">
        <h3>Permanent root</h3>
        <p>Patches the active boot image with a root manager. It survives reboots and can be removed by restoring the stock boot image.</p>
      </div>`);
    const log = el('<div class="log" hidden></div>');
    const permBtn = button({
      label: rootState.mode === 'permanent' ? 'Remove permanent root' : 'Patch boot image',
      variant: rootState.mode === 'permanent' ? 'outline' : 'filled', block: true,
    });
    permBtn.addEventListener('click', async () => {
      if (rootState.mode === 'permanent') {
        const ok = await dialog({ tone: 'info', iconName: 'shield', title: 'Restore stock boot?', body: 'Writes the unpatched boot image back and removes root.', confirmText: 'Restore', cancelText: 'Cancel' });
        if (ok) { rootState.mode = 'none'; toast('Stock boot restored', 'ok'); ctx.refresh(); }
        return;
      }
      const ok = await dialog({
        tone: 'warning', iconName: 'shield',
        title: 'Patch boot image?',
        body: 'Modifies verified boot. Some apps that check device integrity may stop working.',
        confirmText: 'Patch', cancelText: 'Cancel',
      });
      if (!ok) return;
      if (!sys.bootloaderUnlocked) {
        await dialog({
          tone: 'warning', iconName: 'lock',
          title: 'Bootloader is locked',
          body: 'Unlock the bootloader from the Bootloader page before patching the boot image.',
          confirmText: 'OK', cancelText: '',
        });
        permBtn.disabled = false;
        return;
      }
      permBtn.disabled = true;
      log.hidden = false;
      log.textContent = '';
      runSteps([
        { lines: [{ text: 'extracting boot_a', cls: 'accent' }], ms: 460 },
        { lines: [{ text: 'patching ramdisk with root manager' }], ms: 620 },
        { lines: [{ text: 'writing patched boot_a', cls: 'ok' }], ms: 520 },
      ], { log, onDone() {
        rootState.mode = 'permanent';
        addBackup({ name: 'pre-root', size: '64 MiB', parts: 'boot_a (unpatched)' });
        toast('Permanent root installed', 'ok');
        ctx.refresh();
      } });
    });
    permCard.appendChild(permBtn);
    permCard.appendChild(log);
    root.appendChild(permCard);

    root.appendChild(banner({
      tone: 'info', iconName: 'info',
      text: 'Payment and banking apps often refuse to run with root present.',
    }));

    return root;
  },
};
