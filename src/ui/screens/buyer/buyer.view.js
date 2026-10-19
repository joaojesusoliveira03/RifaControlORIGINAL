/* ============================================================
   Buyer View — HTML da tela de Comprador Específico
   ============================================================ */

export function getBuyerViewHTML() {
  return `
    <!-- COMPRADOR -->
    <div class="screen" id="screen-buyer">
      <div class="header" style="padding-bottom:22px;">
        <div class="header-content">
          <button class="back-btn" onclick="closeBuyer()">
            <svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2Z"/></svg>
          </button>
          <h1>👤 Comprador</h1>
          <div class="sub">Detalhes completos</div>
        </div>
      </div>
      <div class="content" id="buyer-content"></div>
    </div>
  `;
}