/* ============================================================
   Winner Modal View — HTML do modal de marcar ganhador
   ============================================================ */

export function getWinnerModalHTML() {
  return `
    <div class="modal-overlay" id="modal-winner">
      <div class="modal">
        <div class="modal-handle"></div>
        <h2><span class="emo gold">🏆</span>Marcar Ganhador</h2>

        <div class="field">
          <label>Número ganhador</label>
          <input id="in-winner-num" type="number" min="1" placeholder="Ex: 42" inputmode="numeric">
        </div>

        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;max-height:200px;overflow-y:auto;padding:4px;" id="winner-num-picker"></div>

        <div class="modal-actions" style="margin-top:16px;">
          <button class="btn btn-ghost" onclick="closeModal('modal-winner')">Cancelar</button>
          <button class="btn btn-gold" onclick="confirmWinner()">🏆 Confirmar</button>
        </div>
      </div>
    </div>
  `;
}