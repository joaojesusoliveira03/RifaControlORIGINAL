/* ============================================================
   Reset View — HTML do "Definir nova senha"
   ============================================================ */

export function getResetViewHTML() {
  return `
    <div id="auth-view-reset" class="hidden">
      <h2 style="font-size:20px;font-weight:800;text-align:center;margin-bottom:6px;">Defina sua nova senha</h2>
      <p style="font-size:13px;color:var(--muted);text-align:center;margin-bottom:20px;line-height:1.5;">
        Sua conta foi verificada! Agora defina uma nova senha.
      </p>
      
      <div class="auth-field">
        <label>Nova senha</label>
        <input type="password" id="in-reset-pass" placeholder="Mínimo 6 caracteres" autocomplete="new-password">
      </div>
      
      <div class="auth-field">
        <label>Confirme a nova senha</label>
        <input type="password" id="in-reset-pass2" placeholder="Digite de novo" autocomplete="new-password">
      </div>
      
      <button class="auth-btn" id="btn-reset" onclick="updatePassword()">Salvar nova senha</button>
      <div class="auth-message" id="reset-msg"></div>
    </div>
  `;
}