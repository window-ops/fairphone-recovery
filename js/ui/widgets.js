// Small builders shared by pages to keep markup consistent and compact.

import { el, esc } from './ui.js';
import { icon } from './icons.js';

export function pageEl() {
  return el('<div class="page"></div>');
}

export function intro(text) {
  return el(`<p class="page-intro">${esc(text)}</p>`);
}

export function sectionLabel(text) {
  return el(`<div class="group-label">${esc(text)}</div>`);
}

export function group(rows) {
  const g = el('<div class="group"></div>');
  rows.forEach((r) => g.appendChild(r));
  return g;
}

export function labelledGroup(label, rows) {
  const wrap = el('<div></div>');
  wrap.appendChild(sectionLabel(label));
  wrap.appendChild(group(rows));
  return wrap;
}

// A navigable row. tone controls the icon colour: default, warning, destructive, neutral.
export function row({ iconName, tone = '', title, sub = '', trailing = '', chevron = true, disabled = false, onClick }) {
  const btn = el(`
    <button type="button" class="row${disabled ? ' is-disabled' : ''}" data-nav ${disabled ? 'disabled' : ''}>
      <span class="row-icon ${tone ? 'tone-' + tone : ''}">${icon(iconName)}</span>
      <span class="row-text">
        <span class="row-title">${esc(title)}</span>
        ${sub ? `<span class="row-sub">${esc(sub)}</span>` : ''}
      </span>
      ${trailing ? `<span class="row-trailing">${esc(trailing)}</span>` : ''}
      ${chevron && !disabled ? `<span class="row-chevron">${icon('chevron', 14)}</span>` : ''}
    </button>`);
  if (onClick && !disabled) btn.addEventListener('click', onClick);
  return btn;
}

export function banner({ tone = 'info', iconName = 'info', title = '', text = '' }) {
  return el(`
    <div class="banner ${tone}">
      <span class="banner-icon">${icon(iconName, 18)}</span>
      <span class="banner-body">
        ${title ? `<div class="banner-title">${esc(title)}</div>` : ''}
        <div class="banner-text">${esc(text)}</div>
      </span>
    </div>`);
}

export function button({ label, variant = 'filled', iconName = '', block = false, nav = true, onClick, id = '' }) {
  const btn = el(`
    <button type="button" class="btn btn-${variant} ${block ? 'btn-block' : ''}" ${nav ? 'data-nav' : ''} ${id ? `id="${id}"` : ''}>
      ${iconName ? icon(iconName, 16) : ''}<span>${esc(label)}</span>
    </button>`);
  if (onClick) btn.addEventListener('click', onClick);
  return btn;
}

export function progressBlock() {
  return el(`
    <div class="progress">
      <div class="progress-meta"><span class="p-label">Idle</span><span class="p-pct"></span></div>
      <div class="progress-track"><div class="progress-fill"></div></div>
    </div>`);
}
