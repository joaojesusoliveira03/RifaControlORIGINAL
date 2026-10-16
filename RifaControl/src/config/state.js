/* ============================================================
   State — store central do app + event bus simples
   ============================================================ */

export const APP = {
  // Sessão
  user: null,
  profile: null,

  // Dados
  rifas: [],
  currentRifa: null,
  currentBuyer: null,

  // Navegação
  currentTab: 'numbers',      // numbers | sales | info
  currentReportTab: 'geral',  // geral | compradores | vendedores
  authMode: 'login',          // login | signup

  // Preferências
  dark: false,
  accentIdx: 0,
  haptic: true,
  confetti: true,

  // Formulários (transient)
  newRifaEmoji: '🎟️',
  newRifaColor: 0,
  newRifaImage: null,
  newRifaPromoEnabled: false,
  salePay: 'pending',
  search: '',
  gridFilter: 'all',          // all | paid | pending | available | winner

  // Infra
  realtimeChannel: null,
  isRecoveryMode: false
};

/* ------------------------------------------------------------
   Event bus minimalista — pra notificar mudanças de estado
   Uso: subscribe(fn) → retorna unsubscribe()
   ------------------------------------------------------------ */
const listeners = new Set();

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function notify(meta = {}) {
  listeners.forEach(fn => {
    try { fn(APP, meta); } catch (e) { console.error('listener error:', e); }
  });
}