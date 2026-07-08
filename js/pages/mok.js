// MOK manager. Lists the hardware keys the boot chain trusts and lets an owner
// enroll, edit, or remove their own keys. Enrollment and editing share one form,
// so key settings can be set during enrollment and changed afterwards.

import { pageEl, intro, banner, button, progressBlock } from '../ui/widgets.js';
import { el, esc, dialog, toast, runSteps } from '../ui/ui.js';
import { icon as sym } from '../ui/icons.js';

let keys = [
  { id: 'pk', name: 'Platform Key (PK)', hash: 'a1:9f:c3:...:7e', hardware: true },
  { id: 'kek', name: 'Key Exchange Key (KEK)', hash: 'd4:20:1b:...:aa', hardware: true },
  { id: 'db', name: 'Vendor signature db', hash: '0c:77:e8:...:31', hardware: true },
];

const USAGES = { modules: 'Kernel modules', bootloader: 'Bootloader', chain: 'Full boot chain' };

const form = { active: false, id: null, draft: null, running: false };

const steps = [
  { pct: 20, label: 'Read certificate from /sdcard/keys', lines: [{ text: 'open owner.crt', cls: 'accent' }], ms: 520 },
  { pct: 50, label: 'Verify certificate chain', lines: [{ text: 'chain verified' }], ms: 560 },
  { pct: 78, label: 'Confirm physical presence', lines: [{ text: 'user present' }], ms: 540 },
  { pct: 100, label: 'Write key to MOK store', lines: [{ text: 'key enrolled', cls: 'ok' }], ms: 540 },
];

function keyRow(k, onEdit, onDelete) {
  const usage = k.hardware ? '' : (USAGES[k.usage] || 'Kernel modules') + (k.enabled ? '' : ', disabled');
  const node = el(`
    <div class="mok-key">
      <span class="row-icon ${k.hardware ? 'tone-destructive' : ''}">${sym('key')}</span>
      <span class="k-name">
        <span class="n">${esc(k.name)}</span>
        <span class="h">${esc(k.hash)}${usage ? ' \u00b7 ' + esc(usage) : ''}</span>
      </span>
      <span class="k-badge ${k.hardware ? 'hw' : ''}">${k.hardware ? 'hardware' : 'owner'}</span>
      ${k.hardware ? '' : '<button type="button" class="k-edit" data-nav aria-label="Edit key">' + sym('pencil', 15) + '</button>'}
      <button type="button" class="k-del" ${k.hardware ? 'disabled' : 'data-nav'} aria-label="Delete key">${sym('trash', 15)}</button>
    </div>`);
  if (!k.hardware) {
    node.querySelector('.k-edit').addEventListener('click', () => onEdit(k));
    node.querySelector('.k-del').addEventListener('click', () => onDelete(k));
  }
  return node;
}

function formCard(ctx) {
  const draft = form.draft;
  const isEnroll = form.id === null;

  ctx.setBack(() => {
    if (form.running) return true;
    form.active = false;
    ctx.refresh();
    return true;
  });

  const card = el(`
    <div class="root-mode">
      <h3>${isEnroll ? 'Enroll owner key' : 'Edit owner key'}</h3>
      <p>Set the key name, its usage, and whether the boot chain honours it.</p>
    </div>`);

  const nameField = el(`<div class="field"><label>Key name</label><input type="text" data-nav inputmode="none" id="mokName" value="${esc(draft.name)}"></div>`);
  const usageField = el(`
    <div class="field"><label>Usage</label>
      <select data-nav id="mokUsage">
        <option value="modules">Kernel modules</option>
        <option value="bootloader">Bootloader</option>
        <option value="chain">Full boot chain</option>
      </select>
    </div>`);
  usageField.querySelector('select').value = draft.usage;

  const enabledRow = el(`
    <div class="switch-row">
      <span>Enabled</span>
      <button type="button" class="switch" role="switch" data-nav id="mokEnabled" aria-checked="${draft.enabled ? 'true' : 'false'}"></button>
    </div>`);
  const enabledBtn = enabledRow.querySelector('.switch');
  enabledBtn.addEventListener('click', () => {
    enabledBtn.setAttribute('aria-checked', enabledBtn.getAttribute('aria-checked') === 'true' ? 'false' : 'true');
  });

  card.appendChild(nameField);
  card.appendChild(usageField);
  card.appendChild(enabledRow);

  const readDraft = () => {
    draft.name = nameField.querySelector('input').value.trim() || draft.name;
    draft.usage = usageField.querySelector('select').value;
    draft.enabled = enabledBtn.getAttribute('aria-checked') === 'true';
  };

  const primary = button({ label: isEnroll ? 'Enroll' : 'Save', variant: 'filled', block: true });
  const cancel = button({ label: 'Cancel', variant: 'outline', block: true });

  const prog = progressBlock();
  prog.hidden = true;
  const fill = prog.querySelector('.progress-fill');
  const label = prog.querySelector('.p-label');
  const log = el('<div class="log" hidden></div>');

  primary.addEventListener('click', () => {
    if (form.running) return;
    readDraft();
    if (!isEnroll) {
      const k = keys.find((x) => x.id === form.id);
      if (k) { k.name = draft.name; k.usage = draft.usage; k.enabled = draft.enabled; }
      form.active = false;
      toast('Key updated', 'ok');
      ctx.refresh();
      return;
    }
    form.running = true;
    primary.disabled = true;
    cancel.disabled = true;
    prog.hidden = false;
    log.hidden = false;
    runSteps(steps, {
      fill, meta: label, log,
      onDone() {
        keys.push({
          id: 'mok' + Date.now(),
          name: draft.name,
          hash: 'new:' + Math.random().toString(16).slice(2, 6) + ':...:00',
          hardware: false,
          usage: draft.usage,
          enabled: draft.enabled,
        });
        form.active = false;
        form.running = false;
        toast('Owner key enrolled', 'ok');
        ctx.refresh();
      },
    });
  });

  cancel.addEventListener('click', () => {
    if (form.running) return;
    form.active = false;
    ctx.refresh();
  });

  card.appendChild(primary);
  card.appendChild(cancel);
  card.appendChild(prog);
  card.appendChild(log);
  return card;
}

export const page = {
  title: 'MOK manager',
  action: {
    label: 'Enroll',
    run(ctx) {
      if (form.active) return;
      const n = keys.filter((k) => !k.hardware).length + 1;
      form.active = true;
      form.id = null;
      form.running = false;
      form.draft = { name: 'Owner key ' + n, usage: 'modules', enabled: true };
      ctx.refresh();
    },
  },
  build(ctx) {
    const root = pageEl();
    root.appendChild(intro('Keys that the boot chain trusts. Owner keys can be enrolled, edited, or removed. Hardware keys are locked in this view.'));

    root.appendChild(banner({
      tone: 'warning', iconName: 'warning',
      title: 'Editing hardware keys',
      text: 'Be very careful before changing hardware keys on a phone you use daily. Banks currently cannot trust a modified device.',
    }));

    if (form.active) {
      root.appendChild(formCard(ctx));
      return root;
    }

    const onEdit = (k) => {
      form.active = true;
      form.id = k.id;
      form.running = false;
      form.draft = { name: k.name, usage: k.usage || 'modules', enabled: k.enabled !== false };
      ctx.refresh();
    };

    const onDelete = async (k) => {
      const ok = await dialog({
        tone: 'danger', iconName: 'trash', danger: true,
        title: 'Delete key?',
        body: 'Remove <b>' + esc(k.name) + '</b> from the trust store.',
        confirmText: 'Delete', cancelText: 'Cancel',
      });
      if (!ok) return;
      keys = keys.filter((x) => x.id !== k.id);
      toast('Key removed');
      ctx.refresh();
    };

    const list = el('<div class="group"></div>');
    keys.forEach((k) => list.appendChild(keyRow(k, onEdit, onDelete)));
    root.appendChild(list);

    return root;
  },
};
