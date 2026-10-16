/* ============================================================
   Confirm — modal de confirmação
   ============================================================ */

import { haptic } from '../../utils/haptic.js';

let pendingAction = null;

/**
 * Abre o modal de confirmação.
 * @param {string} title
 * @param {string} desc
 * @param {'danger'|'warning'|'gold'|'info'} iconType
 * @param {function} onOk
 * @param {string} [okLabel]
 */
export function showConfirm(title, desc, iconType, onOk, okLabel) {
  const modal = document.getElementById('modal-confirm');
  if (!modal) return;

  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-desc').textContent = desc;

  const icon = document.getElementById('confirm-icon');
  icon.className = 'confirm-icon ' + (iconType || 'danger');
  icon.textContent =
    iconType === 'danger'  ? '🗑️' :
    iconType === 'warning' ? '⚠️' :
    iconType === 'gold'    ? '🏆' : '❓';

  const okBtn = document.getElementById('confirm-ok');
  okBtn.textContent = okLabel || 'Confirmar';
  okBtn.className = 'btn ' + (iconType === 'gold' ? 'btn-gold' : 'btn-danger');

  modal.classList.add('show');
  pendingAction = onOk;
  haptic(20);
}

export function closeConfirm() {
  const modal = document.getElementById('modal-confirm');
  if (modal) modal.classList.remove('show');
  pendingAction = null;
}

export function confirmOk() {
  const fn = pendingAction;
  closeConfirm();
  if (typeof fn === 'function') fn();
}