/* ============================================================
   Num Info — ações do modal de número
   ============================================================ */

import { APP } from '../../config/state.js';
import { closeModal } from '../components/modal.js';

export function goToBuyerFromNum() {
  const r = APP.currentRifa;
  if (!r) return;

  const desc = document.getElementById('num-info-desc')?.textContent || '';
  const match = desc.match(/👤 ([^\n]+)/);
  const buyerName = match ? match[1].trim() : null;

  if (!buyerName) return;

  closeModal('modal-num-info');

  import('./buyer.screen.js').then(m => m.openBuyer(buyerName, r.id));
}