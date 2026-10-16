/* ============================================================
   Home Screen — lista de rifas, stats, busca
   ============================================================ */

import { APP } from '../../config/state.js';
import { RIFA_COLORS } from '../../config/constants.js';
import { escapeHtml, formatBRL } from '../../utils/format.js';
import { haptic } from '../../utils/haptic.js';
import { debounce } from '../../utils/dom.js';
import { calcArrecadado, calcPendente, countSold } from '../../services/sales.service.js';
import { getRifa } from '../../services/rifas.service.js';
import { openListModal } from '../modals/list.modal.js';
import { openRifa } from './rifa.screen.js';
import { toast } from '../components/toast.js';

/* ------------------------------------------------------------
   Greeting
   ------------------------------------------------------------ */
function updateGreeting() {
  const h = new Date().getHours();
  let g = 'Boa tarde! 🌤️';
  if (h < 12) g = 'Bom dia! ☀️';
  else if (h >= 18) g = 'Boa noite! 🌙';
  const el = document.getElementById('home-greeting');
  if (el) el.textContent = g;
}

/* ------------------------------------------------------------
   Stats (arrecadado, pendente)
   ------------------------------------------------------------ */
function renderStats() {
  let arrecadado = 0, pendente = 0, vendidos = 0;

  APP.rifas.forEach(r => {
    arrecadado += calcArrecadado(r);
    pendente += calcPendente(r);
    vendidos += countSold(r);
  });

  const el = document.getElementById('stats-grid');
  if (!el) return;

  el.innerHTML = `
    <div class="stat-card">
      <div class="stat-head">
        <div class="stat-label">Arrecadado</div>
        <div class="stat-icon money">💰</div>
      </div>
      <div class="stat-value">${formatBRL(arrecadado)}</div>
      <div class="stat-sub">${vendidos} números vendidos</div>
    </div>
    <div class="stat-card">
      <div class="stat-head">
        <div class="stat-label">Pendente</div>
        <div class="stat-icon pending">⏳</div>
      </div>
      <div class="stat-value">${formatBRL(pendente)}</div>
      <div class="stat-sub">${APP.rifas.length} rifa${APP.rifas.length !== 1 ? 's' : ''}</div>
    </div>
  `;
}

/* ------------------------------------------------------------
   Card de rifa
   ------------------------------------------------------------ */
function createRifaCard(r) {
  const c1 = RIFA_COLORS[r.colorIdx || 0].c1;
  const c2 = RIFA_COLORS[r.colorIdx || 0].c2;
  const sold = countSold(r);
  const pct = r.total ? Math.round(sold / r.total * 100) : 0;
  const arrecadado = calcArrecadado(r);
  const pendente = calcPendente(r);
  const hasWinner = !!r.winner;

  const wrap = document.createElement('div');
  wrap.className = 'swipe-wrap';
  wrap.dataset.rifaId = r.id;
  wrap.dataset.owner = (!r.isShared).toString();

  const winnerHtml = hasWinner
    ? `<div class="card-winner">🏆 Nº ${r.winner.num} — ${escapeHtml(r.winner.name)}</div>`
    : '';
  const imageHtml = r.image
    ? `<div class="card-image"><img src="${r.image}" loading="lazy"></div>`
    : '';
  const sharedBadge = r.isShared
    ? `<div class="card-shared-badge">👥 Compartilhada</div>`
    : '';

  let priceLine = `R$ ${r.price.toFixed(2)} por número`;
  if (r.promo_enabled) {
    priceLine = `R$ ${r.price.toFixed(2)} <span class="promo-tag">🎁 ${r.promo_quantity} por R$ ${r.promo_price.toFixed(2)}</span>`;
  }

  let meta = `<span class="mini-badge info">🎯 ${sold}/${r.total}</span>`;
  if (arrecadado > 0) meta += `<span class="mini-badge success">💰 ${formatBRL(arrecadado)}</span>`;
  if (pendente > 0) meta += `<span class="mini-badge warn">⏳ ${formatBRL(pendente)}</span>`;

  wrap.innerHTML = `
    <div class="swipe-bg">
      <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
    </div>
    <div class="rifa-card" style="--card-color:${c2}">
      ${winnerHtml}${sharedBadge}${imageHtml}
      <div class="card-body">
        <button class="card-list-btn">
          <svg viewBox="0 0 24 24"><path d="M3 5h2V3c-1.1 0-2 .9-2 2Zm0 8h2v-2H3v2Zm4 8h2v-2H7v2ZM3 9h2V7H3v2Zm10-6h-2v2h2V3Zm6 0v2h2c0-1.1-.9-2-2-2ZM5 21v-2H3c0 1.1.9 2 2 2Zm-2-4h2v-2H3v2ZM9 3H7v2h2V3Zm2 18h2v-2h-2v2Zm8-8h2v-2h-2v2Zm0 8c1.1 0 2-.9 2-2h-2v2Zm0-12h2V7h-2v2Zm0 8h2v-2h-2v2Zm-4 4h2v-2h-2v2Zm0-16h2V3h-2v2ZM7 17h10V7H7v10Zm2-8h6v6H9V9Z"/></svg>
        </button>
        <div class="rifa-top">
          <div class="rifa-avatar" style="background:linear-gradient(135deg,${c1},${c2})">${r.emoji}</div>
          <div class="rifa-info">
            <h3>${escapeHtml(r.name)}</h3>
            <p>${escapeHtml(r.prize)}</p>
            <div class="rifa-price-line">${priceLine}</div>
          </div>
        </div>
        <div class="rifa-progress"><div class="rifa-progress-fill" style="width:${pct}%"></div></div>
        <div class="rifa-meta">${meta}</div>
      </div>
    </div>
  `;

  const card = wrap.querySelector('.rifa-card');
  card.onclick = (e) => {
    if (e.target.closest('.card-list-btn')) {
      e.stopPropagation();
      openListModal(r.id);
      return;
    }
    openRifa(r.id);
  };

  return wrap;
}

/* ------------------------------------------------------------
   Busca
   ------------------------------------------------------------ */
function renderSearchResults(q) {
  const c = document.getElementById('home-rifas');
  if (!c) return;

  const results = { rifas: [], compradores: [], numeros: [] };

  APP.rifas.forEach(r => {
    if (r.name.toLowerCase().includes(q) || r.prize.toLowerCase().includes(q)) {
      results.rifas.push(r);
    }
    r.sales.forEach(s => {
      if (s.name.toLowerCase().includes(q)) results.compradores.push({ rifa: r, sale: s });
      if (String(s.num).includes(q)) results.numeros.push({ rifa: r, sale: s });
    });
  });

  const total = results.rifas.length + results.compradores.length + results.numeros.length;

  if (total === 0) {
    c.innerHTML = `<div class="empty"><span class="emo">🔍</span><h3>Nada encontrado</h3><p>Nenhum resultado para "<b>${escapeHtml(q)}</b>"</p></div>`;
    return;
  }

  const frag = document.createDocumentFragment();

  if (results.rifas.length > 0) {
    const sec = document.createElement('div');
    sec.className = 'section-title';
    sec.innerHTML = `<h2>🎟️ Rifas <span class="count">${results.rifas.length}</span></h2>`;
    frag.appendChild(sec);
    results.rifas.forEach(r => frag.appendChild(createRifaCard(r)));
  }

  if (results.compradores.length > 0) {
    const sec = document.createElement('div');
    sec.className = 'section-title';
    sec.style.marginTop = '16px';
    sec.innerHTML = `<h2>👤 Compradores <span class="count">${results.compradores.length}</span></h2>`;
    frag.appendChild(sec);

    const container = document.createElement('div');
    container.innerHTML = results.compradores.slice(0, 30).map(x => {
      const color = '#00b894'; // fallback simples
      return `<div class="search-result-item" data-action="buyer" data-name="${escapeHtml(x.sale.name)}" data-rifa="${x.rifa.id}" style="background:var(--card);border-radius:16px;padding:12px;margin-bottom:8px;display:flex;align-items:center;gap:12px;cursor:pointer;border:1px solid var(--border);">
        <div class="avatar" style="width:40px;height:40px;font-size:16px;background:${color};">${(x.sale.name[0] || '?').toUpperCase()}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:14px;font-weight:800;">${escapeHtml(x.sale.name)}</div>
          <div style="font-size:11px;color:var(--muted);">Nº ${x.sale.num} • ${escapeHtml(x.rifa.name)}</div>
        </div>
      </div>`;
    }).join('');
    frag.appendChild(container);
  }

  c.innerHTML = '';
  c.appendChild(frag);

  c.querySelectorAll('[data-action="buyer"]').forEach(el => {
    el.onclick = async () => {
      const { openBuyer } = await import('./buyer.screen.js');
      openBuyer(el.dataset.name, el.dataset.rifa);
    };
  });
}

/* ------------------------------------------------------------
   Render principal
   ------------------------------------------------------------ */
export function renderHome() {
  updateGreeting();
  renderStats();

  const c = document.getElementById('home-rifas');
  if (!c) return;

  const q = (APP.search || '').toLowerCase().trim();
  if (q.length > 0) {
    renderSearchResults(q);
    return;
  }

  if (APP.rifas.length === 0) {
    c.innerHTML = `<div class="empty"><span class="emo">🎟️</span><h3>Nenhuma rifa ainda</h3><p>Toque em <b>Nova Rifa</b> acima<br>para criar sua primeira!</p></div>`;
    return;
  }

  const minhas = APP.rifas.filter(r => !r.isShared);
  const compartilhadas = APP.rifas.filter(r => r.isShared);

  const frag = document.createDocumentFragment();

  if (minhas.length > 0) {
    const title = document.createElement('div');
    title.className = 'section-title';
    title.innerHTML = `<h2>🎯 Minhas Rifas <span class="count">${minhas.length}</span></h2>`;
    frag.appendChild(title);
    minhas.forEach(r => frag.appendChild(createRifaCard(r)));
  }

  if (compartilhadas.length > 0) {
    const title = document.createElement('div');
    title.className = 'section-title';
    title.style.marginTop = '20px';
    title.innerHTML = `<h2>👥 Compartilhadas comigo <span class="count">${compartilhadas.length}</span></h2>`;
    frag.appendChild(title);
    compartilhadas.forEach(r => frag.appendChild(createRifaCard(r)));
  }

  c.innerHTML = '';
  c.appendChild(frag);
}

/* ------------------------------------------------------------
   Busca (listener) — chamado pelo main.js no boot
   ------------------------------------------------------------ */
export function initSearchInput() {
  const input = document.getElementById('search-input');
  const clearBtn = document.getElementById('clear-search');
  if (!input) return;

  const run = debounce(() => renderHome(), 280);

  input.addEventListener('input', e => {
    APP.search = e.target.value;
    if (clearBtn) clearBtn.classList.toggle('show', APP.search.length > 0);
    run();
  });
}

export function clearSearch() {
  const input = document.getElementById('search-input');
  const clearBtn = document.getElementById('clear-search');
  if (input) input.value = '';
  APP.search = '';
  if (clearBtn) clearBtn.classList.remove('show');
  haptic(5);
  renderHome();
}