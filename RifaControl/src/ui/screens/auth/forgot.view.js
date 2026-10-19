/* ============================================================
   Forgot View — HTML do "Esqueci minha senha"
   ============================================================ */

export function getForgotViewHTML() {
  return `
    <div id="auth-view-forgot" class="hidden">
      <h2 style="font-size:20px;font-weight:800;text-align:center;margin-bottom:6px;">Esqueci minha senha</h2>
      <p style="font-size:13px;color:var(--muted);text-align:center;margin-bottom:20px;line-height:1.5;">
        Digite seu email e enviaremos um link pra você criar uma nova senha.
      </p>
      
      <div class="auth-field">
        <label>Email</label>
        <input type="email" id="in-forgot-email" placeholder="seu@email.com" autocomplete="email">
      </div>
      
      <button class="auth-btn" id="btn-forgot" onclick="sendForgotPassword()">Enviar link</button>
      <button class="auth-back" onclick="backToLogin()">← Voltar pro login</button>
      <div class="auth-message" id="forgot-msg"></div>
    </div>
  `;
}