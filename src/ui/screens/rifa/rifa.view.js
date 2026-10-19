/* ============================================================
   Rifa View — HTML da tela de Rifa (Números, Compradores, Info)
   ============================================================ */

export function getRifaViewHTML() {
  return `
    <!-- RIFA -->
    <div class="screen" id="screen-rifa">
      <div class="header" id="rifa-header">
        <div class="header-content">
          <button class="back-btn" onclick="showScreen('home')">
            <svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2Z"/></svg>
          </button>
          <h1 id="rifa-title">Rifa</h1>
          <div class="sub" id="rifa-info"></div>
        </div>
      </div>
      <div class="tabs">
        <button class="tab active" id="tab-numbers" onclick="switchTabRifa('numbers')">🎯 Números</button>
        <button class="tab" id="tab-sales" onclick="switchTabRifa('sales')">👥 Compradores</button>
        <button class="tab" id="tab-info" onclick="switchTabRifa('info')">ℹ️ Info</button>
      </div>
      <div class="content" id="rifa-content"></div>
      <button class="fab" id="fab-rifa" onclick="openSaleModal()">
        <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2Z"/></svg>
      </button>
    </div>
  `;
}