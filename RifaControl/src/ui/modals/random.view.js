/* ============================================================
   Random Modal View — HTML do modal de números aleatórios
   ============================================================ */

export function getRandomModalHTML() {
  return `
    <div class="modal-overlay center" id="modal-random">
      <div class="confirm-modal">
        <div class="confirm-icon info">🎲</div>
        <h3>Números aleatórios</h3>
        <p style="margin-bottom:16px;">Quantos números aleatórios você quer?</p>
        <div class="field" style="text-align:left;">
          <input id="in-random-count" type="number" min="1" placeholder="Ex: 5" inputmode="numeric" style="text-align:center;font-size:22px;font-weight:900;">
          <p class="field-hint" id="random-hint" style="text-align:center;"></p>
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" onclick="closeModal('modal-random')">Cancelar</button>
          <button class="btn btn-primary" onclick="confirmRandomNumbers()">🎲 Sortear</button>
        </div>
      </div>
    </div>
  `;
}