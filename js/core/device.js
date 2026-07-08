// Device profiles and screen geometry. Screen aspect ratios come from published specs.

export const DEVICES = {
  fp4: {
    id: 'fp4',
    name: 'Fairphone 4',
    resolution: [1080, 2340],
    aspect: '19.5 : 9',
    body: '162 x 75.5 x 10.5 mm',
    soc: 'Snapdragon 750G',
    codename: 'FP4',
  },
  fp5: {
    id: 'fp5',
    name: 'Fairphone 5',
    resolution: [1224, 2700],
    aspect: '20 : 9',
    body: '161.6 x 75.8 x 9.6 mm',
    soc: 'QCM6490',
    codename: 'FP5',
  },
  fp6: {
    id: 'fp6',
    name: 'Fairphone (Gen. 6)',
    resolution: [1116, 2484],
    aspect: '20 : 9',
    body: '156.5 x 73.3 x 9.6 mm',
    soc: 'Snapdragon 7s Gen 3',
    codename: 'FP6',
  },
};

const state = { current: 'fp5', frame: 'on' };

export function currentDevice() { return DEVICES[state.current]; }
export function frameMode() { return state.frame; }

// The on-screen height is clamped in CSS while the width follows the true
// portrait ratio of the chosen model through the --ar custom property.
export function applyDevice(id) {
  if (!DEVICES[id]) return;
  state.current = id;
  const [w, h] = DEVICES[id].resolution;
  const deviceEl = document.getElementById('device');
  deviceEl.style.setProperty('--ar', w + ' / ' + h);
  deviceEl.dataset.notch = id === 'fp4' ? 'teardrop' : 'punch';
  document.getElementById('statusMode').textContent = 'fastbootd';
}

export function applyFrame(mode) {
  state.frame = mode;
  document.getElementById('device').setAttribute('data-frame', mode);
}
