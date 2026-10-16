/* ============================================================
   Theme — dark mode, cor de destaque, preferências visuais
   ============================================================ */

import { APP } from '../config/state.js';
import { ACCENT_COLORS } from '../config/constants.js';
import { storage } from '../utils/storage.js';
import { haptic, setHapticEnabled } from '../utils/haptic.js';
import { toast } from '../ui/components/toast.js';

/**
 * Aplica dark mode + accent + switches no DOM.
 * Deve ser chamada sempre que APP.dark / APP.accentIdx / APP.haptic / APP.confetti mudar.
 */
export function applyTheme() {
  // Dark mode
  document.body.classList.toggle('dark', APP.dark);

  // Cor de destaque
  const a = ACCENT_COLORS[APP.accentIdx] || ACCENT_COLORS[0];
  const root = document.documentElement;
  root.style.setProperty('--primary', a.primary);
  root.style.setProperty('--primary-dark', a.dark);
  root.style.setProperty('--primary-light', a.light);

  // Meta theme-color (barra do navegador no mobile)
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', a.primary);

  // Switches da tela de settings
  const swDark = document.getElementById('switch-dark');
  if (swDark) swDark.classList.toggle('on', APP.dark);

  const swHaptic = document.getElementById('switch-haptic');
  if (swHaptic) swHaptic.classList.toggle('on', APP.haptic);

  const swConfetti = document.getElementById('switch-confetti');
  if (swConfetti) swConfetti.classList.toggle('on', APP.confetti);

  // Grid de cores (marca a ativa)
  const colors = document.querySelectorAll('#color-grid .color-opt');
  colors.forEach((el, i) => el.classList.toggle('active', i === APP.accentIdx));

  // Sincroniza módulo de haptic com o estado
  setHapticEnabled(APP.haptic);
}

/**
 * Inicializa preferências a partir do storage.
 * Deve ser chamada UMA VEZ no boot.
 */
export function initTheme() {
  APP.dark = storage.getBool('dark', false);
  APP.haptic = storage.getBool('haptic', true);
  APP.confetti = storage.getBool('confetti', true);
  APP.accentIdx = storage.getInt('accent', 0);
  applyTheme();
}

/**
 * Alterna dark mode e persiste.
 */
export function toggleDark() {
  APP.dark = !APP.dark;
  haptic(15);
  applyTheme();
  storage.setBool('dark', APP.dark);
  toast(APP.dark ? '🌙 Escuro' : '☀️ Claro');
}

/**
 * Alterna vibração e persiste.
 */
export function toggleHaptic() {
  APP.haptic = !APP.haptic;
  haptic(15);
  applyTheme();
  storage.setBool('haptic', APP.haptic);
  toast(APP.haptic ? '📳 Vibração on' : '📴 Vibração off');
}

/**
 * Alterna confetes e persiste.
 */
export function toggleConfetti() {
  APP.confetti = !APP.confetti;
  haptic(15);
  applyTheme();
  storage.setBool('confetti', APP.confetti);
  toast(APP.confetti ? '🎉 Confetes on' : '🎈 Confetes off');
}

/**
 * Define cor de destaque pelo índice.
 */
export function setAccent(i) {
  APP.accentIdx = i;
  haptic(15);
  applyTheme();
  storage.setInt('accent', i);
  toast('🎨 Cor atualizada!');
}