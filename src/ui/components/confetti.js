/* ============================================================
   Confetti — animação de comemoração
   ============================================================ */

import { APP } from '../../config/state.js';

/**
 * Dispara confetes na tela.
 * @param {'small'|'big'} intensity
 */
export function launchConfetti(intensity = 'small') {
  if (!APP.confetti) return;

  const container = document.getElementById('confetti-container');
  if (!container) return;

  const colors = [
    '#00b894','#fdcb6e','#fd79a8',
    '#6C5CE7','#0984e3','#e17055','#fbbf24'
  ];
  const count = intensity === 'big' ? 40 : 15;
  const duration = intensity === 'big' ? 2500 : 1500;

  const frag = document.createDocumentFragment();

  for (let i = 0; i < count; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.left = Math.random() * 100 + '%';
    c.style.background = colors[Math.floor(Math.random() * colors.length)];
    c.style.width = (6 + Math.random() * 8) + 'px';
    c.style.height = (6 + Math.random() * 10) + 'px';
    c.style.borderRadius = Math.random() > .5 ? '50%' : '2px';
    c.style.animationDuration = (duration + Math.random() * 1000) + 'ms';
    c.style.animationDelay = Math.random() * 300 + 'ms';
    frag.appendChild(c);
    setTimeout(() => c.remove(), duration + 1500);
  }

  container.appendChild(frag);
}