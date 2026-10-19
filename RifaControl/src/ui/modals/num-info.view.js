/* ============================================================
   Num Info Modal View — HTML do modal de detalhes do número
   ============================================================ */

export function getNumInfoModalHTML() {
  return `
    <div class="modal-overlay center" id="modal-num-info">
      <div class="confirm-modal">
        <div class="confirm-icon info" id="num-info-icon">🎯</div>
        <h3 id="num-info-title">Número</h3>
        <p id="num-info-desc"></p>
        <div class="modal-actions" style="flex-direction:column;">
          <button class="btn btn-primary" id="num-info-buyer-btn" onclick="goToBuyerFromNum()" style="display:none;">👤 Ver comprador</button>
          <button class="btn btn-ghost" onclick="closeModal('modal-num-info')">Fechar</button>
        </div>
      </div>
    </div>
  `;
}