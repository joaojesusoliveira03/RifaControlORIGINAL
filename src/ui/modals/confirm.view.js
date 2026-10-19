/* ============================================================
   Confirm Modal View — HTML do modal de confirmação
   ============================================================ */

export function getConfirmModalHTML() {
  return `
    <div class="modal-overlay center" id="modal-confirm">
      <div class="confirm-modal">
        <div class="confirm-icon" id="confirm-icon">⚠️</div>
        <h3 id="confirm-title">Confirmar?</h3>
        <p id="confirm-desc"></p>
        <div class="modal-actions">
          <button class="btn btn-ghost" onclick="closeConfirm()">Cancelar</button>
          <button class="btn btn-danger" id="confirm-ok" onclick="confirmOk()">Confirmar</button>
        </div>
      </div>
    </div>
  `;
}