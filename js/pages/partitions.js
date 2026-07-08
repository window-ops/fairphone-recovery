// Partition viewer. Shows the A/B Android layout, or the coreboot GPT layout
// after coreboot is flashed. The coreboot layout changes with what is installed.

import { pageEl, intro, banner } from '../ui/widgets.js';
import { el, esc } from '../ui/ui.js';
import { sys } from '../core/system.js';

const ANDROID = [
  { name: 'boot_a', slot: 'A', size: '128 MiB', fs: 'raw', mount: '-' },
  { name: 'boot_b', slot: 'B', size: '128 MiB', fs: 'raw', mount: '-' },
  { name: 'init_boot_a', slot: 'A', size: '8 MiB', fs: 'raw', mount: '-' },
  { name: 'init_boot_b', slot: 'B', size: '8 MiB', fs: 'raw', mount: '-' },
  { name: 'vendor_boot_a', slot: 'A', size: '96 MiB', fs: 'raw', mount: '-' },
  { name: 'vendor_boot_b', slot: 'B', size: '96 MiB', fs: 'raw', mount: '-' },
  { name: 'dtbo_a', slot: 'A', size: '24 MiB', fs: 'raw', mount: '-' },
  { name: 'dtbo_b', slot: 'B', size: '24 MiB', fs: 'raw', mount: '-' },
  { name: 'vbmeta_a', slot: 'A', size: '8 MiB', fs: 'raw', mount: '-' },
  { name: 'vbmeta_b', slot: 'B', size: '8 MiB', fs: 'raw', mount: '-' },
  { name: 'vbmeta_system_a', slot: 'A', size: '4 MiB', fs: 'raw', mount: '-' },
  { name: 'vbmeta_system_b', slot: 'B', size: '4 MiB', fs: 'raw', mount: '-' },
  { name: 'modem_a', slot: 'A', size: '160 MiB', fs: 'vfat', mount: '-' },
  { name: 'modem_b', slot: 'B', size: '160 MiB', fs: 'vfat', mount: '-' },
  { name: 'super', slot: '-', size: '9.0 GiB', fs: 'physical', mount: '-' },
  { name: 'system_a', slot: 'A', size: 'dynamic', fs: 'ext4', mount: '/' },
  { name: 'system_ext_a', slot: 'A', size: 'dynamic', fs: 'ext4', mount: '/system_ext' },
  { name: 'product_a', slot: 'A', size: 'dynamic', fs: 'ext4', mount: '/product' },
  { name: 'vendor_a', slot: 'A', size: 'dynamic', fs: 'ext4', mount: '/vendor' },
  { name: 'vendor_dlkm_a', slot: 'A', size: 'dynamic', fs: 'ext4', mount: '/vendor_dlkm' },
  { name: 'system_dlkm_a', slot: 'A', size: 'dynamic', fs: 'ext4', mount: '/system_dlkm' },
  { name: 'metadata', slot: '-', size: '16 MiB', fs: 'ext4', mount: '/metadata' },
  { name: 'misc', slot: '-', size: '4 MiB', fs: 'raw', mount: '-' },
  { name: 'persist', slot: '-', size: '48 MiB', fs: 'ext4', mount: '/mnt/vendor/persist' },
  { name: 'userdata', slot: '-', size: '105 GiB', fs: 'f2fs', mount: '/data' },
];

function corebootParts() {
  const parts = [
    { name: 'esp', size: '256 MiB', fs: 'fat32', mount: '/boot/efi' },
    { name: 'coreboot', size: '16 MiB', fs: 'raw', mount: '-' },
  ];
  if (sys.librephone) {
    parts.push({ name: 'modem', size: '96 MiB', fs: 'vfat', mount: '/lib/firmware/modem' });
    parts.push({ name: 'efs', size: '32 MiB', fs: 'ext4', mount: '/var/efs' });
  }
  if (sys.linuxInstalled) {
    parts.push({ name: 'linux-boot', size: '512 MiB', fs: 'ext4', mount: '/boot' });
    parts.push({ name: 'swap', size: '2.0 GiB', fs: 'swap', mount: '-' });
    parts.push({ name: 'linux-root', size: '115 GiB', fs: 'ext4', mount: '/' });
  } else {
    parts.push({ name: 'unallocated', size: '118 GiB', fs: '-', mount: '-' });
  }
  return parts;
}

function tableFor(parts, showSlot) {
  const head = showSlot
    ? '<tr><th>Partition</th><th>Slot</th><th>Size</th><th>FS</th><th>Mount</th></tr>'
    : '<tr><th>Partition</th><th>Size</th><th>FS</th><th>Mount</th></tr>';
  const rows = parts.map((p) => (showSlot
    ? `<tr><td>${esc(p.name)}</td><td>${esc(p.slot)}</td><td class="num">${esc(p.size)}</td><td>${esc(p.fs)}</td><td>${esc(p.mount)}</td></tr>`
    : `<tr><td>${esc(p.name)}</td><td class="num">${esc(p.size)}</td><td>${esc(p.fs)}</td><td>${esc(p.mount)}</td></tr>`)).join('');
  return `<div class="table-wrap"><table class="data-table"><thead>${head}</thead><tbody>${rows}</tbody></table></div>`;
}

export const page = {
  title: 'Partitions',
  build() {
    const root = pageEl();

    if (sys.coreboot) {
      root.appendChild(intro('Block layout after coreboot. The storage uses a PC style GPT with an EFI system partition, and it changes with what you install.'));

      const chips = ['<span class="chip">table: GPT</span>', '<span class="chip active">firmware: coreboot + UEFI</span>'];
      chips.push(sys.linuxInstalled ? '<span class="chip slot">Linux installed</span>' : '<span class="chip">Linux not installed</span>');
      if (sys.librephone) chips.push('<span class="chip slot">Librephone</span>');
      root.appendChild(el(`<div style="display:flex; gap:8px; flex-wrap:wrap;">${chips.join('')}</div>`));

      root.appendChild(el(tableFor(corebootParts(), false)));
      return root;
    }

    root.appendChild(intro('This device uses a seamless virtual A/B scheme on a GPT, with the logical system partitions held inside a dynamic partition.'));

    root.appendChild(el(`
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <span class="chip active">active slot: A</span>
        <span class="chip slot">scheme: virtual A/B</span>
        <span class="chip">super: dynamic</span>
        <span class="chip">table: GPT</span>
      </div>`));

    root.appendChild(el(tableFor(ANDROID, true)));

    return root;
  },
};
