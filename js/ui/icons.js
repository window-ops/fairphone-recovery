// Minimal symbolic icon set. Line style, single color via currentColor.

const P = {
  reboot: '<path d="M13 8a5 5 0 1 1-1.6-3.7" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M13 3v3h-3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>',
  chip: '<rect x="4.5" y="4.5" width="7" height="7" rx="1" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M6 4.5V2.5M8 4.5V2.5M10 4.5V2.5M6 13.5v-2M8 13.5v-2M10 13.5v-2M4.5 6h-2M4.5 8h-2M4.5 10h-2M13.5 6h-2M13.5 8h-2M13.5 10h-2" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/>',
  lifebuoy: '<circle cx="8" cy="8" r="5.2" fill="none" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="8" r="2" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M9.5 6.5 12 4M6.5 6.5 4 4M9.5 9.5 12 12M6.5 9.5 4 12" stroke="currentColor" stroke-width="1.2"/>',
  power: '<path d="M8 2.5v5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M4.8 5.2a4.5 4.5 0 1 0 6.4 0" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
  install: '<path d="M8 2.5v7M5.2 7 8 9.8 10.8 7" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.5 12h9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
  update: '<path d="M12.5 3.5v3h-3" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.5 12.5v-3h3" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M12.2 6.5A4.5 4.5 0 0 0 4 6M3.8 9.5A4.5 4.5 0 0 0 12 10" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
  disk: '<rect x="2.5" y="4" width="11" height="8" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M2.5 7.5h11" stroke="currentColor" stroke-width="1.2"/><circle cx="5" cy="9.7" r="0.9" fill="currentColor"/>',
  broom: '<path d="M11 3 6.5 7.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M4 13c0-2 1-4 3-5l2 2c-1 2-3 3-5 3z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>',
  trash: '<path d="M4 4.5h8M6.5 4.5V3h3v1.5M5 4.5l.6 8h4.8l.6-8" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>',
  archive: '<rect x="2.8" y="3.5" width="10.4" height="3" rx="0.6" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M3.6 6.5v6h8.8v-6M6.5 9h3" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
  folder: '<path d="M2.5 5.2c0-.6.4-1 1-1H6l1.2 1.3h5.3c.6 0 1 .4 1 1v5.3c0 .6-.4 1-1 1h-9c-.6 0-1-.4-1-1z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>',
  terminal: '<rect x="2.5" y="3.5" width="11" height="9" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M5 6.5 7 8.3 5 10M8.3 10.2h3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>',
  shield: '<path d="M8 2.4 12.5 4v3.4c0 3-2 5.2-4.5 6.2C5.5 12.6 3.5 10.4 3.5 7.4V4z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M6 8l1.5 1.5L10.5 6.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>',
  key: '<circle cx="5.5" cy="6.5" r="2.6" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M7.4 8.4 12 13M10.4 11l1.2-1.2M11.6 12.2l1.2-1.2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>',
  board: '<rect x="2.6" y="2.6" width="10.8" height="10.8" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.3"/><rect x="5" y="5" width="3.2" height="3.2" rx="0.5" fill="none" stroke="currentColor" stroke-width="1.1"/><path d="M10 5.4v5.2M8.6 10h2.8M5 10.4h2.2" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/>',
  info: '<circle cx="8" cy="8" r="5.4" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M8 7.2v3.4M8 5.2v.1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  chevron: '<path d="M6 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>',
  warning: '<path d="M8 2.6 14 12.4H2z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M8 6.4v2.6M8 10.8v.1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
  check: '<path d="M3.5 8.5 6.5 11.5 12.5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
  close: '<path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  lock: '<rect x="3.8" y="7" width="8.4" height="6" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M5.5 7V5.4a2.5 2.5 0 0 1 5 0V7" fill="none" stroke="currentColor" stroke-width="1.3"/>',
  bank: '<path d="M8 2.5 13.5 5.5H2.5z" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M4 7v4M6.5 7v4M9.5 7v4M12 7v4M2.8 12.5h10.4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>',
  disc: '<circle cx="8" cy="8" r="5.4" fill="none" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="8" r="1.6" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M8 2.6a5.4 5.4 0 0 1 4.6 2.6" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>',
  pencil: '<path d="M3 11.2 10.4 3.8l1.8 1.8L4.8 13H3z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M9.5 4.7 11.3 6.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
};

export function icon(name, size = 16) {
  const inner = P[name] || P.info;
  return `<svg viewBox="0 0 16 16" width="${size}" height="${size}" aria-hidden="true">${inner}</svg>`;
}
