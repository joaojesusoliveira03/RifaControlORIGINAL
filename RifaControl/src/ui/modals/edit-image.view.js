/* ============================================================
   Edit Image Modal View — HTML do modal de trocar imagem
   ============================================================ */

export function getEditImageModalHTML() {
  return `
    <div class="modal-overlay" id="modal-edit-image">
      <div class="modal">
        <div class="modal-handle"></div>
        <h2><span class="emo">🖼️</span>Imagem</h2>
        <div class="field">
          <div class="image-uploader" id="edit-image-uploader" onclick="triggerImageUpload('edit')">
            <div class="up-icon">🖼️</div><div class="up-text">Toque para escolher</div>
          </div>
          <div class="upload-actions">
            <button class="mini-btn" type="button" onclick="triggerImageUpload('edit')">📁 Arquivo</button>
            <button class="mini-btn" type="button" onclick="promptEditImageUrl()">🔗 URL</button>
          </div>
          <input type="file" id="edit-image-input" accept="image/*" style="display:none" onchange="handleEditImageUpload(event)">
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" onclick="closeModal('modal-edit-image')">Fechar</button>
        </div>
      </div>
    </div>
  `;
}