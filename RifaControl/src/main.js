/* ============================================================
   Main — entry point do app modular
   ============================================================ */

import { initTheme } from './core/theme.js';
import { initAuth } from './core/auth.js';
import { initModalOverlayDismiss } from './ui/components/modal.js';
import { subscribeRealtime } from './core/realtime.js';
import { setSyncStatus } from './core/auth.js';
import { toast } from './ui/components/toast.js';
import { reloadRifas } from './services/rifas.service.js';
import { APP } from './config/state.js';

// ⚠️ Importa globals (expõe tudo em window) — não remova
import './ui/globals.js';

async function init() {
  console.log('🚀 RifaControl modular iniciando...');

  // 1. Tema
  initTheme();

  // 2. Overlays de modal (clique fora pra fechar + ESC)
  initModalOverlayDismiss();

  // 3. Listeners de conectividade
  window.addEventListener('online', () => {
    setSyncStatus('', 'Online');
    toast('🟢 Online');
    if (APP.user) reloadRifas().catch(console.error);
  });
  window.addEventListener('offline', () => {
    setSyncStatus('error', 'Sem conexão');
    toast('🔴 Sem internet');
  });

  // 4. Enter nos campos de auth
  const pass = document.getElementById('in-auth-pass');
  if (pass) pass.addEventListener('keydown', e => { if (e.key === 'Enter') window.handleAuth(); });

  const forgot = document.getElementById('in-forgot-email');
  if (forgot) forgot.addEventListener('keydown', e => { if (e.key === 'Enter') window.sendForgotPassword(); });

  const reset2 = document.getElementById('in-reset-pass2');
  if (reset2) reset2.addEventListener('keydown', e => { if (e.key === 'Enter') window.updatePassword(); });

  // 5. Auth (decide se mostra login ou app)
  await initAuth();

  console.log('✅ RifaControl modular pronto');
}

init();