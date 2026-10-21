/* ============================================================
   Info Tab — Hero Card + Grupos + Ranking
   ============================================================ */

import { RIFA_COLORS } from '../../../config/constants.js';
import { escapeHtml, formatBRL, getAvatarColor, getAvatarInitial } from '../../../utils/format.js';
import { countPaid, getSoldNumbers, groupSalesByBuyer } from '../../../services/sales.service.js';

export function renderInfoTab(c, r) {
  const soldNums = getSoldNumbers(r);
  const paid = countPaid(r);
  const pending = r.sales.length - paid;
  const available = r.total - soldNums.size;

  const arrecadado = r.sales.reduce((acc, s) => {
    if (!s.paid) return acc;
    return acc + (typeof s.price_charged === 'number' ? s.price_charged : r.price);
  }, 0);

  const totalPotencial = r.sales.reduce((acc, s) => {
    return acc + (typeof s.price_charged === 'number' ? s.price_charged : r.price);
  }, 0);

  const pct = r.total ? Math.round(soldNums.size / r.total * 100) : 0;
  const colors = RIFA_COLORS[r.colorIdx || 0];
  const dataStr = r.date ? new Date(r.date + 'T12:00:00').toLocaleDateString('pt-BR') : 'Não definida';
  const timeStr = r.time || '';

  // Múltiplos Prêmios
  let prizesHtml = '';
  if (r.prizes && r.prizes.length > 0) {
    prizesHtml = `<div class="info-card">
      <div class="info-card-label">🏆 Prêmios</div>
      <div style="display:flex; flex-direction:column; gap:8px; margin-top:8px;">
        ${r.prizes.map((p, i) => `
          <div style="display:flex; align-items:center; gap:10px; background:var(--bg2); padding:10px; border-radius:10px; border:1px solid var(--border);">
            <span style="font-size:16px; font-weight:900; color:var(--primary); background:var(--card); padding:4px 10px; border-radius:8px;">${i + 1}º</span>
            <span style="font-size:13px; font-weight:600; color:var(--text);">${escapeHtml(p)}</span>
          </div>
        `).join('')}
      </div>
    </div>`;
  }

  // Prêmio Top Comprador
  let topBuyerPrizeHtml = '';
  if (r.top_buyer_prize) {
    topBuyerPrizeHtml = `<div class="info-card info-promo" style="background:linear-gradient(135deg, rgba(253,203,110,.2), rgba(245,158,11,.1)); border-color:var(--gold);">
      <div class="info-card-label" style="color:var(--gold);">👑 Top Comprador</div>
      <div style="font-size:14px; font-weight:800; color:var(--text); margin-top:4px;">${escapeHtml(r.top_buyer_prize)}</div>
    </div>`;
  }

  // Mini Ranking
  const buyers = Object.values(groupSalesByBuyer(r)).sort((a, b) => (b.totalPaid + b.totalPending) - (a.totalPaid + a.totalPending)).slice(0, 5);
  let rankingHtml = '';
  if (buyers.length > 0) {
    rankingHtml = `<div class="info-card">
      <div class="info-card-label">👑 Mini Ranking (Top Compradores)</div>
      <div style="display:flex; flex-direction:column; gap:6px; margin-top:8px;">
        ${buyers.map((b, i) => {
          const color = getAvatarColor(b.name);
          const posClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
          return `
            <div style="display:flex; align-items:center; gap:10px; padding:6px 0; border-bottom:1px solid var(--border);">
              <div class="rank-pos ${posClass}" style="width:24px; height:24px; font-size:11px;">${i+1}</div>
              <div class="avatar" style="width:28px; height:28px; font-size:12px; background:${color};">${getAvatarInitial(b.name)}</div>
              <div style="flex:1; min-width:0;">
                <div style="font-size:12px; font-weight:800; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(b.name)}</div>
              </div>
              <div style="font-size:11px; font-weight:800; color:var(--muted);">${b.sales.length} cotas</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>`;
  }

  const winnerHtml = r.winner ? `
    <div class="info-card info-winner">
      <div class="info-card-label">🏆 Ganhador</div>
      <div class="winner-detail">
        <div class="winner-num-big">Nº ${r.winner.num}</div>
        <div class="winner-name">${escapeHtml(r.winner.name)}</div>
        ${r.winner.date ? `<div class="winner-date">📅 ${new Date(r.winner.date).toLocaleDateString('pt-BR')}</div>` : ''}
      </div>
    </div>
  ` : '';

  const promoHtml = (r.promos && r.promos.length > 0) ? (() => {
    let promoText = '';
    r.promos.forEach(p => {
      const unitPromo = p.price / p.quantity;
      const saving = r.price - unitPromo;
      const pctPromo = r.price > 0 ? Math.round((saving / r.price) * 100) : 0;
      promoText += `
        <div class="promo-line" style="margin-bottom:6px;">
          <strong>Leve ${p.quantity}</strong> por <strong>${formatBRL(p.price)}</strong> 
          <span class="promo-pct">-${pctPromo}%</span>
        </div>
        <div class="promo-sub" style="margin-bottom:12px; font-size:11px;">Cada cota sai por ${formatBRL(unitPromo)}</div>
      `;
    });
    return `
      <div class="info-card info-promo">
        <div class="info-card-label">🎁 Promoções ativas</div>
        <div class="promo-detail">${promoText}</div>
      </div>
    `;
  })() : '';

  const imageHtml = r.image ? `<img src="${r.image}" alt="${escapeHtml(r.prize)}">` : `<div class="info-hero-emoji">${r.emoji}</div>`;

  const shareBtn = !r.isShared
    ? `<button class="info-action" onclick="openShareModal()"><svg viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg><span>Compartilhar</span></button>`
    : `<button class="info-action danger" onclick="leaveRifa('${r.id}')"><svg viewBox="0 0 24 24"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg><span>Sair da rifa</span></button>`;

  const winnerActionBtn = r.winner
    ? `<button class="info-action info-action-primary danger" onclick="removeWinner()"><svg viewBox="0 0 24 24"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg><span>Remover ganhador</span></button>`
    : `<button class="info-action info-action-primary" onclick="openWinnerModal()"><svg viewBox="0 0 24 24"><path d="M5 16 3 5h4l1 6 4-6h4l-4 6h1l-4 6h-4Zm14-11v2h2l-2 9h-2l-1-5-1 5h-2l-2-9h2v-2h6Z"/></svg><span>Marcar Ganhador</span></button>`;

  const deleteBtn = !r.isShared
    ? `<button class="info-action ghost" style="color: var(--danger); border-color: rgba(239, 68, 68, 0.3); margin-top: 10px;" onclick="deleteRifa('${r.id}')"><svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg><span>Excluir Rifa</span></button>`
    : '';

  const html = `
    <div class="info-page">
      <div class="info-hero" style="--rifa-color-1:${colors.c1};--rifa-color-2:${colors.c2};">
        <div class="info-hero-img">${imageHtml}</div>
        <div class="info-hero-overlay"></div>
        <div class="info-hero-content">
          <div class="info-hero-emoji-badge">${r.emoji}</div>
          <h1 class="info-hero-title">${escapeHtml(r.prize)}</h1>
          <div class="info-hero-sub">🎟️ ${escapeHtml(r.name)}</div>
          <div class="info-hero-meta"><span>📅 ${dataStr}${timeStr ? ' às ' + timeStr : ''}</span></div>
        </div>
        <button class="info-hero-edit" onclick="openEditImageModal()" title="Trocar imagem"><svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg></button>
      </div>

      <div class="info-card info-financial">
        <div class="info-card-label">💰 Arrecadado</div>
        <div class="financial-big">${formatBRL(arrecadado)}</div>
        <div class="financial-sub">de ${formatBRL(totalPotencial)} vendidos</div>
        <div class="financial-progress"><div class="financial-progress-fill" style="width:${pct}%"></div></div>
        <div class="financial-pct">${pct}% vendido</div>
      </div>

      <div class="info-mini-stats">
        <div class="mini-stat paid"><div class="mini-stat-value">${paid}</div><div class="mini-stat-label">Pagos</div></div>
        <div class="mini-stat pending"><div class="mini-stat-value">${pending}</div><div class="mini-stat-label">Pendentes</div></div>
        <div class="mini-stat available"><div class="mini-stat-value">${available}</div><div class="mini-stat-label">Livres</div></div>
        <div class="mini-stat total"><div class="mini-stat-value">${r.total}</div><div class="mini-stat-label">Total</div></div>
      </div>

      ${winnerHtml}
      ${prizesHtml}
      ${topBuyerPrizeHtml}
      ${promoHtml}
      ${rankingHtml}

      <div class="info-actions-section info-actions-main">
        <div class="info-section-title">⚡ Ações</div>
        <div class="info-actions">${winnerActionBtn}</div>
        <div class="info-actions-grid">
          <button class="info-action" onclick="startSort('${r.id}')"><svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2ZM7.5 18c-.83 0-1.5-.67-1.5-1.5S6.67 15 7.5 15s1.5.67 1.5 1.5S8.33 18 7.5 18Z"/></svg><span>Sortear</span></button>
          <button class="info-action" onclick="shareMarketingText()"><svg viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg><span>Divulgar</span></button>
          <button class="info-action" onclick="openListModal('${r.id}')"><svg viewBox="0 0 24 24"><path d="M3 5h2V3c-1.1 0-2 .9-2 2Zm0 8h2v-2H3v2Zm4 8h2v-2H7v2ZM3 9h2V7H3v2Zm10-6h-2v2h2V3Zm6 0v2h2c0-1.1-.9-2-2-2ZM5 21v-2H3c0 1.1.9 2 2 2Zm-2-4h2v-2H3v2ZM9 3H7v2h2V3Zm2 18h2v-2h-2v2Zm8-8h2v-2h-2v2Zm0 8c1.1 0 2-.9 2-2h-2v2Zm0-12h2V7h-2v2Zm0 8h2v-2h-2v2Zm-4 4h2v-2h-2v2Zm0-16h2V3h-2v2ZM7 17h10V7H7v10Zm2-8h6v6H9V9Z"/></svg><span>Lista</span></button>
          ${shareBtn}
        </div>
      </div>

      <div class="info-actions-section info-actions-edit">
        <div class="info-section-title">🔧 Editar</div>
        <div class="info-actions-grid">
          <button class="info-action ghost" onclick="openEditPromoModal()"><svg viewBox="0 0 24 24"><path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2z"/></svg><span>${(r.promos && r.promos.length > 0) ? 'Editar promoções' : 'Adicionar promoção'}</span></button>
        </div>
        ${deleteBtn}
      </div>
    </div>
  `;

  c.innerHTML = html;
}