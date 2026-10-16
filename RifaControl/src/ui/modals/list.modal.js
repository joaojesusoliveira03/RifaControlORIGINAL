/* ============================================================
   List Modal — gerar lista em texto
   ============================================================ */

import { APP } from '../../config/state.js';
import { haptic } from '../../utils/haptic.js';
import { toast } from '../components/toast.js';
import { copyToClipboard } from '../../utils/clipboard.js';
import { calcArrecadado, calcPendente, countSold } from '../../services/sales.service.js';
import { getRifa } from '../../services/rifas.service.js';

let lastListText = '';

export function openListModal(rifaId) {
  haptic(10);
  const r = getRifa(rifaId);
  if (!r) return;

  const sales = new Map();
  r.sales.forEach(s => sales.set(s.num, s.name));

  let listText = `🎟️ ${r.name}\n`;
  listText += `💰 R$ ${r.price.toFixed(2)} por cota`;
  if (r.promo_enabled) {
    listText += ` • 🎁 Leve ${r.promo_quantity} por R$ ${r.promo_price.toFixed(2)}`;
  }
  listText += `\n`;
  listText += `Total: ${r.total} | Vendidos: ${sales.size} | Livres: ${r.total - sales.size}\n`;
  listText += `─────────────────────\n`;

  for (let i = 1; i <= r.total; i++) {
    const name = sales.get(i);
    const w = r.winner && r.winner.num === i ? ' 🏆' : '';
    listText += `${i} - ${name ? name : ''}${w}\n`;
  }

  listText += `─────────────────────\n`;
  listText += `💰 Arrecadado: R$ ${calcArrecadado(r).toFixed(2)}\n`;
  listText += `⏳ Pendente: R$ ${calcPendente(r).toFixed(2)}`;

  if (r.winner) {
    listText += `\n🏆 GANHADOR: ${r.winner.num} - ${r.winner.name}`;
  }

  const stats = document.getElementById('list-stats');
  if (stats) {
    stats.innerHTML = `<span>🎯 ${sales.size} vendidos</span><span>🆓 ${r.total - sales.size} livres</span><span>📊 ${r.total} total</span>`;
  }

  const preview = document.getElementById('list-preview');
  if (preview) preview.textContent = listText;

  const modal = document.getElementById('modal-list');
  if (modal) modal.classList.add('show');

  lastListText = listText;
}

export async function copyList() {
  if (!lastListText) return;
  await copyToClipboard(lastListText);
  haptic([10, 30, 10]);
  toast('📋 Copiada!');
}