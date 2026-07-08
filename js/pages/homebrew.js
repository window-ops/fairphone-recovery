// Homebrew loader. Runs a program from external bootable media in volatile RAM.
// The media needs a special autorun file. Support is not guaranteed.

import { pageEl, intro, banner, button, progressBlock } from '../ui/widgets.js';
import { el, toast, runSteps } from '../ui/ui.js';

const hb = { media: null, running: false, docking: false };

const runFlow = [
  { pct: 25, label: 'Verify autorun.hbf signature', lines: [{ text: 'autorun.hbf found', cls: 'accent' }], ms: 520 },
  { pct: 55, label: 'Load payload into RAM', lines: [{ text: 'mapping 3.1 MiB into RAM' }], ms: 560 },
  { pct: 82, label: 'Hand the display to the program', lines: [{ text: 'framebuffer handed off' }], ms: 520 },
  { pct: 100, label: 'Running from RAM', lines: [{ text: 'DOOM started', cls: 'ok' }], ms: 520 },
];

function mediaDetails() {
  return el(`
    <dl class="kv">
      <dt>Volume label</dt><dd>DOOM</dd>
      <dt>Autorun file</dt><dd>autorun.hbf</dd>
      <dt>Target</dt><dd>RAM</dd>
    </dl>`);
}

export const page = {
  title: 'Homebrew',
  build(ctx) {
    const root = pageEl();
    root.appendChild(intro('Run homebrew programs from external bootable media. The program executes in volatile RAM. Support is not guaranteed.'));

    const card = el(`
      <div class="root-mode">
        <h3>Bootable media</h3>
        <p>Insert media that carries a special autorun file at its root. Linux live CD images are unsupported.</p>
      </div>`);

    if (hb.media === 'doom') {
      card.appendChild(mediaDetails());
      const log = el('<div class="log" hidden></div>');
      const prog = progressBlock();
      prog.hidden = true;
      const fill = prog.querySelector('.progress-fill');
      const label = prog.querySelector('.p-label');

      const runBtn = button({ label: 'Run from RAM', variant: 'filled', iconName: 'terminal', block: true });
      runBtn.addEventListener('click', () => {
        if (hb.running) return;
        hb.running = true;
        runBtn.disabled = true;
        prog.hidden = false;
        log.hidden = false;
        log.textContent = '';
        runSteps(runFlow, {
          fill, meta: label, log,
          onDone() {
            hb.running = false;
            toast('Doom running from RAM', 'ok');
          },
        });
      });

      const ejectBtn = button({ label: 'Eject media', variant: 'outline', block: true });
      ejectBtn.addEventListener('click', () => {
        if (hb.running) return;
        hb.media = null;
        toast('Media ejected');
        ctx.refresh();
      });

      card.appendChild(runBtn);
      card.appendChild(ejectBtn);
      card.appendChild(prog);
      card.appendChild(log);
    } else {
      const insertBtn = button({ label: 'Insert Doom media', variant: 'tonal', iconName: 'disc', block: true });
      insertBtn.addEventListener('click', () => {
        hb.media = 'doom';
        toast('Media mounted, autorun.hbf found', 'ok');
        ctx.refresh();
      });

      const linuxBtn = button({ label: 'Insert Linux live CD', variant: 'outline', block: true });
      linuxBtn.addEventListener('click', () => {
        toast('Linux live CD is unsupported', 'err');
      });

      card.appendChild(insertBtn);
      card.appendChild(linuxBtn);
    }

    root.appendChild(card);

    const dockCard = el(`
      <div class="root-mode">
        <h3>Docking support</h3>
        <p>Programs run in RAM. Interacting with them needs external components, because the minimal Cairo renderer does not hand off the buffer.</p>
      </div>`);
    const dockRow = el(`
      <div class="switch-row">
        <span>Enable docking support</span>
        <button type="button" class="switch" role="switch" data-nav id="dockSwitch" aria-checked="${hb.docking ? 'true' : 'false'}"></button>
      </div>`);
    const dockSwitch = dockRow.querySelector('.switch');
    dockSwitch.addEventListener('click', () => {
      hb.docking = dockSwitch.getAttribute('aria-checked') !== 'true';
      toast(hb.docking ? 'Docking support enabled' : 'Docking support disabled');
      ctx.refresh();
    });
    dockCard.appendChild(dockRow);
    if (hb.docking) {
      dockCard.appendChild(el(`
        <dl class="kv">
          <dt>Serial</dt><dd>COM</dd>
          <dt>Parallel</dt><dd>LPT</dd>
          <dt>Video</dt><dd>DisplayPort, HDMI</dd>
          <dt>Peripherals</dt><dd>USB HID, audio</dd>
        </dl>`));
    }
    root.appendChild(dockCard);

    root.appendChild(banner({
      tone: 'warning', iconName: 'warning',
      title: 'RAM only',
      text: 'The host SSD stays read-only, so anything the program produces lives in RAM for the session. The external device must keep its own files.',
    }));

    return root;
  },
};
