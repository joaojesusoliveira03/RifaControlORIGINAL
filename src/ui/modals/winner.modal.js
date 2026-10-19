/* ============================================================
   Winner Modal — marcar ganhador manualmente
   ============================================================ */

import { APP } from '../../config/state.js';
import { haptic } from '../../utils/haptic.js';
import { toast } from '../components/toast.js';
import { launchConfetti } from '../components/confetti.js';
import { showConfirm } from '../components/confirm.js';
import { closeModal } from '../components/modal.js';
import { saveRifaCloud } from '../../services/rifas.service.js';
import { getSoldNumbers } from '../../services/sales.service.js';
import { buildWinnerRecord, validateWinnerNumber } from '../../services/winners.service.js';

/* ------------------------------------------------------------
   Abrir modal
   ------------------------------------------------------------ */
export function openWinnerModal() {
  haptic(10);
  const r = APP.currentRifa;
  if (!r) return;

  if (r.sales.length === 0) {
    toast('⚠️ Nenhum número vendido');
    haptic(50);
    return;
  }

  const input = document.getElementById('in-winner-num');
  if (input) input.value = '';

  const soldNums = [...getSoldNumbers(r)].sort((a, b) => a - b);
  const picker = document.getElementById('winner-num-picker');
  if (!picker) return;

  const frag = document.createDocumentFragment();

  soldNums.forEach(n => {
    const b = document.createElement('button');
    b.style.cssText = 'aspect-ratio:1;border-radius:10px;border:2px solid var(--border);background:var(--card2);color:var(--muted);font-size:12px;font-weight:800;cursor:pointer;font-family:inherit;';
    b.textContent = n;
    b.onclick = () => {
      if (input) input.value = n;
      picker.querySelectorAll('button').forEach(x => {
        x.style.background = 'var(--card2)';
        x.style.color = 'var(--muted)';
        x.style.borderColor = 'var(--border)';
      });
      b.style.background = 'var(--primary)';
      b.style.color = '#fff';
      b.style.borderColor = 'var(--primary)';
    };
    frag.appendChild(b);
  });

  picker.innerHTML = '';
  picker.appendChild(frag);

  const modal = document.getElementById('modal-winner');
  if (modal) modal.classList.add('show');
}

/* ------------------------------------------------------------
   Confirmar ganhador
   ------------------------------------------------------------ */
export async function confirmWinner() {
  const num = parseInt(document.getElementById('in-winner-num')?.value);
  const r = APP.currentRifa;

  const validation = validateWinnerNumber(r, num);
  if (!validation.ok) {
    toast('⚠️ ' + validation.error);
    haptic(50);
    return;
  }

  const sale = validation.sale;
  r.winner = buildWinnerRecord({ num, name: sale.name, phone: sale.phone });

  try {
    await saveRifaCloud(r);
    const idx = APP.rifas.findIndex(x => x.id === r.id);
    if (idx >= 0) APP.rifas[idx] = r;

    closeModal('modal-winner');

    const { renderRifa } = await import('../screens/rifa.screen.js');
    const { renderHome } = await import('../screens/home.screen.js');
    renderRifa();
    renderHome();

    haptic([50, 30, 50, 30, 100]);
    launchConfetti('big');
    toast(`🏆 ${sale.name} (Nº ${num})`);
  } catch (err) {
    toast('❌ Erro');
  }
}

/* ------------------------------------------------------------
   Remover ganhador
   ------------------------------------------------------------ */
export function removeWinner() {
  const r = APP.currentRifa;
  if (!r || !r.winner) return;

  showConfirm('Remover ganhador?', `Nº ${r.winner.num} - ${r.winner.name}`, 'danger', async () => {
    r.winner = null;
    try {
      await saveRifaCloud(r);
      const idx = APP.rifas.findIndex(x => x.id === r.id);
      if (idx >= 0) APP.rifas[idx] = r;

      const { renderRifa } = await import('../screens/rifa.screen.js');
      const { renderHome } = await import('../screens/home.screen.js');
      renderRifa();
      renderHome();
      toast('❌ Removido');
    } catch (err) {
      toast('❌ Erro');
    }
  });
}

/* ------------------------------------------------------------
   Alias exportado pra globals
   ------------------------------------------------------------ */
export function showNumInfo(num) {
  import('../screens/rifa.screen.js').then(m => m.showNumInfo(num));
}