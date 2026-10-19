/* ============================================================
   Sidebar — navegação lateral (só aparece no desktop)
   ============================================================ */

import { APP } from '../../config/state.js';

/**
 * Marca o item da sidebar correspondente à tela atual.
 */
export function setSidebarActive(screenName) {
  const items = document.querySelectorAll('.sidebar-item');
  items.forEach(el => {
    el.classList.toggle('active', el.dataset.screen === screenName);
  });
}

/**
 * Atualiza dados do usuário na sidebar (nome, email, avatar).
 */
export function updateSidebarUser() {
  if (!APP.user) return;

  const name = APP.profile?.name || APP.user.email;
  const email = APP.user.email;
  const initial = (name || email)[0].toUpperCase();

  const elName = document.getElementById('sidebar-user-name');
  const elEmailFooter = document.getElementById('sidebar-user-email-footer');
  const elAvatar = document.getElementById('sidebar-user-avatar');

  if (elName) elName.textContent = name;
  
  // Aqui está a mudança: em vez do email, mostramos "Ver perfil"
  if (elEmailFooter) {
    elEmailFooter.textContent = 'Ver perfil';
  }
  
  if (elAvatar) {
    elAvatar.textContent = initial;
  }
}