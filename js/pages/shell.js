// Recovery shell. A small interpreter over a fixed, harmless command set.

import { el, esc } from '../ui/ui.js';
import { currentDevice } from '../core/device.js';
import { isKeyNavActive } from '../core/input.js';

const FILES = {
  '/etc/recovery.fstab': '/dev/block/by-name/system   /        ext4   ro\n/dev/block/by-name/userdata /data   f2fs   rw',
  '/proc/version': 'Linux version 5.4.210 (builder@recovery) aarch64',
};

function runCommand(raw, out) {
  const dev = currentDevice();
  const parts = raw.trim().split(/\s+/);
  const cmd = parts[0];
  const arg = parts.slice(1).join(' ');
  const write = (text, cls = '') => out.push(cls ? `<span class="${cls}">${esc(text)}</span>` : esc(text));

  switch (cmd) {
    case '':
      break;
    case 'help':
      write('commands: help, ls, cat, pwd, whoami, id, uname, getprop, mount, ps, fastboot, su, clear', 'dim');
      break;
    case 'ls':
      write('etc  proc  sbin  system  vendor  data  sys  dev');
      break;
    case 'pwd':
      write('/');
      break;
    case 'whoami':
      write('root');
      break;
    case 'id':
      write('uid=0(root) gid=0(root) context=u:r:recovery:s0');
      break;
    case 'uname':
      write('Linux localhost 5.4.210 #1 SMP aarch64 GNU/Linux');
      break;
    case 'getprop':
      if (!arg) { write('ro.product.device=' + dev.codename.toLowerCase()); write('ro.boot.slot_suffix=_a'); }
      else if (arg === 'ro.product.device') write(dev.codename.toLowerCase());
      else if (arg === 'ro.boot.slot_suffix') write('_a');
      else write('');
      break;
    case 'mount':
      write('/dev/block/dm-0 on / type ext4 (ro)');
      write('/dev/block/by-name/userdata on /data type f2fs (rw)');
      break;
    case 'ps':
      write('  PID USER   CMD');
      write('    1 root   /sbin/recovery');
      write('  148 root   /sbin/adbd');
      break;
    case 'cat':
      if (FILES[arg]) FILES[arg].split('\n').forEach((l) => write(l));
      else write('cat: ' + (arg || '') + ': No such file or directory', 'err');
      break;
    case 'fastboot':
      if (arg === 'getvar all' || arg === 'getvar product') write('product: ' + dev.codename.toLowerCase());
      else write('usage: fastboot getvar <name>', 'dim');
      break;
    case 'su':
      write('already uid 0 in recovery context', 'dim');
      break;
    case 'echo':
      write(arg);
      break;
    default:
      write(cmd + ': not found', 'err');
  }
}

export const page = {
  title: 'Shell',
  build() {
    const root = el(`
      <div class="terminal" style="height:100%;">
        <div class="terminal-out" id="termOut"><span class="dim">Recovery shell. Type help for the command list.</span></div>
        <div class="terminal-in">
          <span class="sign">fp:/ #</span>
          <input id="termIn" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" inputmode="none" data-nav aria-label="Shell input">
        </div>
      </div>`);

    const out = root.querySelector('#termOut');
    const input = root.querySelector('#termIn');

    input.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' || (e.isTrusted && isKeyNavActive())) return;
      const value = input.value;
      const buffer = [];
      buffer.push('<span class="prompt">fp:/ # </span>' + esc(value));
      runCommand(value, buffer);
      if (value.trim() === 'clear') out.innerHTML = '';
      else out.insertAdjacentHTML('beforeend', '<div>' + buffer.join('</div><div>') + '</div>');
      input.value = '';
      out.scrollTop = out.scrollHeight;
    });

    return root;
  },
  onShow() {
    const input = document.getElementById('termIn');
    if (input) setTimeout(() => input.focus(), 0);
  },
};
