/* ============================================================
   Sort Modal View — HTML do modal de sorteio
   ============================================================ */

export function getSortModalHTML() {
  return `
    <div class="modal-overlay" id="modal-sort">
      <div class="sort-modal">
        <div class="modal-handle"></div>
        <h2 style="font-size:19px;font-weight:800;margin-bottom:8px;">🎲 Sorteando...</h2>
        <div class="sort-display" id="sort-display">?</div>
        <div class="sort-winner" id="sort-winner"></div>
        <div class="sort-actions-split" id="sort-actions-normal">
          <button class="btn btn-ghost" onclick="closeSortModal()">Fechar</button>
          <button class="btn btn-accent" id="btn-sort-again" onclick="rollAgain()">🎲 De novo</button>
        </div>
        <div class="sort-actions-split" id="sort-actions-winner" style="display:none;">
          <button class="btn btn-ghost" onclick="closeSortModal()">Fechar</button>
          <button class="btn btn-save" onclick="saveSortWinner()">🏆 Salvar ganhador</button>
        </div>
      </div>
    </div>
  `;
}