// Backup catalog. Creates partition backups, lists them, restores or removes them.

import { pageEl, intro, button, progressBlock } from '../ui/widgets.js';
import { el, esc, dialog, toast, runSteps } from '../ui/ui.js';
import { icon } from '../ui/icons.js';
import { sys } from '../core/system.js';

const catalog = [];
let busy = false;

function fmtNow() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
}

export function addBackup(entry) {
  const stamp = Date.now();
  catalog.unshift({
    id: entry.id || 'bk' + stamp,
    name: entry.name || 'backup-' + String(stamp).slice(-6),
    when: entry.when || fmtNow(),
    size: entry.size || '3.4 GiB',
    parts: entry.parts || 'boot + system + data',
    slot: entry.slot || 'A',
  });
}

function itemEl(b, onRestore, onDelete) {
  const node = el(`
    <div class="backup-item">
      <span class="row-icon">${icon('archive')}</span>
      <span class="b-info">
        <span class="b-name">${esc(b.name)}</span>
        <span class="b-meta">${esc(b.when)} \u00b7 ${esc(b.size)} \u00b7 ${esc(b.parts)}</span>
      </span>
    </div>`);
  const actions = el('<div class="b-actions"></div>');
  const restoreBtn = button({ label: 'Restore', variant: 'tonal' });
  restoreBtn.addEventListener('click', () => onRestore(b));
  const delBtn = button({ label: 'Delete', variant: 'outline' });
  delBtn.addEventListener('click', () => onDelete(b));
  actions.appendChild(restoreBtn);
  actions.appendChild(delBtn);
  node.appendChild(actions);
  return node;
}

export const page = {
  title: 'Backup and restore',
  build(ctx) {
    const root = pageEl();
    root.appendChild(intro('Save the active slot to an image on storage, then restore or remove saved images.'));

    const createBtn = button({ label: 'Create backup', variant: 'filled', iconName: 'archive', block: true });
    const progWrap = el('<div class="backup-progress"></div>');
    progWrap.hidden = true;
    const prog = progressBlock();
    const fill = prog.querySelector('.progress-fill');
    const label = prog.querySelector('.p-label');
    const log = el('<div class="log"></div>');
    progWrap.appendChild(prog);
    progWrap.appendChild(log);

    createBtn.addEventListener('click', async () => {
      if (busy) return;
      const ok = await dialog({
        tone: 'info', iconName: 'archive',
        title: 'Create backup',
        body: 'Save boot, system and user data from the active slot to an image on storage.',
        confirmText: 'Create', cancelText: 'Cancel',
      });
      if (!ok) return;
      busy = true;
      createBtn.disabled = true;
      progWrap.hidden = false;
      log.textContent = '';
      runSteps([
        { pct: 25, label: 'Read boot and system', lines: [{ text: 'reading boot_a, system_a', cls: 'accent' }], ms: 520 },
        { pct: 60, label: 'Compress image', lines: [{ text: 'compressing to backup.img' }], ms: 620 },
        { pct: 90, label: 'Write to /sdcard/backups', lines: [{ text: 'writing image' }], ms: 540 },
        { pct: 100, label: 'Verify checksum', lines: [{ text: 'checksum ok', cls: 'ok' }], ms: 500 },
      ], {
        fill, meta: label, log,
        onDone() {
          const stamp = Date.now();
          catalog.unshift({
            id: 'bk' + stamp,
            name: 'backup-' + String(stamp).slice(-6),
            when: fmtNow(),
            size: '3.4 GiB',
            parts: 'boot + system + data',
            slot: 'A',
          });
          busy = false;
          toast('Backup created', 'ok');
          ctx.refresh();
        },
      });
    });

    root.appendChild(createBtn);
    root.appendChild(progWrap);

    const onRestore = async (b) => {
      if (busy) return;
      const ok = await dialog({
        tone: 'warning', iconName: 'update',
        title: 'Restore backup?',
        body: 'Reflash <b>' + esc(b.name) + '</b> to the active slot. This removes coreboot and writes the original firmware back. Current data on the slot is overwritten.',
        confirmText: 'Restore', cancelText: 'Cancel',
      });
      if (!ok) return;
      busy = true;
      progWrap.hidden = false;
      log.textContent = '';
      fill.style.width = '0%';
      runSteps([
        { pct: 20, label: 'Verify image checksum', lines: [{ text: 'checking ' + b.name, cls: 'accent' }], ms: 520 },
        { pct: 45, label: 'Erase target partitions', lines: [{ text: 'erasing coreboot GPT layout' }], ms: 560 },
        { pct: 85, label: 'Write original firmware', lines: [{ text: 'writing stock firmware to slot ' + b.slot }], ms: 640 },
        { pct: 100, label: 'Verify written data', lines: [{ text: 'restore verified', cls: 'ok' }], ms: 520 },
      ], {
        fill, meta: label, log,
        onDone() {
          sys.coreboot = false;
          sys.linuxInstalled = false;
          sys.librephone = false;
          busy = false;
          toast('Restore complete. Original firmware back.', 'ok');
          ctx.refresh();
        },
      });
    };

    const onDelete = async (b) => {
      const ok = await dialog({
        tone: 'danger', iconName: 'trash', danger: true,
        title: 'Delete backup?',
        body: 'Remove <b>' + esc(b.name) + '</b> from the catalog.',
        confirmText: 'Delete', cancelText: 'Cancel',
      });
      if (!ok) return;
      const i = catalog.findIndex((x) => x.id === b.id);
      if (i >= 0) catalog.splice(i, 1);
      toast('Backup deleted');
      ctx.refresh();
    };

    root.appendChild(el('<div class="group-label">Saved backups</div>'));
    if (catalog.length === 0) {
      root.appendChild(el('<div class="empty-state">No backups yet. Create one to fill the catalog.</div>'));
    } else {
      const list = el('<div class="backup-list"></div>');
      catalog.forEach((b) => list.appendChild(itemEl(b, onRestore, onDelete)));
      root.appendChild(list);
    }

    return root;
  },
};
