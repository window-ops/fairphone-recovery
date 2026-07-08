// Anti-brick tools. Recovery actions that repair a device stuck at boot.
// Available in both the Android and the coreboot state.

import { pageEl, intro, button, progressBlock } from '../ui/widgets.js';
import { el, dialog, toast, runSteps } from '../ui/ui.js';

let busy = false;

function tool(card, btn, steps, done) {
  const prog = progressBlock();
  const fill = prog.querySelector('.progress-fill');
  const label = prog.querySelector('.p-label');
  const log = el('<div class="log"></div>');
  card.appendChild(prog);
  card.appendChild(log);
  btn.disabled = true;
  busy = true;
  runSteps(steps, { fill, meta: label, log, onDone() { busy = false; done(); } });
}

function makeCard(title, text, label, variant, iconName, confirmBody, steps, doneMsg) {
  const card = el(`<div class="root-mode"><h3>${title}</h3><p>${text}</p></div>`);
  const btn = button({ label, variant, iconName, block: true });
  btn.addEventListener('click', async (ev) => {
    void ev;
    if (busy) return;
    const ok = await dialog({ tone: 'warning', iconName, title, body: confirmBody, confirmText: label, cancelText: 'Cancel' });
    if (!ok) return;
    tool(card, btn, steps, () => toast(doneMsg, 'ok'));
  });
  card.appendChild(btn);
  return card;
}

export const page = {
  title: 'Anti-brick tools',
  build() {
    const root = pageEl();
    root.appendChild(intro('Repair actions for a device that fails to boot. Each one runs from the recovery chip.'));

    root.appendChild(makeCard(
      'Restore boot loader',
      'Write a known good boot loader back from the /nand backup.',
      'Restore boot loader', 'tonal', 'lock',
      'Reflash the boot loader from the /nand backup. The device reboots afterwards.',
      [
        { pct: 40, label: 'Read boot loader from /nand', lines: [{ text: 'reading nand backup', cls: 'accent' }], ms: 560 },
        { pct: 100, label: 'Write boot loader', lines: [{ text: 'boot loader restored', cls: 'ok' }], ms: 560 },
      ],
      'Boot loader restored',
    ));

    root.appendChild(makeCard(
      'Rebuild partition table',
      'Rewrite the GPT from the recovery chip when the table is damaged.',
      'Rebuild GPT', 'tonal', 'disk',
      'Rewrite the GPT on the internal storage. Existing partitions keep their data where the entries survive.',
      [
        { pct: 50, label: 'Scan partitions', lines: [{ text: 'scanning for partition signatures', cls: 'accent' }], ms: 560 },
        { pct: 100, label: 'Write GPT', lines: [{ text: 'partition table rebuilt', cls: 'ok' }], ms: 540 },
      ],
      'Partition table rebuilt',
    ));

    root.appendChild(makeCard(
      'Verify recovery image',
      'Check the recovery image stored on the NVRAM chip.',
      'Verify recovery', 'outline', 'shield',
      'Verify the recovery image on the NVRAM chip against its checksum.',
      [
        { pct: 60, label: 'Read recovery image', lines: [{ text: 'reading recovery slot', cls: 'accent' }], ms: 520 },
        { pct: 100, label: 'Verify checksum', lines: [{ text: 'recovery image ok', cls: 'ok' }], ms: 500 },
      ],
      'Recovery image verified',
    ));

    return root;
  },
};
