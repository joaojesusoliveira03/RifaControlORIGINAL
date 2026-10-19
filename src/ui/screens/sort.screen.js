/* ============================================================
   Sort Screen — sorteio e ganhador
   ============================================================ */

import { APP } from '../../config/state.js';
import { RIFA_COLORS } from '../../config/constants.js';
import { escapeHtml, formatBRL } from '../../utils/format.js';
import { haptic } from '../../utils/haptic.js';
import { toast } from '../components/toast.js';
import { launchConfetti } from '../components/confetti.js';
import { closeModal } from '../components/modal.js';
import { saveRifaCloud, getRifa } from '../../services/rifas.service.js';
import { countSold } from '../../services/sales.service.js';
import { pickRandomWinner, buildWinnerRecord } from '../../services/winners.service.js';

let sortInterval = null;
let currentSortRifa = null;
let currentSortResult = null;

/* ------------------------------------------------------------
   Lista de rifas pra sortear
   ------------------------------------------------------------ */
export function renderSorteioList() {
  const c = document.getElementById('sorteio-list');
  if (!c) return;

  if (APP.rifas.length === 0) {
    c.innerHTML = `<div class="empty"><span class="emo">🎲</span><h3>Nenhuma rifa</h3></div>`;
    return;
  }

  const frag = document.createDocumentFragment();

  APP.rifas.forEach(r => {
    const sold = countSold(r);
    const hasWinner = !!r.winner;
    const c1 = RIFA_COLORS[r.colorIdx || 0].c1;
    const c2 = RIFA_COLORS[r.colorIdx || 0].c2;

    const card = document.createElement('div');
    card.className = 'rifa-card';
    card.style.marginBottom = '12px';
    card.style.setProperty('--card-color', c2);

    card.innerHTML = `
      ${hasWinner ? `<div class="card-winner">🏆 Nº ${r.winner.num}</div>` : ''}
      <div class="card-body">
        <div class="rifa-top">
          <div class="rifa-avatar" style="background:linear-gradient(135deg,${c1},${c2})">${r.emoji}</div>
          <div class="rifa-info">
            <h3>${escapeHtml(r.name)}</h3>
            <p>${sold} número${sold !== 1 ? 's' : ''} vendido${sold !== 1 ? 's' : ''}</p>
          </div>
          <div style="font-size:22px;">🎲</div>
        </div>
      </div>
    `;

    card.onclick = () => startSort(r.id);
    frag.appendChild(card);
  });

  c.innerHTML = '';
  c.appendChild(frag);
}

/* ------------------------------------------------------------
   Sortear
   ------------------------------------------------------------ */
export function startSort(id) {
  const r = getRifa(id);
  if (!r) return;

  if (r.sales.length === 0) {
    toast('⚠️ Nenhum número vendido');
    haptic(50);
    return;
  }

  currentSortRifa = r;
  currentSortResult = null;

  const modal = document.getElementById('modal-sort');
  if (modal) modal.classList.add('show');

  const normal = document.getElementById('sort-actions-normal');
  const winner = document.getElementById('sort-actions-winner');
  if (normal) normal.style.display = 'flex';
  if (winner) winner.style.display = 'none';

  rollAgain();
}

export function rollAgain() {
  if (!currentSortRifa) return;

  const nums = [...new Set(currentSortRifa.sales.map(s => s.num))];
  const display = document.getElementById('sort-display');
  const winner = document.getElementById('sort-winner');
  const btn = document.getElementById('btn-sort-again');

  if (!display || !winner || !btn) return;

  display.classList.add('rolling');
  btn.disabled = true;
  winner.textContent = '';

  const normal = document.getElementById('sort-actions-normal');
  const winnerActions = document.getElementById('sort-actions-winner');
  if (winnerActions) winnerActions.style.display = 'none';
  if (normal) normal.style.display = 'flex';

  haptic(10);

  let count = 0;
  clearInterval(sortInterval);
  sortInterval = setInterval(() => {
    display.textContent = nums[Math.floor(Math.random() * nums.length)];
    count++;
    if (count >= 20) {
      clearInterval(sortInterval);
      const final = nums[Math.floor(Math.random() * nums.length)];
      display.textContent = final;
      display.classList.remove('rolling');

      const sale = currentSortRifa.sales.find(s => s.num === final);
      winner.innerHTML = `🎉 <strong>${escapeHtml(sale.name)}</strong> ganhou!`;
      btn.disabled = false;

      currentSortResult = { num: final, name: sale.name, phone: sale.phone || '' };

      haptic([100, 50, 100, 50, 200]);
      launchConfetti('big');

      if (!currentSortRifa.winner) {
        if (normal) normal.style.display = 'none';
        if (winnerActions) winnerActions.style.display = 'flex';
      }
    }
  }, 60);
}

export async function saveSortWinner() {
  if (!currentSortRifa || !currentSortResult) return;

  currentSortRifa.winner = buildWinnerRecord(currentSortResult);

  try {
    await saveRifaCloud(currentSortRifa);
    const idx = APP.rifas.findIndex(x => x.id === currentSortRifa.id);
    if (idx >= 0) APP.rifas[idx] = currentSortRifa;

    haptic([50, 30, 50, 30, 100]);
    launchConfetti('big');
    closeSortModal();

    const { renderHome } = await import('./home.screen.js');
    renderHome();
    toast(`🏆 ${currentSortResult.name} (Nº ${currentSortResult.num})`);
  } catch (err) {
    toast('❌ Erro');
  }
}

export function closeSortModal() {
  clearInterval(sortInterval);
  const modal = document.getElementById('modal-sort');
  if (modal) modal.classList.remove('show');
  currentSortRifa = null;
  currentSortResult = null;
  haptic(5);
}