/* ============================================================
   Reports Screen — relatórios gerais com drill-down
   ============================================================ */

import { APP } from '../../config/state.js';
import { RIFA_COLORS } from '../../config/constants.js';
import { escapeHtml, formatBRL, getAvatarColor, getAvatarInitial } from '../../utils/format.js';
import { haptic } from '../../utils/haptic.js';
import {
  buildGeneralReport,
  buildPerRifaReport,
  buildBuyersRanking,
  buildSellersRanking,
  buildRifaDetailReport
} from '../../services/reports.service.js';
import { getRifa } from '../../services/rifas.service.js';

/* ------------------------------------------------------------
   Cache de relatórios — pra não recalcular toda hora
   ------------------------------------------------------------ */
let cache = {
  key: null,
  general: null,
  perRifa: null,
  buyers: null,
  sellers: null
};

function getCacheKey() {
  // Recalcula só se mudou algo relevante
  return APP.rifas.map(r => `${r.id}:${r.sales?.length || 0}:${r.updatedAt || ''}`).join('|');
}

function invalidateCache() {
  cache = { key: null, general: null, perRifa: null, buyers: null, sellers: null };
}

function getReport(tab) {
  const key = getCacheKey();
  if (cache.key !== key) {
    cache.key = key;
    cache.general = null;
    cache.perRifa = null;
    cache.buyers = null;
    cache.sellers = null;
  }

  if (tab === 'geral' && !cache.general) cache.general = buildGeneralReport(APP.rifas);
  if (tab === 'geral' && !cache.perRifa) cache.perRifa = buildPerRifaReport(APP.rifas);
  if (tab === 'compradores' && !cache.buyers) cache.buyers = buildBuyersRanking(APP.rifas, 20);
  if (tab === 'vendedores' && !cache.sellers) cache.sellers = buildSellersRanking(APP.rifas);

  return cache;
}

/* ------------------------------------------------------------
   Render principal
   ------------------------------------------------------------ */
export function renderReports() {
  const c = document.getElementById('report-content');
  if (!c) return;

  // Se está com a tela de detalhe aberta, renderiza ela
  if (APP.currentReportRifa) {
    renderRifaDetail(c, APP.currentReportRifa);
    return;
  }

  if (APP.rifas.length === 0) {
    c.innerHTML = `<div class="empty"><span class="emo">📊</span><h3>Sem dados</h3><p>Crie uma rifa pra ver os relatórios</p></div>`;
    return;
  }

  if (APP.currentReportTab === 'geral') renderGeral(c);
  else if (APP.currentReportTab === 'compradores') renderCompradores(c);
  else if (APP.currentReportTab === 'vendedores') renderVendedores(c);
}

/* ------------------------------------------------------------
   Aba: GERAL — KPIs + cards por rifa
   ------------------------------------------------------------ */
function renderGeral(c) {
  const { general, perRifa } = getReport('geral');

  const frag = document.createDocumentFragment();

  // ---- KPIs grandes ----
  const kpis = document.createElement('div');
  kpis.className = 'report-kpis';
  kpis.innerHTML = `
    <div class="report-kpi" data-accent="primary">
      <div class="kpi-icon">💰</div>
      <div class="kpi-body">
        <div class="kpi-label">Arrecadado</div>
        <div class="kpi-value">${formatBRL(general.arrecadado)}</div>
        <div class="kpi-sub">${general.vendidos} números vendidos</div>
      </div>
    </div>
    <div class="report-kpi" data-accent="warning">
      <div class="kpi-icon">⏳</div>
      <div class="kpi-body">
        <div class="kpi-label">Pendente</div>
        <div class="kpi-value">${formatBRL(general.pendente)}</div>
        <div class="kpi-sub">${general.vendidos} vendidos no total</div>
      </div>
    </div>
    <div class="report-kpi" data-accent="info">
      <div class="kpi-icon">🎯</div>
      <div class="kpi-body">
        <div class="kpi-label">Números</div>
        <div class="kpi-value">${general.vendidos}/${general.totalNumeros}</div>
        <div class="kpi-sub">${general.pctVendido}% vendido</div>
      </div>
    </div>
    <div class="report-kpi" data-accent="gold">
      <div class="kpi-icon">🏆</div>
      <div class="kpi-body">
        <div class="kpi-label">Rifas</div>
        <div class="kpi-value">${general.totalRifas}</div>
        <div class="kpi-sub">${general.comGanhador} com ganhador</div>
      </div>
    </div>
  `;
  frag.appendChild(kpis);

  // ---- Título ----
  const title = document.createElement('div');
  title.className = 'report-section-title';
  title.innerHTML = `<h3>📊 Resumo por rifa</h3><span class="count">${perRifa.length}</span>`;
  frag.appendChild(title);

  // ---- Cards por rifa ----
  const list = document.createElement('div');
  list.className = 'report-rifa-list';

  perRifa.forEach(r => {
    list.appendChild(createRifaReportCard(r));
  });

  frag.appendChild(list);

  c.innerHTML = '';
  c.appendChild(frag);

  // Bind de clique
  c.querySelectorAll('[data-rifa-id]').forEach(el => {
    el.onclick = () => {
      haptic(8);
      APP.currentReportRifa = el.dataset.rifaId;
      renderReports();
    };
  });
}

function createRifaReportCard(r) {
  const colors = RIFA_COLORS[r.colorIdx || 0];
  const card = document.createElement('div');
  card.className = 'report-rifa-card';
  card.dataset.rifaId = r.id;

  const winnerBadge = r.hasWinner
    ? `<span class="rrc-badge gold">🏆 Nº ${r.winner.num}</span>`
    : '';

  card.innerHTML = `
    <div class="rrc-color" style="background:linear-gradient(135deg,${colors.c1},${colors.c2});">${r.emoji}</div>
    <div class="rrc-body">
      <div class="rrc-top">
        <div class="rrc-title">
          <h4>${escapeHtml(r.name)}</h4>
          <p>${escapeHtml(r.prize)}</p>
        </div>
        <div class="rrc-value">
          <strong>${formatBRL(r.arrecadado)}</strong>
          <span>de ${formatBRL(r.totalPotencial)}</span>
        </div>
      </div>

      <div class="rrc-progress">
        <div class="rrc-progress-fill" style="width:${r.pct}%"></div>
      </div>

      <div class="rrc-stats">
        <span class="rrc-stat"><b>${r.sold}</b>/${r.total} vendidos</span>
        <span class="rrc-stat success"><b>${r.paid}</b> pagos</span>
        ${r.pending > 0 ? `<span class="rrc-stat warn"><b>${r.pending}</b> pendentes</span>` : ''}
        <span class="rrc-stat muted">👥 ${r.buyersCount} compradores</span>
        ${winnerBadge}
      </div>
    </div>
  `;

  return card;
}

/* ------------------------------------------------------------
   Aba: COMPRADORES
   ------------------------------------------------------------ */
function renderCompradores(c) {
  const { buyers } = getReport('compradores');

  if (buyers.length === 0) {
    c.innerHTML = `<div class="empty"><span class="emo">👥</span><h3>Sem compradores</h3></div>`;
    return;
  }

  const frag = document.createDocumentFragment();

  const title = document.createElement('div');
  title.className = 'report-section-title';
  title.innerHTML = `<h3>🏆 Top ${buyers.length} compradores</h3>`;
  frag.appendChild(title);

  const list = document.createElement('div');
  list.className = 'report-ranking';

  buyers.forEach((x, i) => {
    const color = getAvatarColor(x.name);
    const posClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
    const paidPct = x.total > 0 ? Math.round((x.paid / x.total) * 100) : 0;

    const item = document.createElement('div');
    item.className = 'ranking-item';
    item.innerHTML = `
      <div class="rank-pos ${posClass}">${i + 1}</div>
      <div class="avatar" style="width:44px;height:44px;font-size:16px;background:${color};">${getAvatarInitial(x.name)}</div>
      <div class="rank-info">
        <h5>${escapeHtml(x.name)}</h5>
        <p>${formatBRL(x.total)} • ${x.rifas} rifa${x.rifas > 1 ? 's' : ''} • ${paidPct}% pago</p>
      </div>
      <div class="rank-count">${x.count} cotas</div>
    `;
    list.appendChild(item);
  });

  frag.appendChild(list);

  c.innerHTML = '';
  c.appendChild(frag);
}

/* ------------------------------------------------------------
   Aba: VENDEDORES
   ------------------------------------------------------------ */
function renderVendedores(c) {
  const { sellers } = getReport('vendedores');

  if (sellers.length === 0) {
    c.innerHTML = `<div class="empty"><span class="emo">👤</span><h3>Sem vendas ainda</h3><p>Os vendedores aparecem depois<br>que alguém cadastrar venda.</p></div>`;
    return;
  }

  const frag = document.createDocumentFragment();

  const title = document.createElement('div');
  title.className = 'report-section-title';
  title.innerHTML = `<h3>🏆 Top vendedores</h3>`;
  frag.appendChild(title);

  const list = document.createElement('div');
  list.className = 'report-ranking';

  sellers.forEach((x, i) => {
    const color = getAvatarColor(x.name);
    const posClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
    const paidPct = x.total > 0 ? Math.round((x.paid / x.total) * 100) : 0;

    const item = document.createElement('div');
    item.className = 'ranking-item';
    item.innerHTML = `
      <div class="rank-pos ${posClass}">${i + 1}</div>
      <div class="avatar" style="width:44px;height:44px;font-size:16px;background:${color};">${getAvatarInitial(x.name)}</div>
      <div class="rank-info">
        <h5>${escapeHtml(x.name)}</h5>
        <p>${formatBRL(x.total)} • ${x.rifas} rifa${x.rifas > 1 ? 's' : ''} • ${paidPct}% pago</p>
      </div>
      <div class="rank-count">${x.count} cotas</div>
    `;
    list.appendChild(item);
  });

  frag.appendChild(list);

  c.innerHTML = '';
  c.appendChild(frag);
}

/* ------------------------------------------------------------
   Detalhe de uma rifa específica
   ------------------------------------------------------------ */
function renderRifaDetail(c, rifaId) {
  const rifa = getRifa(rifaId);
  if (!rifa) {
    APP.currentReportRifa = null;
    renderReports();
    return;
  }

  const d = buildRifaDetailReport(rifa);
  if (!d) {
    APP.currentReportRifa = null;
    renderReports();
    return;
  }

  const colors = RIFA_COLORS[d.colorIdx || 0];

  let html = `
    <button class="report-back-btn" onclick="window.closeRifaReport()">
      <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2Z"/></svg>
      Voltar
    </button>

    <div class="report-detail-header" style="background:linear-gradient(135deg,${colors.c1},${colors.c2});">
      <div class="rdh-emoji">${d.emoji}</div>
      <div class="rdh-info">
        <h2>${escapeHtml(d.name)}</h2>
        <p>🎁 ${escapeHtml(d.prize)}</p>
      </div>
    </div>

    <div class="report-kpis" style="margin-bottom:18px;">
      <div class="report-kpi" data-accent="primary">
        <div class="kpi-icon">💰</div>
        <div class="kpi-body">
          <div class="kpi-label">Arrecadado</div>
          <div class="kpi-value">${formatBRL(d.arrecadado)}</div>
        </div>
      </div>
      <div class="report-kpi" data-accent="warning">
        <div class="kpi-icon">⏳</div>
        <div class="kpi-body">
          <div class="kpi-label">Pendente</div>
          <div class="kpi-value">${formatBRL(d.pendenteValor)}</div>
        </div>
      </div>
      <div class="report-kpi" data-accent="info">
        <div class="kpi-icon">🎯</div>
        <div class="kpi-body">
          <div class="kpi-label">Vendidos</div>
          <div class="kpi-value">${d.sold}/${d.total}</div>
        </div>
      </div>
      <div class="report-kpi" data-accent="gold">
        <div class="kpi-icon">👥</div>
        <div class="kpi-body">
          <div class="kpi-label">Compradores</div>
          <div class="kpi-value">${d.buyersCount}</div>
        </div>
      </div>
    </div>

    <div class="report-card" style="margin-bottom:16px;">
      <h4>📊 Progresso</h4>
      <div class="progress-bar" style="margin-top:8px;">
        <div class="progress-fill" style="width:${d.pct}%"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted);margin-top:6px;">
        <span><b style="color:var(--success);">${d.paid}</b> pagos</span>
        <span><b style="color:var(--warning);">${d.pending}</b> pendentes</span>
        <span><b>${d.available}</b> disponíveis</span>
      </div>
    </div>
  `;

  if (d.winner) {
    const wDate = d.winner.date ? new Date(d.winner.date).toLocaleDateString('pt-BR') : '';
    html += `
      <div class="winner-banner" style="margin-bottom:16px;">
        <div class="wb-label">🏆 Ganhador</div>
        <div class="wb-number">Nº ${d.winner.num}</div>
        <div class="wb-name">${escapeHtml(d.winner.name)}</div>
        ${wDate ? `<div class="wb-date">📅 ${wDate}</div>` : ''}
      </div>
    `;
  }

  if (d.topBuyers.length > 0) {
    html += `<div class="report-card" style="margin-bottom:16px;"><h4>🏆 Top compradores desta rifa</h4>`;
    d.topBuyers.forEach((b, i) => {
      const color = getAvatarColor(b.name);
      const posClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
      html += `
        <div class="ranking-item">
          <div class="rank-pos ${posClass}">${i + 1}</div>
          <div class="avatar" style="width:38px;height:38px;font-size:14px;background:${color};">${getAvatarInitial(b.name)}</div>
          <div class="rank-info">
            <h5>${escapeHtml(b.name)}</h5>
            <p>Nº ${b.nums.slice(0, 8).join(', ')}${b.nums.length > 8 ? '...' : ''}</p>
          </div>
          <div class="rank-count">${b.count}</div>
        </div>
      `;
    });
    html += `</div>`;
  }

  if (d.topSellers.length > 0) {
    html += `<div class="report-card" style="margin-bottom:16px;"><h4>🛒 Vendedores desta rifa</h4>`;
    d.topSellers.forEach((s, i) => {
      const color = getAvatarColor(s.name);
      html += `
        <div class="ranking-item">
          <div class="rank-pos">${i + 1}</div>
          <div class="avatar" style="width:38px;height:38px;font-size:14px;background:${color};">${getAvatarInitial(s.name)}</div>
          <div class="rank-info">
            <h5>${escapeHtml(s.name)}</h5>
            <p>${formatBRL(s.total)}</p>
          </div>
          <div class="rank-count">${s.count}</div>
        </div>
      `;
    });
    html += `</div>`;
  }

  c.innerHTML = html;
}

/* ------------------------------------------------------------
   Ações globais
   ------------------------------------------------------------ */
export function closeRifaReport() {
  haptic(8);
  APP.currentReportRifa = null;
  renderReports();
}