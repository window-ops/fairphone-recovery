// Linux page. After coreboot the device runs ARM Linux only. Choose a desktop,
// optionally add Waydroid, and install Librephone for basic calling.

import { pageEl, intro, button, progressBlock } from '../ui/widgets.js';
import { el, dialog, toast, runSteps } from '../ui/ui.js';
import { sys } from '../core/system.js';

const linuxState = { de: 'phosh', waydroid: false };

function pill(text, on) {
  return `<span class="status-pill ${on ? 'on' : ''}"><span class="dot"></span>${text}</span>`;
}

function runProcess(card, btn, steps, onDone) {
  const prog = progressBlock();
  const fill = prog.querySelector('.progress-fill');
  const label = prog.querySelector('.p-label');
  const log = el('<div class="log"></div>');
  card.appendChild(prog);
  card.appendChild(log);
  btn.disabled = true;
  runSteps(steps, { fill, meta: label, log, onDone });
}

export const page = {
  title: 'ARM Linux',
  build(ctx) {
    const root = pageEl();
    root.appendChild(intro('With coreboot the device boots ARM Linux only. Downloading and installing a build is quick.'));

    const status = el('<div class="pill-row"></div>');
    status.appendChild(el(pill(sys.linuxInstalled ? 'Linux installed' : 'Linux not installed', sys.linuxInstalled)));
    status.appendChild(el(pill(sys.librephone ? 'Librephone installed' : 'No calling stack', sys.librephone)));
    root.appendChild(status);

    // Linux install card
    const linCard = el(`
      <div class="root-mode">
        <h3>Install ARM Linux</h3>
        <p>Pick a desktop environment. Waydroid is optional for running Android apps in a container.</p>
      </div>`);

    const deField = el(`
      <div class="field"><label>Desktop</label>
        <select id="linDe" data-nav>
          <option value="phosh">Phosh (GNOME mobile)</option>
          <option value="plasma">Plasma Mobile</option>
        </select>
      </div>`);
    deField.querySelector('select').value = linuxState.de;

    const wayRow = el(`
      <div class="switch-row">
        <span>Install Waydroid</span>
        <button type="button" class="switch" role="switch" data-nav id="linWaydroid" aria-checked="${linuxState.waydroid ? 'true' : 'false'}"></button>
      </div>`);
    const wayBtn = wayRow.querySelector('.switch');
    wayBtn.addEventListener('click', () => {
      wayBtn.setAttribute('aria-checked', wayBtn.getAttribute('aria-checked') === 'true' ? 'false' : 'true');
    });

    linCard.appendChild(deField);
    linCard.appendChild(wayRow);

    const installBtn = button({
      label: sys.linuxInstalled ? 'Reinstall Linux' : 'Download and install',
      variant: 'filled', iconName: 'install', block: true,
    });
    installBtn.addEventListener('click', async () => {
      linuxState.de = deField.querySelector('select').value;
      linuxState.waydroid = wayBtn.getAttribute('aria-checked') === 'true';
      const ok = await dialog({
        tone: 'info', iconName: 'install',
        title: 'Install ARM Linux?',
        body: 'Download and write a ' + (linuxState.de === 'phosh' ? 'Phosh' : 'Plasma Mobile') + ' build to the device.',
        confirmText: 'Install', cancelText: 'Cancel',
      });
      if (!ok) return;
      const steps = [
        { pct: 30, label: 'Download image', lines: [{ text: 'fetching ' + linuxState.de + ' arm64 image', cls: 'accent' }], ms: 620 },
        { pct: 65, label: 'Write to storage', lines: [{ text: 'writing rootfs to GPT' }], ms: 640 },
        { pct: 85, label: 'First boot setup', lines: [{ text: 'configuring ' + linuxState.de }], ms: 560 },
      ];
      if (linuxState.waydroid) steps.push({ pct: 95, label: 'Enable Waydroid', lines: [{ text: 'installing Waydroid container' }], ms: 560 });
      steps.push({ pct: 100, label: 'Installed', lines: [{ text: 'Linux ready', cls: 'ok' }], ms: 460 });
      runProcess(linCard, installBtn, steps, () => {
        sys.linuxInstalled = true;
        toast('ARM Linux installed', 'ok');
        ctx.refresh();
      });
    });
    linCard.appendChild(installBtn);
    root.appendChild(linCard);

    // Librephone card
    const lpCard = el(`
      <div class="root-mode">
        <h3>Librephone (FSF)</h3>
        <p>With coreboot the phone may lose calling. Librephone from the FSF restores basic calling.</p>
      </div>`);
    if (!sys.librephone) {
      const lpBtn = button({ label: 'Install Librephone', variant: 'tonal', iconName: 'lifebuoy', block: true });
      lpBtn.addEventListener('click', async () => {
        const ok = await dialog({
          tone: 'info', iconName: 'lifebuoy',
          title: 'Install Librephone?',
          body: 'Download the Librephone stack from the FSF and enable basic calling.',
          confirmText: 'Install', cancelText: 'Cancel',
        });
        if (!ok) return;
        runProcess(lpCard, lpBtn, [
          { pct: 45, label: 'Download from the FSF', lines: [{ text: 'fetching librephone', cls: 'accent' }], ms: 600 },
          { pct: 80, label: 'Install calling stack', lines: [{ text: 'installing modem service' }], ms: 560 },
          { pct: 100, label: 'Calling ready', lines: [{ text: 'basic calling enabled', cls: 'ok' }], ms: 480 },
        ], () => { sys.librephone = true; toast('Librephone installed', 'ok'); ctx.refresh(); });
      });
      lpCard.appendChild(lpBtn);
    } else {
      lpCard.appendChild(el('<div class="log">Basic calling is enabled.</div>'));
    }
    root.appendChild(lpCard);

    return root;
  },
};
