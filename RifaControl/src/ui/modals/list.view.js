/* ============================================================
   List Modal View — HTML do modal de gerar lista
   ============================================================ */

export function getListModalHTML() {
  return `
    <div class="modal-overlay" id="modal-list">
      <div class="list-modal">
        <div class="modal-handle"></div>
        <h2><span class="emo">📋</span>Lista</h2>
        <div class="list-stats" id="list-stats"></div>
        <div class="list-preview" id="list-preview"></div>
        <div class="modal-actions">
          <button class="btn btn-ghost" onclick="closeModal('modal-list')">Fechar</button>
          <button class="btn btn-primary" onclick="copyList()">📋 Copiar</button>
        </div>
      </div>
    </div>
  `;
}