/* ============================================================
   Share Modal View — HTML do modal de compartilhar
   ============================================================ */

export function getShareModalHTML() {
  return `
    <div class="modal-overlay" id="modal-share">
      <div class="modal">
        <div class="modal-handle"></div>
        <h2><span class="emo">👥</span>Compartilhar</h2>
        <p style="font-size:13px;color:var(--muted);margin-bottom:16px;font-weight:500;">
          Compartilhe essa rifa com outras pessoas. Elas poderão ver e editar.
        </p>
        <div class="field"><label>Email</label><input id="in-share-email" type="email" placeholder="email@exemplo.com" autocomplete="email"></div>
        <button class="btn btn-primary" style="width:100%;" onclick="shareRifa()">➕ Compartilhar</button>
        <div style="margin-top:20px;">
          <label style="font-size:11px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:10px;">Quem tem acesso</label>
          <div id="share-list"></div>
        </div>
        <div class="modal-actions" style="margin-top:16px;">
          <button class="btn btn-ghost" onclick="closeModal('modal-share')">Fechar</button>
        </div>
      </div>
    </div>
  `;
}