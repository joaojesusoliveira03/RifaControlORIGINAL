/* ============================================================
   Toast — notificações rápidas
   ============================================================ */

let toastTimer = null;

export function toast(msg, duration = 2000) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.innerHTML = `<span class="toast-msg">${msg}</span>`;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), duration);
}

export function toastWithAction(msg, actionLabel, action, duration = 5000) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.innerHTML = `
    <span class="toast-msg">${msg}</span>
    <button class="toast-action">${actionLabel}</button>
  `;
  t.classList.add('show');
  const btn = t.querySelector('.toast-action');
  if (btn) {
    btn.onclick = () => {
      t.classList.remove('show');
      clearTimeout(toastTimer);
      action();
    };
  }
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), duration);
}