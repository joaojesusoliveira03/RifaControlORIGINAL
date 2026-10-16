/* ============================================================
   Reports Screen — relatórios gerais
   ============================================================ */

import { APP } from '../../config/state.js';
import { escapeHtml, formatBRL, getAvatarColor, getAvatarInitial } from '../../utils/format.js';
import { buildGeneralReport, buildBuyersRanking, buildSellersRanking } from '../../services/reports.service.js';

export function renderReports() {
  const c = document.getElementById('report-content');
  if (!c) return;

  if (APP.rifas.length === 0) {
    c.innerHTML = `<div class="empty"><span class="emo">📊</span><h3>Sem dados</h3></div>`;
    return;
  }

  if (APP.currentReportTab === 'geral') renderGeral(c);
  else if (APP.currentReportTab === 'compradores') renderCompradores(c);
  else if (APP.currentReportTab === 'vendedores') renderVendedores(c);
}

function renderGeral(c) {
  const g = buildGeneralReport(APP.rifas);

  c.innerHTML = `
    <div class="report-card">
      <h4>💰 Financeiro</h4>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
        <div>
          <div class="big-number-label">Arrecadado</div>
          <div class="big-number">${formatBRL(g.arrecadado)}</div>
        </div>
        <div>
          <div class="big-number-label">Pendente</div>
          <div class="big-number gold">${formatBRL(g.pendente)}</div>
        </div>
      </div>
    </div>
    <div class="report-card">
      <h4>🎯 Números</h4>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;">
        <div>
          <div class="big-number-label">Vendidos</div>
          <div class="big-number">${g.vendidos}</div>
        </div>
        <div>
          <div class="big-number-label">Livres</div>
          <div class="big-number">${g.disponiveis}</div>
        </div>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width:${g.pctVendido}%"></div></div>
    </div>
    <div class="report-card">
      <h4>📋 Resumo</h4>
      <div style="display:flex;justify-content:space-between;padding:8px 0;">
        <span style="font-weight:600;">🎟️ Total de rifas</span>
        <span style="font-weight:900;">${g.totalRifas}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:8px 0;">
        <span style="font-weight:600;">🏆 Com ganhador</span>
        <span style="font-weight:900;">${g.comGanhador}</span>
      </div>
    </div>
  `;
}

function renderCompradores(c) {
  const ranking = buildBuyersRanking(APP.rifas, 20);

  if (ranking.length === 0) {
    c.innerHTML = `<div class="empty"><span class="emo">👥</span><h3>Sem compradores</h3></div>`;
    return;
  }

  c.innerHTML = `<div class="report-card"><h4>🏆 Top ${ranking.length} compradores</h4>` +
    ranking.map((x, i) => {
      const color = getAvatarColor(x.name);
      const posClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
      return `<div class="ranking-item">
        <div class="rank-pos ${posClass}">${i + 1}</div>
        <div class="avatar" style="width:38px;height:38px;font-size:15px;background:${color};">${getAvatarInitial(x.name)}</div>
        <div class="rank-info">
          <h5>${escapeHtml(x.name)}</h5>
          <p>${formatBRL(x.total)} • ${x.rifas} rifa${x.rifas > 1 ? 's' : ''}</p>
        </div>
        <div class="rank-count">${x.count}</div>
      </div>`;
    }).join('') + `</div>`;
}

function renderVendedores(c) {
  const ranking = buildSellersRanking(APP.rifas);

  if (ranking.length === 0) {
    c.innerHTML = `<div class="empty"><span class="emo">👤</span><h3>Sem vendas ainda</h3></div>`;
    return;
  }

  c.innerHTML = `<div class="report-card"><h4>🏆 Top vendedores</h4>` +
    ranking.map((x, i) => {
      const color = getAvatarColor(x.name);
      const posClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
      return `<div class="ranking-item">
        <div class="rank-pos ${posClass}">${i + 1}</div>
        <div class="avatar" style="width:38px;height:38px;font-size:15px;background:${color};">${getAvatarInitial(x.name)}</div>
        <div class="rank-info">
          <h5>${escapeHtml(x.name)}</h5>
          <p>${formatBRL(x.total)} • ${x.rifas} rifa${x.rifas > 1 ? 's' : ''}</p>
        </div>
        <div class="rank-count">${x.count} cotas</div>
      </div>`;
    }).join('') + `</div>`;
}