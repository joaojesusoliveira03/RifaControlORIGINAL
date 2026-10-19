/* ============================================================
   Home View — HTML da tela inicial
   ============================================================ */

export function getHomeViewHTML() {
  return `
    <!-- HOME -->
    <div class="screen active" id="screen-home">
      <div class="content">
        <div class="header home-hero">
          <div class="hero-banner-bg" id="hero-banner-bg"></div>
          <div class="hero-overlay"></div>
          <div class="hero-decor"></div>
          <div class="hero-content">
            <div class="hero-left">
              <div style="display:flex; align-items:center; gap:10px; margin-bottom:4px;">
                <p class="hero-subtitle" id="hero-subtitle" style="margin:0;">Você tem 0 rifas ativas 🎟️</p>
                <button class="icon-btn-eye" id="btn-toggle-values" onclick="toggleHideValues()" title="Esconder/Mostrar valores">
                  <svg id="eye-icon" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                </button>
              </div>
              
              <div class="hero-actions">
                <button class="hero-btn primary" onclick="openRifaModal()">
                  <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2Z"/></svg>
                  <span>Nova Rifa</span>
                </button>
              </div>

              <p class="hero-date" id="hero-date">16 de outubro • 15:07</p>
            </div>
            <div class="hero-right">
              <div class="stats-floating" id="stats-grid"></div>
            </div>
          </div>
          <div class="sync-status" id="sync-status">
            <span class="sync-dot"></span>
            <span id="sync-text">Sincronizado</span>
          </div>
        </div>
        <div class="search-wrap">
          <div class="search-box">
            <svg class="s-icon" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5Zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14Z"/></svg>
            <input type="text" id="search-input" placeholder="Buscar..." autocomplete="off">
            <button class="clear-btn" id="clear-search" onclick="clearSearch()">✕</button>
          </div>
        </div>
        <div id="home-rifas"></div>
      </div>
      <div class="bottom-nav">
        <button class="nav-item active" onclick="showScreen('home')">
          <svg viewBox="0 0 24 24"><path d="M20 12c0-1.1.9-2 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-1.99.9-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2Z"/></svg>
          Rifas
        </button>
        <button class="nav-item" onclick="showScreen('sorteio')">
          <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2ZM7.5 18c-.83 0-1.5-.67-1.5-1.5S6.67 15 7.5 15s1.5.67 1.5 1.5S8.33 18 7.5 18Zm0-9C6.67 9 6 8.33 6 7.5S6.67 6 7.5 6 9 6.67 9 7.5 8.33 9 7.5 9Zm4.5 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5Zm4.5 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5Zm0-9c-.83 0-1.5-.67-1.5-1.5S15.67 6 16.5 6 18 6.67 18 7.5 17.33 9 16.5 9Z"/></svg>
          Sortear
        </button>
        <button class="nav-item" onclick="showScreen('settings')">
          <svg viewBox="0 0 24 24"><path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97 0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1 0 .33.03.65.07.97l-2.11 1.66c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z"/></svg>
          Ajustes
        </button>
      </div>
    </div>
  `;
}