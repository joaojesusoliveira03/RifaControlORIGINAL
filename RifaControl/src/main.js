import { initTheme } from './core/theme.js';
import { initAuth } from './core/auth.js';
import { initModalOverlayDismiss } from './ui/components/modal.js';
import { initRouterHistory } from './core/router.js';
import { setSyncStatus } from './core/auth.js';
import { toast } from './ui/components/toast.js';
import { reloadRifas } from './services/rifas.service.js';
import { APP } from './config/state.js';

// HTML Base
import { getSidebarHTML, getScreensHTML } from './ui/layout.js';
import { getModalsHTML } from './ui/modals/modals.view.js';

// ⚠️ Importa globals (expõe tudo em window) — não remova
import './ui/globals.js';

/* ------------------------------------------------------------
   Atualiza todos os valores da tela ao clicar no olho
   ------------------------------------------------------------ */
window.updateMoneyDisplays = async () => {
  const { renderHome } = await import('./ui/screens/home.screen.js');
  const { renderReports } = await import('./ui/screens/reports.screen.js');
  const { renderRifa } = await import('./ui/screens/rifa.screen.js');
  
  // Atualiza a Home
  renderHome();
  
  // Atualiza a tela atual se estiver aberta
  if (document.getElementById('screen-reports')?.classList.contains('active')) {
    renderReports();
  }
  if (document.getElementById('screen-rifa')?.classList.contains('active')) {
    renderRifa();
  }
  
  // Atualiza o ícone do olho
  const eyeIcon = document.getElementById('eye-icon');
  if (eyeIcon) {
    if (APP.hideValues) {
      eyeIcon.innerHTML = '<path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>';
    } else {
      eyeIcon.innerHTML = '<path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>';
    }
  }
};

async function init() {
  console.log('🚀 RifaControl modular iniciando...');

  // 1. Injeta o layout HTML
  const sidebarContainer = document.getElementById('sidebar-container');
  if (sidebarContainer) sidebarContainer.innerHTML = getSidebarHTML();

  const screensContainer = document.getElementById('app-screens');
  if (screensContainer) screensContainer.innerHTML = getScreensHTML();

  const modalsContainer = document.getElementById('modals-container');
  if (modalsContainer) modalsContainer.innerHTML = getModalsHTML();

  // 2. Tema
  initTheme();

  // 3. Overlays de modal
  initModalOverlayDismiss();

  // 4. Ativa a navegação
  initRouterHistory();

  // 5. Listeners de conectividade
  window.addEventListener('online', () => {
    setSyncStatus('', 'Online');
    toast('🟢 Online');
    if (APP.user) reloadRifas().catch(console.error);
  });
  window.addEventListener('offline', () => {
    setSyncStatus('error', 'Sem conexão');
    toast('🔴 Sem internet');
  });

  // 6. Enter nos campos de auth
  document.addEventListener('keydown', (e) => {
    if (e.target.id === 'in-auth-pass' && e.key === 'Enter') window.handleAuth();
    if (e.target.id === 'in-forgot-email' && e.key === 'Enter') window.sendForgotPassword();
    if (e.target.id === 'in-reset-pass2' && e.key === 'Enter') window.updatePassword();
  });

  // 7. Auth
  await initAuth();

  // 8. Inicializa o ícone do olho (se hideValues estiver ativo)
  if (APP.hideValues) {
    window.updateMoneyDisplays();
  }

  console.log('✅ RifaControl modular pronto');
}

init();