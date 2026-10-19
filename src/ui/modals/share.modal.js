/* ============================================================
   Share Modal — compartilhar rifa com outros usuários
   ============================================================ */

import { APP } from '../../config/state.js';
import { haptic } from '../../utils/haptic.js';
import { toast } from '../components/toast.js';
import { showConfirm } from '../components/confirm.js';
import { escapeHtml } from '../../utils/format.js';
import { listShares, findUserByEmail, shareRifaWithUser, removeShare as removeShareApi } from '../../services/shares.service.js';

/* ------------------------------------------------------------
   Abrir modal
   ------------------------------------------------------------ */
export async function openShareModal() {
  const r = APP.currentRifa;
  if (!r) return;

  const input = document.getElementById('in-share-email');
  if (input) input.value = '';

  await renderShareList(r);

  const modal = document.getElementById('modal-share');
  if (modal) modal.classList.add('show');
}

/* ------------------------------------------------------------
   Render lista de quem tem acesso
   ------------------------------------------------------------ */
async function renderShareList(rifa) {
  const list = document.getElementById('share-list');
  if (!list) return;

  list.innerHTML = '<p style="font-size:12px;color:var(--muted);text-align:center;padding:10px;">Carregando...</p>';

  try {
    const shares = await listShares(rifa.id);

    if (shares.length === 0) {
      list.innerHTML = '<p style="font-size:12px;color:var(--muted);text-align:center;padding:10px;">Ninguém ainda. Só você.</p>';
      return;
    }

    list.innerHTML = shares.map(s => {
      const color = '#00b894';
      return `<div class="share-user-item">
        <div class="su-avatar" style="background:${color};">${(s.email || '?')[0].toUpperCase()}</div>
        <div class="su-info">
          <h5>${escapeHtml(s.name || s.email)}</h5>
          <p>${escapeHtml(s.email)}</p>
        </div>
        <button class="su-btn remove" data-share-id="${s.id}">Remover</button>
      </div>`;
    }).join('');

    // Bind remove
    list.querySelectorAll('[data-share-id]').forEach(btn => {
      btn.onclick = () => _removeShare(btn.dataset.shareId);
    });
  } catch (err) {
    console.error(err);
    list.innerHTML = '<p style="font-size:12px;color:var(--muted);text-align:center;padding:10px;">Erro ao carregar</p>';
  }
}

/* ------------------------------------------------------------
   Compartilhar
   ------------------------------------------------------------ */
export async function shareRifa() {
  const email = document.getElementById('in-share-email')?.value.trim().toLowerCase();
  if (!email) { toast('⚠️ Informe o email'); return; }

  const r = APP.currentRifa;
  if (!r) return;

  try {
    const target = await findUserByEmail(email);
    if (!target) {
      toast('⚠️ Usuário não encontrado. Ele precisa criar conta primeiro.');
      haptic(50);
      return;
    }

    const result = await shareRifaWithUser(r.id, target.id);
    if (!result.ok) {
      toast('⚠️ ' + result.error);
      return;
    }

    await renderShareList(r);

    const input = document.getElementById('in-share-email');
    if (input) input.value = '';

    haptic([10, 30, 10]);
    toast('✅ Compartilhado!');
  } catch (err) {
    console.error(err);
    toast('❌ Erro ao compartilhar');
  }
}

/* ------------------------------------------------------------
   Remover
   ------------------------------------------------------------ */
export function removeShare(shareId) {
  return _removeShare(shareId);
}

async function _removeShare(shareId) {
  showConfirm('Remover acesso?', 'Essa pessoa vai perder acesso à rifa.', 'warning', async () => {
    try {
      await removeShareApi(shareId);
      await renderShareList(APP.currentRifa);
      toast('✅ Removido');
    } catch (err) {
      toast('❌ Erro');
    }
  });
}