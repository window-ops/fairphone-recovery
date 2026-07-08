// Shared session state for security locks and firmware status.

export const sys = {
  bootloaderUnlocked: false,
  partitionsUnlocked: false,
  coreboot: false,
  linuxInstalled: false,
  librephone: false,
};
