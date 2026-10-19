/* ============================================================
   Format — helpers de formatação, escape, cores, avatares
   ============================================================ */

import { APP } from '../config/state.js';

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

export function shade(hex, pct) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) + pct;
  let g = ((n >> 8) & 0xff) + pct;
  let b = (n & 0xff) + pct;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

export function getAvatarColor(name) {
  if (!name) return '#00b894';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const palette = [
    '#00b894','#0984e3','#6C5CE7','#e84393',
    '#e17055','#f59e0b','#d63031','#00cec9'
  ];
  return palette[Math.abs(hash) % palette.length];
}

export function getAvatarInitial(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function maskPhone(input) {
  let v = input.value.replace(/\D/g, '');
  if (v.length > 11) v = v.slice(0, 11);
  if (v.length === 0) { input.value = ''; return; }
  if (v.length <= 2)      input.value = '(' + v;
  else if (v.length <= 6) input.value = '(' + v.slice(0, 2) + ') ' + v.slice(2);
  else if (v.length <= 10) input.value =
    '(' + v.slice(0, 2) + ') ' + v.slice(2, 6) + '-' + v.slice(6);
  else input.value =
    '(' + v.slice(0, 2) + ') ' + v.slice(2, 7) + '-' + v.slice(7);
}

export function formatDateBR(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('pt-BR');
}

export function formatDateTimeBR(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const date = d.toLocaleDateString('pt-BR');
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${date} às ${time}`;
}

/**
 * Formata valor como moeda. Se hideValues estiver ativo, retorna bolinhas.
 */
export function formatBRL(value) {
  if (APP.hideValues) return '••••••';
  const n = typeof value === 'number' ? value : parseFloat(value) || 0;
  return 'R$ ' + n.toFixed(2);
}

export function onlyDigits(s) {
  return String(s || '').replace(/\D/g, '');
}