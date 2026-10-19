/* ============================================================
   Layout â€” InjeÃ§Ã£o de HTML Estrutural (Sidebar, Telas)
   ============================================================ */

import { getHomeViewHTML } from './screens/home/home.view.js';
import { getRifaViewHTML } from './screens/rifa/rifa.view.js';
import { getSortViewHTML } from './screens/sort/sort.view.js';
import { getReportsViewHTML } from './screens/reports/reports.view.js';
import { getSettingsViewHTML } from './screens/settings/settings.view.js';
import { getBuyerViewHTML } from './screens/buyer/buyer.view.js';
import { getProfileViewHTML } from './screens/profile/profile.view.js';

export function getSidebarHTML() {
  return `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <img src="assets/brand/logo.png" alt="RifaControl">
        </div>
        <div class="sidebar-brand">
          <h1>RifaControl</h1>
          <p id="sidebar-user-email">carregando...</p>
        </div>
      </div>

      <nav class="sidebar-nav">
        <button class="sidebar-item active" data-screen="home" onclick="showScreen('home')">
          <svg viewBox="0 0 24 24"><path d="M20 12c0-1.1.9-2 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-1.99.9-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2Z"/></svg>
          <span>Minhas Rifas</span>
        </button>
        <button class="sidebar-item" data-screen="sorteio" onclick="showScreen('sorteio')">
          <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2ZM7.5 18c-.83 0-1.5-.67-1.5-1.5S6.67 15 7.5 15s1.5.67 1.5 1.5S8.33 18 7.5 18Zm0-9C6.67 9 6 8.33 6 7.5S6.67 6 7.5 6 9 6.67 9 7.5 8.33 9 7.5 9Zm4.5 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5Zm4.5 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5Zm0-9c-.83 0-1.5-.67-1.5-1.5S15.67 6 16.5 6 18 6.67 18 7.5 17.33 9 16.5 9Z"/></svg>
          <span>Sortear</span>
        </button>
        <button class="sidebar-item" data-screen="reports" onclick="showScreen('reports')">
          <svg viewBox="0 0 24 24"><path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8zM2 20h20v2H2z"/></svg>
          <span>RelatÃ³rios</span>
        </button>
        <button class="sidebar-item" data-screen="settings" onclick="showScreen('settings')">
          <svg viewBox="0 0 24 24"><path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97 0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1 0 .33.03.65.07.97l-2.11 1.66c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z"/></svg>
          <span>Ajustes</span>
        </button>
      </nav>

      <div class="sidebar-footer">
        <div class="sidebar-user" onclick="showScreen('profile')" style="cursor: pointer;">
          <div class="sidebar-user-avatar" id="sidebar-user-avatar">ðŸ‘¤</div>
          <div class="sidebar-user-info">
            <h5 id="sidebar-user-name">Carregando...</h5>
            <p id="sidebar-user-email-footer">-</p>
          </div>
        </div>
        <button class="sidebar-logout" onclick="signOut()" title="Sair">
          <svg viewBox="0 0 24 24"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
        </button>
      </div>
    </aside>
  `;
}

export function getScreensHTML() {
  return `
    ${getHomeViewHTML()}
    ${getRifaViewHTML()}
    ${getSortViewHTML()}
    ${getReportsViewHTML()}
    ${getSettingsViewHTML()}
    ${getBuyerViewHTML()}
    ${getProfileViewHTML()}
  `;
}
