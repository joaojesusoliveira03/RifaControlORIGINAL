import { APP } from '../../../config/state.js';
import { haptic } from '../../../utils/haptic.js';
import { escapeHtml } from '../../../utils/format.js';
import { getSoldNumbers, getPaidNumbers } from '../../../services/sales.service.js';

export function renderNumbersTab(c, r) {
  const soldNums = getSoldNumbers(r);
  const paidNums = getPaidNumbers(r);
  const winnerNum = r.winner ? r.winner.num : null;

  const frag = document.createDocumentFragment();

  // --- Contador rápido (Estilo Dashboard) ---
  const counter = document.createElement('div');
  counter.className = 'num-stats-bar';
  counter.innerHTML = `
    <div class="num-stat">
      <div class="num-stat-value text-success">${paidNums.size}</div>
      <div class="num-stat-label">Pagos</div>
    </div>
    <div class="num-stat">
      <div class="num-stat-value text-warning">${soldNums.size - paidNums.size}</div>
      <div class="num-stat-label">Pendentes</div>
    </div>
    <div class="num-stat">
      <div class="num-stat-value text-muted">${r.total - soldNums.size}</div>
      <div class="num-stat-label">Livres</div>
    </div>
    <div class="num-stat">
      <div class="num-stat-value text-primary">${r.total}</div>
      <div class="num-stat-label">Total</div>
    </div>
  `;
  frag.appendChild(counter);

  // --- Filtros ---
  const filters = document.createElement('div');
  filters.className = 'num-filters-bar';
  filters.innerHTML = `
    <button class="num-filter-btn ${APP.gridFilter === 'all' ? 'active' : ''}" data-filter="all">🎯 Todos</button>
    <button class="num-filter-btn ${APP.gridFilter === 'paid' ? 'active' : ''}" data-filter="paid">✅ Pagos</button>
    <button class="num-filter-btn ${APP.gridFilter === 'pending' ? 'active' : ''}" data-filter="pending">⏳ Pendentes</button>
    <button class="num-filter-btn ${APP.gridFilter === 'available' ? 'active' : ''}" data-filter="available">⚪ Livres</button>
    ${winnerNum ? `<button class="num-filter-btn ${APP.gridFilter === 'winner' ? 'active' : ''}" data-filter="winner">🏆 Ganhador</button>` : ''}
  `;
  filters.querySelectorAll('.num-filter-btn').forEach(b => {
    b.onclick = () => { 
      APP.gridFilter = b.dataset.filter; 
      haptic(5); 
      import('../rifa.screen.js').then(m => m.renderRifa()); 
    };
  });
  frag.appendChild(filters);

  // --- Progresso geral ---
  const pct = r.total ? Math.round(soldNums.size / r.total * 100) : 0;
  const prog = document.createElement('div');
  prog.className = 'num-progress-container';
  prog.innerHTML = `
    <div class="num-progress-header">
      <span>Progresso de vendas</span>
      <span>${pct}%</span>
    </div>
    <div class="num-progress-track">
      <div class="num-progress-fill" style="width:${pct}%"></div>
    </div>
  `;
  frag.appendChild(prog);

  // --- Banner do ganhador (se tiver) ---
  if (r.winner) {
    const dateStr = r.winner.date ? new Date(r.winner.date).toLocaleDateString('pt-BR') : '';
    const banner = document.createElement('div');
    banner.className = 'num-winner-banner';
    banner.innerHTML = `
      <div class="nwb-icon">🏆</div>
      <div class="nwb-info">
        <div class="nwb-title">Ganhador Sorteado</div>
        <div class="nwb-name">Nº ${r.winner.num} — ${escapeHtml(r.winner.name)}</div>
      </div>
      ${dateStr ? `<div class="nwb-date">${dateStr}</div>` : ''}
    `;
    frag.appendChild(banner);
  }

  // --- Grid ---
  const grid = document.createElement('div');
  grid.className = 'num-grid';
  for (let i = 1; i <= r.total; i++) {
    grid.appendChild(createNumCell(i, soldNums, paidNums, winnerNum));
  }
  grid.onclick = (e) => {
    const btn = e.target.closest('.num-cell');
    if (!btn) return;
    const num = parseInt(btn.dataset.num);
    if (num) {
      import('../rifa.screen.js').then(m => m.showNumInfo(num));
    }
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

  // Filtro visual
  if (APP.gridFilter === 'paid' && !isPaid) cls += ' hidden-filter';
  else if (APP.gridFilter === 'pending' && !isPending) cls += ' hidden-filter';
  else if (APP.gridFilter === 'available' && soldNums.has(i)) cls += ' hidden-filter';
  else if (APP.gridFilter === 'winner' && !isWinner) cls += ' hidden-filter';

  btn.className = cls;
  btn.dataset.num = i;
  
  // Adiciona o número
  btn.textContent = i;
  
  return btn;
}