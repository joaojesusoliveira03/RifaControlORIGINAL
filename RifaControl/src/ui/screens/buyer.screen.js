/* ============================================================
   Buyer Screen — detalhes completos de um comprador
   ============================================================ */

import { APP } from '../../config/state.js';
import { escapeHtml, formatBRL, onlyDigits } from '../../utils/format.js';
import { haptic } from '../../utils/haptic.js';
import { toast } from '../components/toast.js';
import { saveRifaCloud, getRifa } from '../../services/rifas.service.js';
import { buildBuyerData } from '../../services/sales.service.js';

export function openBuyer(buyerName, rifaId) {
  haptic(10);
  const r = getRifa(rifaId);
  if (!r) return;

  const data = buildBuyerData(r, buyerName);
  if (!data) {
    toast('⚠️ Comprador não encontrado');
    return;
  }

  APP.currentBuyer = { name: buyerName, rifaId };

  const content = document.getElementById('buyer-content');
  if (!content) return;

  const color = '#00b894';

  let html = `
    <div class="buyer-screen-header">
      <div class="buyer-screen-avatar" style="background:${color};">${(buyerName[0] || '?').toUpperCase()}</div>
      <div class="buyer-screen-name">${escapeHtml(buyerName)}</div>
      <div class="buyer-screen-phone">${data.phone ? '📱 ' + escapeHtml(data.phone) : '📱 Sem telefone'}</div>
      <div class="buyer-screen-actions">
        ${data.phone ? `<button class="mini-btn" id="btn-share-whats">💬 WhatsApp</button>` : ''}
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;">
      <div class="stat-card" style="cursor:default;"><div class="stat-label">🎯 Números</div><div class="stat-value">${data.total}</div></div>
      <div class="stat-card" style="cursor:default;"><div class="stat-label">💰 Pago</div><div class="stat-value" style="color:var(--success)">${formatBRL(data.valuePaid)}</div></div>
      <div class="stat-card" style="cursor:default;"><div class="stat-label">⏳ Pendente</div><div class="stat-value" style="color:var(--warning)">${formatBRL(data.valuePending)}</div></div>
      <div class="stat-card" style="cursor:default;"><div class="stat-label">📊 Total</div><div class="stat-value">${formatBRL(data.totalValue)}</div></div>
    </div>
  `;

  if (data.totalSavings > 0) {
    html += `<div class="promo-info-banner" style="margin-bottom:14px;"><div class="pib-icon">🎁</div><div class="pib-text">Economizou <strong>${formatBRL(data.totalSavings)}</strong> com promoções!</div></div>`;
  }

  if (data.sellers.length > 0) {
    html += `<div class="report-card" style="margin-bottom:14px;"><h4>🛒 Vendido por</h4><div style="display:flex;flex-wrap:wrap;gap:8px;">${data.sellers.map(s => `<span style="background:var(--bg2);padding:6px 12px;border-radius:8px;font-size:12px;font-weight:700;">👤 ${escapeHtml(s)}</span>`).join('')}</div></div>`;
  }

  html += `<div class="report-card"><h4>🎯 Números</h4><div class="buyer-nums-chips">${data.sales.map(s => {
    const isWinner = r.winner && r.winner.num === s.num;
    return `<button class="buyer-chip ${s.paid ? 'paid' : 'pending'} ${isWinner ? 'winner' : ''}" data-sid="${s.id}">${s.num}</button>`;
  }).join('')}</div></div>`;

  html += `<div class="report-card"><h4>📋 Histórico de vendas</h4>${data.sales.map(s => {
    const dateStr = s.date ? new Date(s.date).toLocaleDateString('pt-BR') : '';
    const timeStr = s.date ? new Date(s.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
    const price = typeof s.price_charged === 'number' ? s.price_charged : r.price;
    return `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);font-size:12.5px;">
      <div>
        <div style="font-weight:800;">Nº ${s.num}</div>
        <div style="font-size:11px;color:var(--muted);">${s.sold_by_name ? '🛒 ' + escapeHtml(s.sold_by_name) : '📌'} ${dateStr ? '• ' + dateStr + (timeStr ? ' ' + timeStr : '') : ''}</div>
      </div>
      <div style="font-weight:800;color:${s.paid ? 'var(--success)' : 'var(--warning)'};">${formatBRL(price)}</div>
    </div>`;
  }).join('')}</div>`;

  html += `<div class="report-card"><h4>⚡ Ações</h4>${data.totalPending > 0 ? `<button class="btn btn-primary" style="width:100%;margin-bottom:8px;" id="btn-mark-all-paid-buyer">✅ Marcar tudo pago</button>` : ''}</div>`;

  content.innerHTML = html;

  // Chips toggle
  content.querySelectorAll('.buyer-chip').forEach(chip => {
    chip.onclick = async () => {
      const sid = parseInt(chip.dataset.sid);
      haptic(8);
      const sale = r.sales.find(x => x.id === sid);
      if (sale) {
        sale.paid = !sale.paid;
        try {
          await saveRifaCloud(r);
          const idx = APP.rifas.findIndex(x => x.id === r.id);
          if (idx >= 0) APP.rifas[idx] = r;
          openBuyer(buyerName, rifaId);
        } catch (err) {
          toast('❌ Erro');
        }
      }
    };
  });

  // Botões
  const btnShare = document.getElementById('btn-share-whats');
  if (btnShare) btnShare.onclick = () => shareWhatsBuyer(buyerName, rifaId);

  const btnMarkAll = document.getElementById('btn-mark-all-paid-buyer');
  if (btnMarkAll) btnMarkAll.onclick = () => markAllPaidBuyerScreen();

  document.querySelectorAll('.screen').forEach(x => x.classList.remove('active'));
  const screen = document.getElementById('screen-buyer');
  if (screen) screen.classList.add('active');
}

export function closeBuyer() {
  haptic(8);
  if (APP.currentBuyer) {
    import('./rifa.screen.js').then(m => m.openRifa(APP.currentBuyer.rifaId));
  } else {
    import('../../core/router.js').then(m => m.showScreen('home'));
  }
}

async function markAllPaidBuyerScreen() {
  const { name, rifaId } = APP.currentBuyer;
  const r = getRifa(rifaId);
  if (!r) return;

  let count = 0;
  r.sales.forEach(s => {
    if (s.name === name && !s.paid) { s.paid = true; count++; }
  });

  try {
    await saveRifaCloud(r);
    const idx = APP.rifas.findIndex(x => x.id === r.id);
    if (idx >= 0) APP.rifas[idx] = r;
    openBuyer(name, rifaId);
    haptic([20, 40, 20]);
    const { launchConfetti } = await import('../components/confetti.js');
    launchConfetti('big');
    toast(`✅ ${count} pagos!`);
  } catch (err) {
    toast('❌ Erro');
  }
}

function shareWhatsBuyer(buyerName, rifaId) {
  const r = getRifa(rifaId);
  if (!r) return;
  const sales = r.sales.filter(s => s.name === buyerName);
  if (sales.length === 0 || !sales[0].phone) return;

  const phone = onlyDigits(sales[0].phone);
  const phoneFull = phone.length <= 11 ? '55' + phone : phone;
  const nums = sales.map(s => s.num).join(', ');
  let total = 0;
  sales.forEach(s => {
    total += typeof s.price_charged === 'number' ? s.price_charged : r.price;
  });

  const msg = `Olá ${buyerName}! 🎟️\n\nSeus números na rifa *${r.name}*:\n\n🎯 ${nums}\n💰 Total: ${formatBRL(total)}\n${r.date ? '📅 ' + new Date(r.date + 'T12:00:00').toLocaleDateString('pt-BR') + (r.time ? ' às ' + r.time : '') + '\n' : ''}\nBoa sorte! 🍀`;

  haptic(15);
  window.open(`https://wa.me/${phoneFull}?text=${encodeURIComponent(msg)}`, '_blank');
}