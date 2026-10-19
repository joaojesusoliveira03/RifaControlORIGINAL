/* ============================================================
   Sale Modal View — Novo Visual Premium
   ============================================================ */

export function getSaleModalHTML() {
  return `
    <div class="modal-overlay" id="modal-sale">
      <div class="modal">
        <div class="modal-handle"></div>
        
        <div class="modal-header-custom">
          <h2><span class="emo">👤</span>Nova Venda</h2>
          <button class="icon-btn close-btn" onclick="closeModal('modal-sale')">✕</button>
        </div>

        <div class="modal-body-scroll">
          <div class="field">
            <label>Nome do comprador</label>
            <input id="in-sale-name" placeholder="Ex: Maria Silva" maxlength="40">
          </div>

          <div class="field">
            <label>Telefone (opcional)</label>
            <input id="in-sale-phone" placeholder="(11) 99999-9999" maxlength="15" inputmode="tel" oninput="maskPhone(this)">
          </div>

          <div class="field">
            <label>Número(s) da rifa</label>
            <div style="display:flex; gap:8px;">
              <input id="in-sale-nums" placeholder="Ex: 5, 12, 34" inputmode="numeric" oninput="updateSaleCalc()" style="flex:1; min-width:0;">
              <button class="btn btn-ghost" type="button" onclick="openRandomNumbersModal()" style="flex:0 0 auto; width:52px; padding:0; display:flex; align-items:center; justify-content:center; font-size:22px; border-radius:14px;" title="Números aleatórios">🎲</button>
            </div>
            <p class="field-hint">Separe múltiplos por vírgula</p>
            <div class="sale-calc" id="sale-calc"></div>
          </div>

          <div class="field">
            <label>Status do Pagamento</label>
            <div style="display:flex; gap:8px;">
              <button class="btn btn-ghost" id="pay-paid" onclick="selectPay('paid')" style="flex:1; padding:12px; border:2px solid var(--border);">Pago</button>
              <button class="btn btn-ghost" id="pay-pending" onclick="selectPay('pending')" style="flex:1; padding:12px; border:2px solid var(--primary); color:var(--primary); background:rgba(0,184,148,.1);">Pendente</button>
            </div>
          </div>
        </div>

        <div class="modal-footer-custom">
          <button class="btn btn-ghost" onclick="closeModal('modal-sale')">Cancelar</button>
          <button class="btn btn-primary" onclick="saveSale()">Registrar Venda</button>
        </div>
      </div>
    </div>
  `;
}