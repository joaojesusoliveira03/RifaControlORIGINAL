/* ============================================================
   Login View — HTML do formulário de entrar / criar conta
   ============================================================ */

export function getLoginViewHTML() {
  return `
    <div id="auth-view-login">
      <div class="auth-tabs">
        <button class="auth-tab active" id="tab-login" onclick="switchAuthTab('login')">Entrar</button>
        <button class="auth-tab" id="tab-signup" onclick="switchAuthTab('signup')">Criar conta</button>
      </div>
      
      <div class="auth-field">
        <label>Email</label>
        <input type="email" id="in-auth-email" placeholder="seu@email.com" autocomplete="email">
      </div>
      
      <div class="auth-field">
        <label>Senha</label>
        <input type="password" id="in-auth-pass" placeholder="Mínimo 6 caracteres" autocomplete="current-password">
      </div>
      
      <div class="auth-field hidden" id="field-name">
        <label>Seu nome</label>
        <input type="text" id="in-auth-name" placeholder="Ex: João Silva" autocomplete="name" maxlength="40">
      </div>
      
      <button class="auth-btn" id="btn-auth" onclick="handleAuth()">Entrar</button>
      <button class="auth-link" onclick="showForgotPassword()">Esqueci minha senha</button>
      <div class="auth-message" id="auth-msg"></div>
    </div>
  `;
}