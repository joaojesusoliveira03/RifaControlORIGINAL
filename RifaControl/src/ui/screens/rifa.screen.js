/* ============================================================
   Rifa Screen — controlador principal
   ============================================================ */

import { APP } from '../../config/state.js';
import { RIFA_COLORS } from '../../config/constants.js';
import { shade } from '../../utils/format.js';
import { haptic } from '../../utils/haptic.js';
import { toast } from '../components/toast.js';
import { showConfirm } from '../components/confirm.js';
import { saveRifaCloud, deleteRifaFromCloud, getRifa } from '../../services/rifas.service.js';
import { markAllPaidFor } from '../../services/sales.service.js';

// Importa as abas
import { renderNumbersTab } from './rifa/numbers.tab.js';
import { renderSalesTab, resetBuyersState } from './rifa/buyers.tab.js';
import { renderInfoTab } from './rifa/info.tab.js';

/* ------------------------------------------------------------
   Abrir rifa
   ------------------------------------------------------------ */
export function openRifa(id) {
  haptic(8);
  const r = getRifa(id);
  if (!r) return;

  APP.currentRifa = r;
  APP.currentTab = 'numbers';
  APP.gridFilter = 'all';

  // Reseta filtros de compradores ao abrir uma rifa nova
  resetBuyersState();

  const c2 = RIFA_COLORS[r.colorIdx || 0].c2;
  const header = document.getElementById('rifa-header');
  if (header) header.style.background = `linear-gradient(135deg,${c2},${shade(c2, -25)})`;

  const title = document.getElementById('rifa-title');
  if (title) title.textContent = r.emoji + ' ' + r.name;

  const info = document.getElementById('rifa-info');
  if (info) info.textContent = `🎁 ${r.prize}`;

  switchTabRifa('numbers');

  document.querySelectorAll('.screen').forEach(x => x.classList.remove('active'));
  const screen = document.getElementById('screen-rifa');
  if (screen) screen.classList.add('active');
}

/* ------------------------------------------------------------
   Troca de aba (interna)
   ------------------------------------------------------------ */
export function switchTabRifa(tab) {
  haptic(5);
  APP.currentTab = tab;

  const tNum = document.getElementById('tab-numbers');
  const tSales = document.getElementById('tab-sales');
  const tInfo = document.getElementById('tab-info');
  if (tNum) tNum.classList.toggle('active', tab === 'numbers');
  if (tSales) tSales.classList.toggle('active', tab === 'sales');
  if (tInfo) tInfo.classList.toggle('active', tab === 'info');

  const fab = document.getElementById('fab-rifa');
  if (fab) fab.style.display = tab === 'info' ? 'none' : 'flex';

  renderRifa();
}

/* ------------------------------------------------------------
   Render principal — Chama a aba correta
   ------------------------------------------------------------ */
export function renderRifa() {
  const r = APP.currentRifa;
  if (!r) return;

  const c = document.getElementById('rifa-content');
  if (!c) return;

  if (APP.currentTab === 'numbers') renderNumbersTab(c, r);
  else if (APP.currentTab === 'sales') renderSalesTab(c, r);
  else renderInfoTab(c, r);
}

/* ------------------------------------------------------------
   Ações globais
   ------------------------------------------------------------ */
export async function markAllPaid(buyerName) {
  const r = APP.currentRifa;
  if (!r) return;

  const count = markAllPaidFor(r, buyerName);
  if (count === 0) return;

  try {
    await saveRifaCloud(r);
    const idx = APP.rifas.findIndex(x => x.id === r.id);
    if (idx >= 0) APP.rifas[idx] = r;
    renderRifa();
    haptic([20, 40, 20]);
    const { launchConfetti } = await import('../components/confetti.js');
    launchConfetti('small');
    toast(`✅ ${count} pago${count > 1 ? 's' : ''}!`);
  } catch (err) {
    toast('❌ Erro ao salvar');
  }
}

export function showNumInfo(num) {
  haptic(8);
  const r = APP.currentRifa;
  const s = r.sales.find(x => x.num === num);

  if (!s) {
    import('../modals/sale.modal.js').then(m => {
      m.openSaleModal();
      const input = document.getElementById('in-sale-nums');
      if (input) input.value = num;
      m.updateSaleCalc();
      m.updateRandomHint();
    });
    return;
  }

  displayNumInfo(num, s, r);
}

function displayNumInfo(num, s, r) {
  const isWinner = r.winner && r.winner.num === num;

  const icon = document.getElementById('num-info-icon');
  if (icon) {
    icon.textContent = isWinner ? '🏆' : '🎯';
    icon.className = 'confirm-icon ' + (isWinner ? 'gold' : 'info');
  }

  const title = document.getElementById('num-info-title');
  if (title) title.textContent = `Número ${num}${isWinner ? ' 🏆' : ''}`;

  const status = s.paid ? '✅ Pago' : '⏳ Pendente';
  const price = typeof s.price_charged === 'number' ? s.price_charged : r.price;
  const dateStr = s.date ? new Date(s.date).toLocaleDateString('pt-BR') : '';
  const timeStr = s.date ? new Date(s.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';

  let sellerInfo = '';
  if (s.sold_by_name) {
    sellerInfo = `\n🛒 Vendido por: ${s.sold_by_name}`;
    if (dateStr) sellerInfo += ` em ${dateStr}${timeStr ? ' às ' + timeStr : ''}`;
  } else if (dateStr) {
    sellerInfo = `\n📅 ${dateStr}`;
  }

  let desc = `👤 ${s.name}\n📱 ${s.phone || 'Sem telefone'}\n${status}`;
  desc += `\n💰 R$ ${price.toFixed(2)}`;
  if (s.promo_applied) desc += ` 🎁`;
  desc += `\n🎟️ ${r.name}`;
  desc += sellerInfo;

  const descEl = document.getElementById('num-info-desc');
  if (descEl) descEl.textContent = desc;

  const buyerBtn = document.getElementById('num-info-buyer-btn');
  if (buyerBtn) {
    buyerBtn.style.display = 'flex';
    buyerBtn.onclick = async () => {
      const { closeModal } = await import('../components/modal.js');
      closeModal('modal-num-info');
      const { openBuyer } = await import('./buyer.screen.js');
      openBuyer(s.name, r.id);
    };
  }

  const modal = document.getElementById('modal-num-info');
  if (modal) modal.classList.add('show');
}

/* ------------------------------------------------------------
   Delete / Sair
   ------------------------------------------------------------ */
export async function deleteRifa(id, ev) {
  if (ev) ev.stopPropagation();
  const rifa = getRifa(id);
  if (!rifa) return;

  if (rifa.isShared) {
    leaveRifa(id);
    return;
  }

  showConfirm('Excluir rifa?', `"${rifa.name}" e ${rifa.sales.length} venda(s).`, 'danger', async () => {
    try {
      await deleteRifaFromCloud(id);
      APP.rifas = APP.rifas.filter(r => r.id !== id);
      const { renderHome } = await import('./home.screen.js');
      renderHome();
      haptic([20, 40, 20]);
      toast('🗑️ Excluída');
    } catch (err) {
      console.error(err);
      toast('❌ Erro ao excluir');
    }
  });
}

export async function leaveRifa(rifaId) {
  const rifa = getRifa(rifaId);
  if (!rifa) return;

  if (!rifa.isShared) {
    toast('⚠️ Você é o dono dessa rifa');
    return;
  }

  showConfirm(
    'Sair desta rifa?',
    `Você vai perder acesso a "${rifa.name}". O dono continua com ela.`,
    'warning',
    async () => {
      try {
        const { leaveSharedRifa } = await import('../../services/shares.service.js');
        await leaveSharedRifa(rifaId);

        APP.rifas = APP.rifas.filter(r => r.id !== rifaId);

        const { renderHome } = await import('./home.screen.js');
        renderHome();

        if (APP.currentRifa && APP.currentRifa.id === rifaId) {
          APP.currentRifa = null;
          const { showScreen } = await import('../../core/router.js');
          showScreen('home');
        }

        haptic([20, 40, 20]);
        toast('👋 Você saiu da rifa');
      } catch (err) {
        console.error(err);
        toast('❌ Erro ao sair');
      }
    },
    'Sair'
  );
}