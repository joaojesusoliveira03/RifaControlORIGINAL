/* ============================================================
   Rifa Screen — números, compradores, info
   ============================================================ */

import { APP } from '../../config/state.js';
import { RIFA_COLORS } from '../../config/constants.js';
import { escapeHtml, formatBRL, shade } from '../../utils/format.js';
import { haptic } from '../../utils/haptic.js';
import { toast } from '../components/toast.js';
import { showConfirm } from '../components/confirm.js';
import { saveRifaCloud, deleteRifaFromCloud, getRifa } from '../../services/rifas.service.js';
import {
  countSold, countPaid, countAvailable,
  getSoldNumbers, getPaidNumbers,
  groupSalesByBuyer, markAllPaidFor
} from '../../services/sales.service.js';

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
   Render principal
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
   Tab: Números
   ------------------------------------------------------------ */
function renderNumbersTab(c, r) {
  const soldNums = getSoldNumbers(r);
  const paidNums = getPaidNumbers(r);
  const winnerNum = r.winner ? r.winner.num : null;

  const frag = document.createDocumentFragment();

  // Counter
  const counter = document.createElement('div');
  counter.className = 'quick-counter';
  counter.innerHTML = `
    <div class="qc-item paid"><div class="qc-value">${paidNums.size}</div><div class="qc-label">Pagos</div></div>
    <div class="qc-divider"></div>
    <div class="qc-item pending"><div class="qc-value">${soldNums.size - paidNums.size}</div><div class="qc-label">Pendentes</div></div>
    <div class="qc-divider"></div>
    <div class="qc-item available"><div class="qc-value">${r.total - soldNums.size}</div><div class="qc-label">Livres</div></div>
    ${winnerNum ? `<div class="qc-divider"></div><div class="qc-item winner"><div class="qc-value">${winnerNum}</div><div class="qc-label">🏆</div></div>` : ''}
    <div class="qc-divider"></div>
    <div class="qc-item total"><div class="qc-value">${r.total}</div><div class="qc-label">Total</div></div>
  `;
  frag.appendChild(counter);

  // Filtros
  const filters = document.createElement('div');
  filters.className = 'filters-bar';
  filters.innerHTML = `
    <button class="filter-chip ${APP.gridFilter === 'all' ? 'active' : ''}" data-filter="all">🎯 Todos</button>
    <button class="filter-chip ${APP.gridFilter === 'paid' ? 'active' : ''}" data-filter="paid">✅ Pagos</button>
    <button class="filter-chip ${APP.gridFilter === 'pending' ? 'active' : ''}" data-filter="pending">⏳ Pendentes</button>
    <button class="filter-chip ${APP.gridFilter === 'available' ? 'active' : ''}" data-filter="available">⚪ Livres</button>
    ${winnerNum ? `<button class="filter-chip ${APP.gridFilter === 'winner' ? 'active' : ''}" data-filter="winner">🏆 Ganhador</button>` : ''}
  `;
  filters.querySelectorAll('.filter-chip').forEach(b => {
    b.onclick = () => { APP.gridFilter = b.dataset.filter; haptic(5); renderRifa(); };
  });
  frag.appendChild(filters);

  // Banner do ganhador
  if (r.winner) {
    const dateStr = r.winner.date ? new Date(r.winner.date).toLocaleDateString('pt-BR') : '';
    const banner = document.createElement('div');
    banner.className = 'winner-banner';
    banner.innerHTML = `
      <div class="wb-label">🏆 Ganhador</div>
      <div class="wb-number">Nº ${r.winner.num}</div>
      <div class="wb-name">${escapeHtml(r.winner.name)}</div>
      ${dateStr ? `<div class="wb-date">📅 ${dateStr}</div>` : ''}
    `;
    frag.appendChild(banner);
  }

  // Progresso
  const pct = r.total ? Math.round(soldNums.size / r.total * 100) : 0;
  const prog = document.createElement('div');
  prog.className = 'progress-bar';
  prog.innerHTML = `<div class="progress-fill" style="width:${pct}%"></div>`;
  frag.appendChild(prog);

  // Grid
  const grid = document.createElement('div');
  grid.className = 'numbers-grid';
  for (let i = 1; i <= r.total; i++) {
    grid.appendChild(createNumCell(i, soldNums, paidNums, winnerNum));
  }
  grid.onclick = (e) => {
    const btn = e.target.closest('.num-cell');
    if (!btn) return;
    const num = parseInt(btn.dataset.num);
    if (num) showNumInfo(num);
  };
  frag.appendChild(grid);

  c.innerHTML = '';
  c.appendChild(frag);
}

function createNumCell(i, soldNums, paidNums, winnerNum) {
  const btn = document.createElement('button');
  const isPaid = paidNums.has(i);
  const isPending = soldNums.has(i) && !isPaid;
  const isWinner = winnerNum === i;

  let cls = 'num-cell';
  if (isWinner) cls += ' winner';
  else if (isPaid) cls += ' paid';
  else if (isPending) cls += ' pending';

  if (APP.gridFilter === 'paid' && !isPaid) cls += ' hidden-filter';
  else if (APP.gridFilter === 'pending' && !isPending) cls += ' hidden-filter';
  else if (APP.gridFilter === 'available' && soldNums.has(i)) cls += ' hidden-filter';
  else if (APP.gridFilter === 'winner' && !isWinner) cls += ' hidden-filter';

  btn.className = cls;
  btn.dataset.num = i;
  btn.textContent = i;
  return btn;
}

/* ------------------------------------------------------------
   Tab: Compradores
   ------------------------------------------------------------ */
function renderSalesTab(c, r) {
  if (r.sales.length === 0) {
    c.innerHTML = `<div class="empty"><span class="emo">👥</span><h3>Nenhuma venda</h3><p>Toque no <b>+</b> para registrar!</p></div>`;
    return;
  }

  const grouped = groupSalesByBuyer(r);
  const buyers = Object.values(grouped).sort((a, b) => a.name.localeCompare(b.name));

  const frag = document.createDocumentFragment();

  buyers.forEach(b => {
    const allPaid = b.totalPending === 0;
    const allPending = b.totalPaid === 0;

    let cls = 'buyer-card';
    if (allPending) cls += ' pending-all';
    else if (!allPaid) cls += ' partial';
    if (b.hasWinner) cls += ' winner-buyer';

    const color = '#00b894';
    const card = document.createElement('div');
    card.className = cls;

    const chipsHtml = b.sales.map(s => {
      const w = r.winner && r.winner.num === s.num ? '🏆' : '';
      const chipCls = s.paid ? 'paid' : 'pending';
      return `<button class="buyer-chip ${chipCls} ${w ? 'winner' : ''}" data-sid="${s.id}">${s.num}</button>`;
    }).join('');

    const badgeCls = allPaid ? 'all-paid' : allPending ? 'all-pending' : '';
    const badgeText = allPaid ? formatBRL(b.valuePaid) : `${b.totalPaid}/${b.sales.length} pagos`;

    card.innerHTML = `
      <div class="buyer-header-row">
        <div class="buyer-avatar-sm" style="background:${color};">${(b.name[0] || '?').toUpperCase()}</div>
        <div class="buyer-info" data-action="open-buyer">
          <h4>${escapeHtml(b.name)} ${b.hasWinner ? '🏆' : ''}</h4>
          <p>${b.phone ? '📱 ' + escapeHtml(b.phone) + ' • ' : ''}${b.sales.length} número${b.sales.length > 1 ? 's' : ''}</p>
        </div>
        <div class="buyer-total-badge ${badgeCls}">${badgeText}</div>
      </div>
      <div class="buyer-nums-label">🎯 Números (${b.sales.length})</div>
      <div class="buyer-nums-chips">${chipsHtml}</div>
      <div class="buyer-actions-row">
        ${!allPaid ? `<button class="buyer-action-btn primary" data-action="mark-all-paid" data-name="${escapeHtml(b.name)}">
          <svg viewBox="0 0 24 24"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          Marcar tudo
        </button>` : ''}
        <button class="buyer-action-btn" data-action="add-numbers" data-name="${escapeHtml(b.name)}" data-phone="${escapeHtml(b.phone)}">
          <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2Z"/></svg>
          Adicionar
        </button>
        <button class="buyer-action-btn" data-action="open-buyer" data-name="${escapeHtml(b.name)}">
          <svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>
          Detalhes
        </button>
      </div>
    `;

    card.onclick = async (e) => {
      const chip = e.target.closest('.buyer-chip');
      if (chip) {
        e.stopPropagation();
        const { togglePaid } = await import('../modals/sale.modal.js');
        togglePaid(parseInt(chip.dataset.sid));
        return;
      }

      const actionBtn = e.target.closest('[data-action]');
      if (actionBtn) {
        e.stopPropagation();
        const action = actionBtn.dataset.action;
        if (action === 'mark-all-paid') {
          const { markAllPaid } = await import('../modals/sale.modal.js');
          markAllPaid(b.name);
        } else if (action === 'add-numbers') {
          const { addNumbersToBuyer } = await import('../modals/sale.modal.js');
          addNumbersToBuyer(b.name, b.phone);
        } else if (action === 'open-buyer') {
          const { openBuyer } = await import('./buyer.screen.js');
          openBuyer(b.name, r.id);
        }
      }
    };

    frag.appendChild(card);
  });

  c.innerHTML = '';
  c.appendChild(frag);
}

/* ------------------------------------------------------------
   Tab: Info
   ------------------------------------------------------------ */
function renderInfoTab(c, r) {
  const soldNums = getSoldNumbers(r);
  const paid = countPaid(r);
  const pending = r.sales.length - paid;
  const arrecadado = r.sales.reduce((acc, s) => {
    if (!s.paid) return acc;
    return acc + (typeof s.price_charged === 'number' ? s.price_charged : r.price);
  }, 0);
  const totalPotencial = r.sales.reduce((acc, s) => {
    return acc + (typeof s.price_charged === 'number' ? s.price_charged : r.price);
  }, 0);

  const dataStr = r.date ? new Date(r.date + 'T12:00:00').toLocaleDateString('pt-BR') : 'Não definida';
  const timeStr = r.time || '';

  let html = '';

  if (r.image) {
    html += `<div class="prize-image"><img src="${r.image}" loading="lazy"></div>`;
  } else {
    html += `<div class="prize-image">${r.emoji}</div>`;
  }

  html += `<button class="btn btn-ghost" style="width:100%;margin-bottom:12px;" onclick="openEditImageModal()">${r.image ? '🔄 Trocar imagem' : '🖼️ Adicionar imagem'}</button>`;

  if (r.promo_enabled) {
    const unitPromo = r.promo_price / r.promo_quantity;
    const saving = r.price - unitPromo;
    const pct = r.price > 0 ? Math.round((saving / r.price) * 100) : 0;
    html += `<div class="promo-info-banner"><div class="pib-icon">🎁</div><div class="pib-text"><strong>PROMOÇÃO ATIVA:</strong><br>Leve ${r.promo_quantity} por ${formatBRL(r.promo_price)}<br><span style="font-size:11.5px;opacity:.8;">Cada número sai por ${formatBRL(unitPromo)} (-${pct}%)</span></div></div>`;
  }

  if (r.winner) {
    const wDate = r.winner.date ? new Date(r.winner.date).toLocaleDateString('pt-BR') : '';
    html += `<div class="winner-banner"><div class="wb-label">🏆 Ganhador Oficial</div><div class="wb-number">Nº ${r.winner.num}</div><div class="wb-name">${escapeHtml(r.winner.name)}</div>${wDate ? `<div class="wb-date">📅 ${wDate}</div>` : ''}</div>`;
  }

  html += `
    <div class="info-box"><div class="ib-icon">🎁</div><div class="ib-text"><strong>Prêmio:</strong> ${escapeHtml(r.prize)}<br><strong>Sorteio:</strong> ${dataStr}${timeStr ? ' às ' + timeStr : ''}</div></div>
    <div class="stat-card" style="margin-bottom:10px;cursor:default;">
      <div class="stat-label">💰 Arrecadado</div>
      <div class="stat-value">${formatBRL(arrecadado)}</div>
      <div class="stat-sub">de ${formatBRL(totalPotencial)} vendidos</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;">
      <div class="stat-card" style="cursor:default;"><div class="stat-label">✅ Pagos</div><div class="stat-value">${paid}</div></div>
      <div class="stat-card" style="cursor:default;"><div class="stat-label">⏳ Pendentes</div><div class="stat-value">${pending}</div></div>
      <div class="stat-card" style="cursor:default;"><div class="stat-label">🎯 Vendidos</div><div class="stat-value">${soldNums.size}</div></div>
      <div class="stat-card" style="cursor:default;"><div class="stat-label">🆓 Livres</div><div class="stat-value">${r.total - soldNums.size}</div></div>
    </div>
    <button class="btn btn-ghost" style="width:100%;margin-bottom:10px;" onclick="openEditPromoModal()">🎁 ${r.promo_enabled ? 'Editar promoção' : 'Adicionar promoção'}</button>
  `;

  if (!r.isShared) {
    html += `<button class="btn btn-ghost" style="width:100%;margin-bottom:10px;color:var(--primary);" onclick="openShareModal()">👥 Compartilhar com alguém</button>`;
  }

  if (r.winner) {
    html += `<button class="btn btn-ghost" style="width:100%;margin-bottom:10px;color:var(--danger);" onclick="removeWinner()">❌ Remover ganhador</button>`;
  } else {
    html += `<button class="btn-winner" onclick="openWinnerModal()"><svg viewBox="0 0 24 24"><path d="M5 16 3 5h4l1 6 4-6h4l-4 6h1l-4 6h-4Zm14-11v2h2l-2 9h-2l-1-5-1 5h-2l-2-9h2v-2h6Z"/></svg> Marcar Ganhador</button>`;
  }

  html += `<button class="btn btn-primary" style="width:100%;margin-bottom:8px;" onclick="shareMarketingText()">📢 Divulgação</button>`;
  html += `<button class="btn btn-ghost" style="width:100%;margin-bottom:8px;" onclick="openListModal('${r.id}')">📋 Gerar lista</button>`;
  html += `<button class="btn btn-accent" style="width:100%;" onclick="startSort('${r.id}')">🎲 Sortear agora</button>`;

  c.innerHTML = html;
}

/* ------------------------------------------------------------
   Ações
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
  desc += `\n💰 ${formatBRL(price)}`;
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
   Delete
   ------------------------------------------------------------ */
export async function deleteRifa(id, ev) {
  if (ev) ev.stopPropagation();
  const rifa = getRifa(id);
  if (!rifa) return;

  if (rifa.isShared) {
    toast('⚠️ Você não é dono');
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