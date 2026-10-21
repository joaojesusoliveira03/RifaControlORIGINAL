/* ============================================================
   Edit Promo Modal View — HTML do modal de editar promoção
   ============================================================ */

export function getEditPromoModalHTML() {
  return `
    <div class="modal-overlay" id="modal-edit-promo">
      <div class="modal">
        <div class="modal-handle"></div>
        <h2><span class="emo">🎁</span>Editar Promoção</h2>
        
        <div class="promo-box" id="edit-promo-box">
          <div class="promo-header">
            <div class="promo-header-left">
              <div class="promo-icon">🎁</div>
              <div>
                <div class="promo-title">Ativar promoção</div>
                <div class="promo-subtitle">Desconto por quantidade</div>
              </div>
            </div>
            <div class="switch small on" id="edit-promo-switch" onclick="toggleEditPromo()"></div>
          </div>
          
          <div class="promo-content">
            <div class="promo-row">
              <span class="promo-row-label">Leve</span>
              <input type="number" id="edit-promo-qty" min="2" value="10" inputmode="numeric" oninput="updateEditPromoSummary()">
              <span class="promo-row-label">por apenas</span>
              <span class="promo-row-label">R$</span>
              <input type="number" id="edit-promo-price" min="0.01" step="0.01" value="10" class="money" inputmode="decimal" oninput="updateEditPromoSummary()">
            </div>
            <div class="promo-summary" id="edit-promo-summary"></div>
          </div>
        </div>

        <div class="modal-actions" style="margin-top:16px;">
          <button class="btn btn-ghost" onclick="closeModal('modal-edit-promo')">Cancelar</button>
          <button class="btn btn-primary" onclick="saveEditPromo()">Salvar Promoção</button>
        </div>
      </div>
    </div>
  `;
}