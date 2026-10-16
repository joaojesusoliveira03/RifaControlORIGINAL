/* ============================================================
   Auth — login, signup, forgot, reset, logout
   ============================================================ */

import { sb } from '../config/supabase.js';
import { APP } from '../config/state.js';
import { reloadRifas } from '../services/rifas.service.js';
import { subscribeRealtime, stopRealtime } from './realtime.js';
import { haptic } from '../utils/haptic.js';
import { toast } from '../ui/components/toast.js';
import { launchConfetti } from '../ui/components/confetti.js';
import { updateSidebarUser } from '../ui/components/sidebar.js';

/* ------------------------------------------------------------
   Helpers de tela auth
   ------------------------------------------------------------ */

export function showAuthView(view) {
  ['login', 'forgot', 'reset'].forEach(v => {
    const el = document.getElementById('auth-view-' + v);
    if (el) el.classList.add('hidden');
  });
  const target = document.getElementById('auth-view-' + view);
  if (target) target.classList.remove('hidden');
}

export function switchAuthTab(mode) {
  haptic(5);
  APP.authMode = mode;

  const tl = document.getElementById('tab-login');
  const ts = document.getElementById('tab-signup');
  if (tl) tl.classList.toggle('active', mode === 'login');
  if (ts) ts.classList.toggle('active', mode === 'signup');

  const fieldName = document.getElementById('field-name');
  if (fieldName) fieldName.classList.toggle('hidden', mode === 'login');

  const btn = document.getElementById('btn-auth');
  if (btn) btn.textContent = mode === 'login' ? 'Entrar' : 'Criar conta';

  hideAuthMessage('auth-msg');
}

export function showAuthMessage(elId, msg, type) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = msg;
  el.className = 'auth-message show ' + type;
}

export function hideAuthMessage(elId) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.className = 'auth-message';
}

export function showAuthScreen() {
  const auth = document.getElementById('auth-screen');
  const app = document.getElementById('app');
  if (auth) auth.classList.remove('hidden');
  if (app) app.classList.add('hidden');
}

export function showApp() {
  const auth = document.getElementById('auth-screen');
  const app = document.getElementById('app');
  if (auth) auth.classList.add('hidden');
  if (app) app.classList.remove('hidden');
}

/* ------------------------------------------------------------
   Handlers principais
   ------------------------------------------------------------ */

export async function handleAuth() {
  const email = document.getElementById('in-auth-email').value.trim();
  const pass = document.getElementById('in-auth-pass').value;
  const name = document.getElementById('in-auth-name').value.trim();

  if (!email) { showAuthMessage('auth-msg', 'Informe o email', 'error'); return; }
  if (!pass || pass.length < 6) { showAuthMessage('auth-msg', 'Senha deve ter 6+ caracteres', 'error'); return; }
  if (APP.authMode === 'signup' && !name) { showAuthMessage('auth-msg', 'Informe seu nome', 'error'); return; }

  const btn = document.getElementById('btn-auth');
  btn.disabled = true;
  btn.textContent = 'Aguarde...';
  hideAuthMessage('auth-msg');

  try {
    if (APP.authMode === 'signup') {
      const { data, error } = await sb.auth.signUp({
        email,
        password: pass,
        options: { data: { name } }
      });
      if (error) throw error;

      if (data.user && !data.session) {
        showAuthMessage('auth-msg', 'Confirme seu email antes de entrar', 'success');
      } else {
        showAuthMessage('auth-msg', 'Conta criada! Entrando...', 'success');
      }
    } else {
      const { error } = await sb.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
    }
  } catch (err) {
    console.error(err);
    let msg = 'Erro inesperado';
    if (err.message.includes('Invalid login')) msg = 'Email ou senha incorretos';
    else if (err.message.includes('already registered')) msg = 'Esse email já está cadastrado';
    else if (err.message.includes('Password should be')) msg = 'Senha muito curta';
    else msg = err.message;
    showAuthMessage('auth-msg', msg, 'error');
    haptic(50);
  } finally {
    btn.disabled = false;
    btn.textContent = APP.authMode === 'login' ? 'Entrar' : 'Criar conta';
  }
}

export function showForgotPassword() {
  haptic(8);
  const inp = document.getElementById('in-forgot-email');
  if (inp) inp.value = '';
  hideAuthMessage('forgot-msg');
  showAuthView('forgot');
}

export function backToLogin() {
  haptic(8);
  hideAuthMessage('forgot-msg');
  hideAuthMessage('reset-msg');
  showAuthView('login');
}

export async function sendForgotPassword() {
  const email = document.getElementById('in-forgot-email').value.trim();
  if (!email) { showAuthMessage('forgot-msg', 'Informe o email', 'error'); return; }

  const btn = document.getElementById('btn-forgot');
  btn.disabled = true;
  btn.textContent = 'Enviando...';
  hideAuthMessage('forgot-msg');

  try {
    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + window.location.pathname
    });
    if (error) throw error;

    showAuthMessage('forgot-msg', '✅ Link enviado! Confira seu email', 'success');
    haptic([10, 30, 10]);
    setTimeout(() => backToLogin(), 4000);
  } catch (err) {
    console.error(err);
    let msg = 'Erro ao enviar. Tente de novo.';
    if (err.message.includes('rate limit')) msg = 'Muitos pedidos. Aguarde 1 min.';
    showAuthMessage('forgot-msg', msg, 'error');
    haptic(50);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Enviar link';
  }
}

export async function updatePassword() {
  const pass = document.getElementById('in-reset-pass').value;
  const pass2 = document.getElementById('in-reset-pass2').value;

  if (!pass || pass.length < 6) { showAuthMessage('reset-msg', 'Senha deve ter 6+ caracteres', 'error'); return; }
  if (pass !== pass2) { showAuthMessage('reset-msg', 'As senhas não batem', 'error'); return; }

  const btn = document.getElementById('btn-reset');
  btn.disabled = true;
  btn.textContent = 'Salvando...';
  hideAuthMessage('reset-msg');

  try {
    const { error } = await sb.auth.updateUser({ password: pass });
    if (error) throw error;

    showAuthMessage('reset-msg', '✅ Senha atualizada! Entrando...', 'success');
    haptic([10, 30, 10]);
    launchConfetti('small');

    setTimeout(() => {
      APP.isRecoveryMode = false;
      document.getElementById('in-reset-pass').value = '';
      document.getElementById('in-reset-pass2').value = '';
    }, 1000);
  } catch (err) {
    console.error(err);
    showAuthMessage('reset-msg', 'Erro ao salvar. Tente de novo.', 'error');
    haptic(50);
    btn.disabled = false;
    btn.textContent = 'Salvar nova senha';
  }
}

export async function signOut() {
  haptic(15);
  stopRealtime();
  await sb.auth.signOut();
  APP.user = null;
  APP.profile = null;
  APP.rifas = [];
  showAuthScreen();
  showAuthView('login');
  toast('👋 Até logo!');
}

/* ------------------------------------------------------------
   Carga de dados do usuário
   ------------------------------------------------------------ */

export async function loadUserData() {
  setSyncStatus('syncing', 'Carregando...');
  try {
    const { data: prof } = await sb
      .from('profiles')
      .select('*')
      .eq('id', APP.user.id)
      .single();

    APP.profile = prof || { name: APP.user.email, email: APP.user.email };

    const elName = document.getElementById('user-name');
    const elEmail = document.getElementById('user-email');
    const elAvatar = document.getElementById('user-avatar');

    if (elName) elName.textContent = APP.profile.name || 'Sem nome';
    if (elEmail) elEmail.textContent = APP.user.email;
    if (elAvatar) elAvatar.textContent = (APP.profile.name || APP.user.email)[0].toUpperCase();

    // Atualiza sidebar (desktop)
    updateSidebarUser();

    await reloadRifas();

    // Render inicial
    const { renderHome } = await import('../ui/screens/home.screen.js');
    renderHome();

    setSyncStatus('', 'Sincronizado');
  } catch (err) {
    console.error('Erro ao carregar dados:', err);
    setSyncStatus('error', 'Erro');
    toast('❌ Erro ao carregar dados');
  }
}

/* ------------------------------------------------------------
   Sync status
   ------------------------------------------------------------ */

export function setSyncStatus(status, text) {
  const el = document.getElementById('sync-status');
  const txt = document.getElementById('sync-text');
  if (!el) return;
  el.className = 'sync-status ' + status;
  if (txt) txt.textContent = text;
}

/* ------------------------------------------------------------
   Init
   ------------------------------------------------------------ */

export async function initAuth() {
  const { data: { session } } = await sb.auth.getSession();

  if (session && session.user) {
    APP.user = session.user;
    showApp();
    await loadUserData();
    subscribeRealtime();
  } else {
    showAuthScreen();
    showAuthView('login');
  }

  sb.auth.onAuthStateChange(async (event, session) => {
    console.log('🔐 Auth event:', event);

    if (event === 'PASSWORD_RECOVERY') {
      APP.isRecoveryMode = true;
      showAuthScreen();
      showAuthView('reset');
      return;
    }

    if (event === 'SIGNED_IN' && session && session.user) {
      if (APP.isRecoveryMode) return;
      APP.user = session.user;
      showApp();
      await loadUserData();
      subscribeRealtime();
    } else if (event === 'SIGNED_OUT') {
      APP.user = null;
      APP.isRecoveryMode = false;
      showAuthScreen();
      showAuthView('login');
    }
  });

  // Detecta recovery via hash na URL
  if (window.location.hash && window.location.hash.includes('type=recovery')) {
    APP.isRecoveryMode = true;
    showAuthScreen();
    showAuthView('reset');
  }
}