/* ============================================================
   Sidebar — navegação lateral (só aparece no desktop)
   ============================================================ */

import { APP } from '../../config/state.js';

/**
 * Marca o item da sidebar correspondente à tela atual.
 * Chamado pelo router sempre que troca de tela.
 */
export function setSidebarActive(screenName) {
  const items = document.querySelectorAll('.sidebar-item');
  items.forEach(el => {
    el.classList.toggle('active', el.dataset.screen === screenName);
  });
}

/**
 * Atualiza dados do usuário na sidebar (nome, email, avatar).
 * Chamado depois do login.
 */
export function updateSidebarUser() {
  if (!APP.user) return;

  const name = APP.profile?.name || APP.user.email;
  const email = APP.user.email;
  const initial = (name || email)[0].toUpperCase();

  const elName = document.getElementById('sidebar-user-name');
  const elEmail = document.getElementById('sidebar-user-email-footer');
  const elEmailHeader = document.getElementById('sidebar-user-email');
  const elAvatar = document.getElementById('sidebar-user-avatar');

  if (elName) elName.textContent = name;
  if (elEmail) elEmail.textContent = email;
  if (elEmailHeader) elEmailHeader.textContent = email;
  if (elAvatar) elAvatar.textContent = initial;
}