/* ============================================================
   Format — helpers de formatação, escape, cores, avatares
   ============================================================ */

/**
 * Escapa HTML para prevenir XSS ao injetar strings em templates.
 */
export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

/**
 * Clareia/escurece um hex. Ex: shade('#00b894', -25) → mais escuro.
 */
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

/**
 * Retorna uma cor de avatar determinística baseada no nome.
 */
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

/**
 * Retorna 1 ou 2 iniciais do nome (ex: "Maria Silva" → "MS").
 */
export function getAvatarInitial(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Aplica máscara de telefone brasileiro num <input>.
 * Uso: oninput="maskPhone(this)"
 */
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

/**
 * Formata data ISO para pt-BR curto (dd/mm/aaaa).
 */
export function formatDateBR(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('pt-BR');
}

/**
 * Formata data ISO + hora (dd/mm/aaaa às hh:mm).
 */
export function formatDateTimeBR(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const date = d.toLocaleDateString('pt-BR');
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${date} às ${time}`;
}

/**
 * Formata número como moeda (R$ 12,50).
 */
export function formatBRL(value) {
  const n = typeof value === 'number' ? value : parseFloat(value) || 0;
  return 'R$ ' + n.toFixed(2);
}

/**
 * Extrai apenas dígitos de uma string (pra usar em tel: / wa.me).
 */
export function onlyDigits(s) {
  return String(s || '').replace(/\D/g, '');
}