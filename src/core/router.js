/* ============================================================
   Router â€” NavegaÃ§Ã£o entre telas e abas
   ============================================================ */

import { APP } from '../config/state.js';
import { haptic } from '../utils/haptic.js';
import { setSidebarActive } from '../ui/components/sidebar.js';

export function showScreen(name, pushHistory = true) {
  haptic(8);

  // Gerencia o histÃ³rico do navegador (Back button)
  if (pushHistory) {
    if (window.history.state?.screen !== name) {
      window.history.pushState({ screen: name }, '', '#' + name);
    }
  }

  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById('screen-' + name);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const screen = document.getElementById('screen-' + name);
  if (screen) {
    screen.querySelectorAll('.nav-item').forEach(n => {
      const txt = n.textContent.trim();
      if ((name === 'home' && txt.includes('Rifas')) ||
          (name === 'sorteio' && txt.includes('Sortear')) ||
          (name === 'settings' && txt.includes('Ajustes'))) {
        n.classList.add('active');
      }
    });
  }

  setSidebarActive(name);

  if (name === 'home')     import('../ui/screens/home.screen.js').then(m => m.renderHome());
  if (name === 'sorteio')  import('../ui/screens/sort.screen.js').then(m => m.renderSorteioList());
  if (name === 'settings') import('../ui/screens/settings.screen.js').then(m => m.renderSettings());
  if (name === 'reports')  import('../ui/screens/reports.screen.js').then(m => m.renderReports());
  if (name === 'profile') import('../ui/screens/profile/profile.screen.js').then(m => m.renderProfile());
}

export function switchTab(tab) {
  haptic(5);
  APP.currentTab = tab;

  const tNum = document.getElementById('tab-numbers');
  const tSales = document.getElementById('tab-sales');
  const tInfo = document.getElementById('tab-info');
  if (tNum)   tNum.classList.toggle('active', tab === 'numbers');
  if (tSales) tSales.classList.toggle('active', tab === 'sales');
  if (tInfo)  tInfo.classList.toggle('active', tab === 'info');

  const fab = document.getElementById('fab-rifa');
  if (fab) fab.style.display = tab === 'info' ? 'none' : 'flex';

  import('../ui/screens/rifa.screen.js').then(m => m.renderRifa());
}

export function switchReportTab(tab, btn) {
  haptic(5);
  APP.currentReportTab = tab;

  document.querySelectorAll('.rtab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  import('../ui/screens/reports.screen.js').then(m => m.renderReports());
}

/* ------------------------------------------------------------
   BotÃ£o "Voltar" do celular/navegador
   ------------------------------------------------------------ */
export function initRouterHistory() {
  // Se a pÃ¡gina abriu sem histÃ³rico (ex: F5), define a home como base
  if (!window.history.state || !window.history.state.screen) {
    window.history.replaceState({ screen: 'home' }, '', '#home');
  }

  window.addEventListener('popstate', (event) => {
    const state = event.state;

    // Se tem um modal aberto, o botÃ£o voltar sÃ³ fecha o modal
    const openModal = document.querySelector('.modal-overlay.show');
    if (openModal) {
      openModal.classList.remove('show');
      // Re-empilha o estado para nÃ£o sair do app
      window.history.pushState({ screen: state?.screen || 'home' }, '', '#' + (state?.screen || 'home'));
      return;
    }

    if (state && state.screen) {
      // Se tem um estado vÃ¡lido, volta para a tela correspondente (sem push)
      showScreen(state.screen, false);
    } else {
      // Se nÃ£o tem estado (tentou voltar alÃ©m da home), forÃ§a a home
      showScreen('home', false);
    }
  });
}
