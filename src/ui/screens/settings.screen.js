/* ============================================================
   Settings Screen — ajustes
   ============================================================ */

import { APP } from '../../config/state.js';
import { ACCENT_COLORS } from '../../config/constants.js';
import { setAccent } from '../../core/theme.js';
import { haptic } from '../../utils/haptic.js';
import { toast } from '../components/toast.js';
import { reloadRifas } from '../../services/rifas.service.js';
import { setSyncStatus } from '../../core/auth.js';

function renderAccentGrid() {
  const g = document.getElementById('color-grid');
  if (!g) return;
  const frag = document.createDocumentFragment();

  ACCENT_COLORS.forEach((c, i) => {
    const b = document.createElement('button');
    b.className = 'color-opt' + (i === APP.accentIdx ? ' active' : '');
    b.style.background = c.primary;
    b.onclick = () => setAccent(i);
    frag.appendChild(b);
  });

  g.innerHTML = '';
  g.appendChild(frag);
}

export function renderSettings() {
  renderAccentGrid();

  const swDark = document.getElementById('switch-dark');
  if (swDark) swDark.classList.toggle('on', APP.dark);

  const swHaptic = document.getElementById('switch-haptic');
  if (swHaptic) swHaptic.classList.toggle('on', APP.haptic);

  const swConfetti = document.getElementById('switch-confetti');
  if (swConfetti) swConfetti.classList.toggle('on', APP.confetti);
}

export async function manualSync() {
  haptic(10);
  setSyncStatus('syncing', 'Sincronizando...');
  try {
    await reloadRifas();
    const { renderHome } = await import('./home.screen.js');
    renderHome();
    setSyncStatus('', 'Sincronizado');
    toast('🔄 Sincronizado!');
  } catch (err) {
    setSyncStatus('error', 'Erro');
    toast('❌ Erro ao sincronizar');
  }
}

export function exportData() {
  haptic(10);
  const data = {
    app: 'RifaControl',
    version: 8,
    exportedAt: new Date().toISOString(),
    rifas: APP.rifas
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rifacontrol-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast('📤 Exportado!');
}