/* ============================================================
   Theme — dark mode, cor de destaque, preferências visuais
   ============================================================ */

import { APP } from '../config/state.js';
import { ACCENT_COLORS } from '../config/constants.js';
import { storage } from '../utils/storage.js';
import { haptic, setHapticEnabled } from '../utils/haptic.js';
import { toast } from '../ui/components/toast.js';

export function applyTheme() {
  document.body.classList.toggle('dark', APP.dark);

  const a = ACCENT_COLORS[APP.accentIdx] || ACCENT_COLORS[0];
  const root = document.documentElement;
  root.style.setProperty('--primary', a.primary);
  root.style.setProperty('--primary-dark', a.dark);
  root.style.setProperty('--primary-light', a.light);

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', a.primary);

  const swDark = document.getElementById('switch-dark');
  if (swDark) swDark.classList.toggle('on', APP.dark);

  const swHaptic = document.getElementById('switch-haptic');
  if (swHaptic) swHaptic.classList.toggle('on', APP.haptic);

  const swConfetti = document.getElementById('switch-confetti');
  if (swConfetti) swConfetti.classList.toggle('on', APP.confetti);

  const colors = document.querySelectorAll('#color-grid .color-opt');
  colors.forEach((el, i) => el.classList.toggle('active', i === APP.accentIdx));

  setHapticEnabled(APP.haptic);
}

export function initTheme() {
  APP.dark = storage.getBool('dark', false);
  APP.haptic = storage.getBool('haptic', true);
  APP.confetti = storage.getBool('confetti', true);
  APP.accentIdx = storage.getInt('accent', 0);
  APP.hideValues = localStorage.getItem('rc_hide_values') === '1'; // <-- CARREGA O ESTADO
  applyTheme();
}

export function toggleDark() {
  APP.dark = !APP.dark;
  haptic(15);
  applyTheme();
  storage.setBool('dark', APP.dark);
  toast(APP.dark ? '🌙 Escuro' : '☀️ Claro');
}

export function toggleHaptic() {
  APP.haptic = !APP.haptic;
  haptic(15);
  applyTheme();
  storage.setBool('haptic', APP.haptic);
  toast(APP.haptic ? '📳 Vibração on' : '📴 Vibração off');
}

export function toggleConfetti() {
  APP.confetti = !APP.confetti;
  haptic(15);
  applyTheme();
  storage.setBool('confetti', APP.confetti);
  toast(APP.confetti ? '🎉 Confetes on' : '🎈 Confetes off');
}

export function setAccent(i) {
  APP.accentIdx = i;
  haptic(15);
  applyTheme();
  storage.setInt('accent', i);
  toast('🎨 Cor atualizada!');
}

/* ------------------------------------------------------------
   Olho (Esconder/Mostrar Valores)
   ------------------------------------------------------------ */
export function toggleHideValues() {
  APP.hideValues = !APP.hideValues;
  haptic(15);
  localStorage.setItem('rc_hide_values', APP.hideValues ? '1' : '0');
  
  // Atualiza os displays visíveis
  if (window.updateMoneyDisplays) {
    window.updateMoneyDisplays();
  }
  
  toast(APP.hideValues ? '🙈 Valores ocultos' : '👁️ Valores visíveis');
}