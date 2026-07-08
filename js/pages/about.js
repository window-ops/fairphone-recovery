// About page. Explains the rendering approach, the state of coreboot on this
// hardware, and why a modified device fails bank attestation today.

import { pageEl } from '../ui/widgets.js';
import { el, esc } from '../ui/ui.js';
import { currentDevice } from '../core/device.js';

export const page = {
  title: 'About',
  build() {
    const dev = currentDevice();
    const root = pageEl();

    root.appendChild(el(`
      <div class="about-hero">
        <h2>Recovery Setup</h2>
        <span class="ver">demo build 0.1 \u00b7 ${esc(dev.codename)}</span>
        <p>A concept for a friendlier, PC style recovery screen that keeps the usual actions and adds flashing, partition inspection, a shell, root control and firmware tools.</p>
      </div>`));

    root.appendChild(el(`
      <div class="about-section about-card">
        <h3>Rendering</h3>
        <p>A minimal version of the GNOME Adwaita Dark theme is used. Motion is left out so the interface matches what a minimal Cairo renderer draws inside a recovery environment: static, immediate frames with no fades or slides.</p>
        <p>A real build would ship a small Cairo engine to draw these widgets on the recovery framebuffer.</p>
      </div>`));

    root.appendChild(el(`
      <div class="about-section about-card">
        <h3>coreboot on this device</h3>
        <p>Flashing coreboot is presented here as a full workflow, including the backup and the GPT conversion. On this class of phone it is a demonstration only.</p>
        <p>coreboot has no support for the application processors in these Fairphone models today, and the hardware ships with a signed vendor boot chain. The steps show what such a port would involve if the pieces existed.</p>
      </div>`));

    root.appendChild(el(`
      <div class="about-section about-card">
        <h3>Modified devices and banks</h3>
        <p>Banking and payment apps read hardware backed attestation before they trust a phone. A modified device fails that check today, which is why the MOK manager warns before hardware keys are touched.</p>
        <p>Authenticating a modified device is technically possible.</p>
      </div>`));

    root.appendChild(el(`
      <div class="about-section about-card">
        <h3>Functionality after coreboot</h3>
        <p>Flashing coreboot needs the bootloader and every partition unlocked. After it runs, the device boots ARM Linux only, with a choice of Phosh or Plasma Mobile and an option for Waydroid.</p>
        <p>Most Android based recovery functions become unavailable. Calling may stop, and Librephone from the FSF brings back basic calling. The recovery screen keeps working because it lives on a small NVRAM chip next to the SoC.</p>
      </div>`));

    root.appendChild(el(`
      <div class="about-section about-card">
        <h3>Homebrew</h3>
        <p>Homebrew loads a program from external bootable media into volatile RAM. The media carries a special autorun file. Doom runs here because the device has a screen and firmware written in C.</p>
        <p>Linux live CD images are unsupported. Programs run in RAM for the session, the host SSD stays read-only, and the external device keeps its own files. Support is not guaranteed.</p>
      </div>`));

    root.appendChild(el(`
      <div class="about-section about-card">
        <h3>Selected device</h3>
        <dl class="kv">
          <dt>Model</dt><dd>${esc(dev.name)}</dd>
          <dt>SoC</dt><dd>${esc(dev.soc)}</dd>
          <dt>Resolution</dt><dd>${dev.resolution[0]} x ${dev.resolution[1]}</dd>
          <dt>Aspect</dt><dd>${esc(dev.aspect)}</dd>
          <dt>Body</dt><dd>${esc(dev.body)}</dd>
        </dl>
      </div>`));

    root.appendChild(el(`
      <div class="about-section about-card">
        <h3>Input</h3>
        <p>The menu answers touch, the on-screen volume and power keys on the frame, and a keyboard. Arrow keys move the selection, Enter selects, and Escape goes back.</p>
      </div>`));

    return root;
  },
};
