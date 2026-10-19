/* ============================================================
   Modal — helpers de abrir/fechar modais
   ============================================================ */

/**
 * Abre um modal por id.
 */
export function openModal(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.add('show');
    document.body.style.overflow = 'hidden'; // Trava o scroll do fundo
  }
}

/**
 * Fecha um modal por id.
 */
export function closeModal(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.remove('show');
    document.body.style.overflow = ''; // Destrava o scroll
  }
}

/**
 * Fecha todos os modais abertos.
 */
export function closeAllModals() {
  document.querySelectorAll('.modal-overlay.show')
    .forEach(m => m.classList.remove('show'));
  document.body.style.overflow = '';
}

/**
 * Inicializa listeners de clique fora pra fechar.
 * Chamado UMA VEZ no boot (main.js).
 */
export function initModalOverlayDismiss() {
  const protectedIds = [
    'modal-sort',
    'modal-confirm',
    'modal-num-info',
    'modal-random'
  ];

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) {
        if (protectedIds.includes(overlay.id)) return;
        overlay.classList.remove('show');
        document.body.style.overflow = '';
      }
    });
  });

  // ESC fecha tudo que não é protegido
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.modal-overlay.show').forEach(m => {
      if (protectedIds.includes(m.id)) return;
      m.classList.remove('show');
    });
    document.body.style.overflow = '';
  });
}