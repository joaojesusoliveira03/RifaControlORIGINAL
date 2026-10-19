export function getRifaModalHTML() {
  return `
    <div class="modal-overlay" id="modal-rifa">
      <div class="modal cockpit-modal">
        
        <div class="modal-handle"></div>
        
        <!-- HEADER FIXO -->
        <div class="modal-header-custom">
          <h2><span class="emo">🎟️</span>Nova Rifa</h2>
          <button class="icon-btn close-btn" onclick="closeModal('modal-rifa')">✕</button>
        </div>

        <!-- BODY ROLÁVEL -->
        <div class="cockpit-body">
          
          <!-- PREVIEW (ESQUERDA) -->
          <div class="cockpit-preview">
            <div class="preview-label">Preview</div>
            <div class="rifa-card preview-card" id="preview-card">
              <div class="card-body">
                <div class="rifa-top">
                  <div class="rifa-avatar" id="preview-avatar">🎟️</div>
                  <div class="rifa-info">
                    <h3 id="preview-name">Nome da Rifa</h3>
                    <p id="preview-prize">Prêmio</p>
                    <div class="rifa-price-line" id="preview-price">R$ 0,00 por número</div>
                  </div>
                </div>
                <div class="rifa-progress"><div class="rifa-progress-fill" style="width:0%"></div></div>
                <div class="rifa-meta">
                  <span class="mini-badge info" id="preview-total">🎯 0/0</span>
                </div>
              </div>
            </div>
            <p class="preview-hint">É assim que sua rifa vai aparecer na tela inicial.</p>
          </div>

          <!-- FORMULÁRIO (DIREITA) -->
          <div class="cockpit-form">
            <div class="form-section">
              <div class="form-section-title">Informações Básicas</div>
              <div class="field">
                <label>Nome da rifa</label>
                <input id="in-rifa-name" placeholder="Ex: Rifa do Bem" maxlength="40" oninput="updateRifaPreview()">
              </div>
              <div class="field">
                <label>Prêmio</label>
                <input id="in-rifa-prize" placeholder="Ex: Cesta básica" maxlength="60" oninput="updateRifaPreview()">
              </div>
              <div class="field">
                <label>Imagem do prêmio (opcional)</label>
                <div class="image-uploader" id="rifa-image-uploader" onclick="triggerImageUpload('rifa')">
                  <div class="up-icon">🖼️</div>
                  <div class="up-text">Toque para escolher</div>
                </div>
                <div class="upload-actions">
                  <button class="mini-btn" type="button" onclick="event.stopPropagation(); triggerImageUpload('rifa')">📁 Arquivo</button>
                  <button class="mini-btn" type="button" onclick="event.stopPropagation(); promptImageUrl('rifa')">🔗 URL</button>
                </div>
                <input type="file" id="rifa-image-input" accept="image/*" style="display:none" onchange="handleImageUpload(event, 'rifa')">
              </div>
            </div>

            <div class="form-section">
              <div class="form-section-title">Valores e Quantidade</div>
              <div class="field-row">
                <div class="field">
                  <label>Preço (R$)</label>
                  <input id="in-rifa-price" type="number" step="0.01" min="0" placeholder="1.50" inputmode="decimal" oninput="updatePromoSummary(); updateRifaPreview();">
                </div>
                <div class="field">
                  <label>Qtd. números</label>
                  <input id="in-rifa-total" type="number" min="1" value="100" inputmode="numeric" oninput="updateRifaPreview()">
                </div>
              </div>
              <div class="promo-box disabled" id="promo-box">
                <div class="promo-header">
                  <div class="promo-header-left">
                    <div class="promo-icon">🎁</div>
                    <div>
                      <div class="promo-title">Ativar promoção</div>
                      <div class="promo-subtitle">Desconto por quantidade</div>
                    </div>
                  </div>
                  <div class="switch small" id="promo-switch" onclick="togglePromo(); updateRifaPreview();"></div>
                </div>
                <div class="promo-content">
                  <div class="promo-row">
                    <span class="promo-row-label">Leve</span>
                    <input type="number" id="promo-qty" min="2" value="10" inputmode="numeric" oninput="updatePromoSummary(); updateRifaPreview();">
                    <span class="promo-row-label">por apenas</span>
                    <span class="promo-row-label">R$</span>
                    <input type="number" id="promo-price" min="0.01" step="0.01" value="10" class="money" inputmode="decimal" oninput="updatePromoSummary(); updateRifaPreview();">
                  </div>
                  <div class="promo-summary" id="promo-summary"></div>
                </div>
              </div>
            </div>

            <div class="form-section">
              <div class="form-section-title">Data do Sorteio</div>
              <div class="field-row">
                <div class="field">
                  <label>📅 Data</label>
                  <input id="in-rifa-date" type="date">
                </div>
                <div class="field">
                  <label>🕐 Hora</label>
                  <input id="in-rifa-time" type="time" value="20:00">
                </div>
              </div>
            </div>

            <div class="form-section">
              <div class="form-section-title">Aparência</div>
              <div class="field">
                <label>Ícone</label>
                <div class="emoji-grid" id="emoji-grid"></div>
              </div>
              <div class="field">
                <label>Cor</label>
                <div class="color-grid" id="rifa-color-grid"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- FOOTER FIXO -->
        <div class="modal-footer-custom">
          <button class="btn btn-ghost" onclick="closeModal('modal-rifa')">Cancelar</button>
          <button class="btn btn-primary" onclick="saveRifa()">Criar Rifa</button>
        </div>
        
      </div>
    </div>
  `;
}