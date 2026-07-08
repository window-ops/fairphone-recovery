// Flash ROM page. Pick an image and target slot, then simulate the write.

import { pageEl, intro, banner, button, progressBlock } from '../ui/widgets.js';
import { el, dialog, toast, runSteps } from '../ui/ui.js';
import { currentDevice } from '../core/device.js';
import { sys } from '../core/system.js';

const flashState = { last: null };

export const page = {
  title: 'Flash ROM',
  build(ctx) {
    const dev = currentDevice();
    const root = pageEl();
    root.appendChild(intro('Write a system image to a slot. The demo provides three compressed flash images stored in /nand.'));

    const form = el(`
      <div class="group" style="padding:14px; display:flex; flex-direction:column; gap:14px;">
        <div class="field">
          <label for="romImage">System image</label>
          <select id="romImage" data-nav>
            <option>lineage-22.2-${dev.codename}-signed.zip</option>
            <option>e-2.9-${dev.codename}-community.zip</option>
            <option>FairphoneOS-${dev.codename}-factory.img</option>
          </select>
        </div>
        <div class="field">
          <label for="romSlot">Target slot</label>
          <select id="romSlot" data-nav>
            <option value="a">Slot A (active)</option>
            <option value="b">Slot B (inactive)</option>
            <option value="both">Both slots</option>
          </select>
        </div>
      </div>`);
    root.appendChild(form);

    root.appendChild(banner({
      tone: 'warning', iconName: 'warning',
      text: 'Flashing an unsigned image can leave the device unable to boot until a known good image is written back.',
    }));

    const prog = progressBlock();
    root.appendChild(prog);
    const log = el('<div class="log" aria-live="polite" hidden></div>');
    root.appendChild(log);

    const flashBtn = button({ label: 'Flash image', variant: 'filled', iconName: 'install', block: true });
    root.appendChild(flashBtn);

    const imageSel = form.querySelector('#romImage');
    const factoryImage = 'FairphoneOS-' + dev.codename + '-factory.img';
    if (flashState.last === null) flashState.last = factoryImage;
    const labelSpan = flashBtn.querySelector('span');
    const syncLabel = () => { labelSpan.textContent = imageSel.value === flashState.last ? 'Re-Flash image' : 'Flash image'; };
    syncLabel();
    imageSel.addEventListener('change', syncLabel);

    const fill = prog.querySelector('.progress-fill');
    const label = prog.querySelector('.p-label');
    const pct = prog.querySelector('.p-pct');

    flashBtn.addEventListener('click', async () => {
      if (!sys.bootloaderUnlocked) {
        await dialog({
          tone: 'warning', iconName: 'lock',
          title: 'Bootloader is locked',
          body: 'Unlock the bootloader from the Bootloader page before flashing a firmware image.',
          confirmText: 'OK', cancelText: '',
        });
        return;
      }
      const image = form.querySelector('#romImage').value;
      const slot = form.querySelector('#romSlot').selectedOptions[0].textContent;
      const ok = await dialog({
        tone: 'info', iconName: 'install',
        title: 'Flash to ' + slot + '?',
        body: 'Write <b>' + image + '</b> to the selected slot.',
        confirmText: 'Flash', cancelText: 'Cancel',
      });
      if (!ok) return;

      flashBtn.disabled = true;
      log.hidden = false;
      log.textContent = '';
      runSteps([
        { pct: 12, label: 'Verifying signature', ms: 500, lines: [{ text: '> verifying package signature', cls: 'accent' }, { text: 'signature OK', cls: 'ok' }] },
        { pct: 34, label: 'Checking device match', ms: 460, lines: [{ text: 'device ' + dev.codename + ' matches image target', cls: 'ok' }] },
        { pct: 72, label: 'Writing system', ms: 900, lines: [{ text: 'writing system_' + (slot.includes('A') ? 'a' : 'b') + ' (1.9 GiB)' }] },
        { pct: 92, label: 'Writing vbmeta', ms: 480, lines: [{ text: 'writing vbmeta, boot' }] },
        { pct: 100, label: 'Done', ms: 300, lines: [{ text: 'flash complete', cls: 'ok' }] },
      ], {
        fill, meta: label, log,
        onDone() {
          pct.textContent = '100%';
          flashBtn.disabled = false;
          flashState.last = image;
          syncLabel();
          toast('Flash complete', 'ok');
        },
      });
      const track = setInterval(() => { pct.textContent = (fill.style.width || '0%'); if (parseInt(fill.style.width) >= 100) clearInterval(track); }, 120);
    });

    return root;
  },
};
