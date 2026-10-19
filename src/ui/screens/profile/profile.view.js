/* ============================================================
   Profile View — HTML da tela de perfil
   ============================================================ */

export function getProfileViewHTML() {
  return `
    <div class="screen" id="screen-profile">
      <div class="header">
        <div class="header-content">
          <button class="back-btn" onclick="showScreen('settings')">
            <svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2Z"/></svg>
          </button>
          <h1>👤 Meu Perfil</h1>
          <div class="sub">Gerencie seus dados</div>
        </div>
      </div>
      
      <div class="content">
        <!-- Card Principal -->
        <div class="profile-header-card">
          <div class="profile-avatar" id="prof-avatar">J</div>
          <div class="profile-name" id="prof-name">Carregando...</div>
          <div class="profile-email" id="prof-email">-</div>
        </div>

        <!-- Formulário -->
        <div class="form-section" style="margin-top: 20px;">
          <div class="form-section-title">Informações Básicas</div>
          
          <div class="field">
            <label>Nome Completo</label>
            <input type="text" id="in-prof-name" placeholder="Seu nome">
          </div>
          
          <div class="field">
            <label>Email (não editável)</label>
            <input type="email" id="in-prof-email" disabled style="opacity: 0.6; cursor: not-allowed;">
          </div>
          
          <button class="btn btn-primary" style="width: 100%; margin-top: 12px;" onclick="saveProfile()">Salvar Alterações</button>
        </div>

        <!-- Segurança -->
        <div class="form-section" style="margin-top: 16px;">
          <div class="form-section-title">Segurança</div>
          <button class="btn btn-ghost" style="width: 100%;" onclick="sendPasswordReset()">
            🔒 Redefinir Senha
          </button>
          <p class="field-hint" style="text-align: center; margin-top: 8px;">Enviaremos um link para o seu email.</p>
        </div>

        <!-- Zona de Perigo -->
        <div class="form-section" style="margin-top: 16px; border-color: rgba(239,68,68,.3);">
          <div class="form-section-title" style="color: var(--danger);">Zona de Perigo</div>
          <button class="btn btn-ghost" style="width: 100%; color: var(--danger);" onclick="confirmLogout()">
            🚪 Sair da Conta
          </button>
        </div>

        <div style="text-align:center; padding: 30px 0; color: var(--muted); font-size: 11px;">
          RifaControl Cloud v1.1
        </div>
      </div>
    </div>
  `;
}
