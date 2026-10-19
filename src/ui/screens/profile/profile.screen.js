/* ============================================================
   Profile Screen — Lógica de edição de perfil
   ============================================================ */

import { APP } from '../../../config/state.js';
import { sb } from '../../../config/supabase.js';
import { haptic } from '../../../utils/haptic.js';
import { toast } from '../../components/toast.js';
import { showConfirm } from '../../components/confirm.js';
import { setSyncStatus } from '../../../core/auth.js';

export function renderProfile() {
  if (!APP.user) return;

  const name = APP.profile?.name || '';
  const email = APP.user.email;

  // Atualiza elementos visuais
  document.getElementById('prof-avatar').textContent = (name || email)[0].toUpperCase();
  document.getElementById('prof-name').textContent = name || 'Sem nome';
  document.getElementById('prof-email').textContent = email;

  // Preenche os inputs
  document.getElementById('in-prof-name').value = name;
  document.getElementById('in-prof-email').value = email;
}

export async function saveProfile() {
  const newName = document.getElementById('in-prof-name').value.trim();
  if (!newName) {
    toast('⚠️ O nome não pode ficar vazio');
    haptic(50);
    return;
  }

  setSyncStatus('syncing', 'Salvando...');
  haptic(10);

  try {
    // 1. Atualiza na tabela profiles
    const { error } = await sb
      .from('profiles')
      .update({ name: newName })
      .eq('id', APP.user.id);

    if (error) throw error;

    // 2. Atualiza o estado local
    APP.profile.name = newName;
    
    // 3. Atualiza a UI
    renderProfile();
    if (window.updateSidebarUser) window.updateSidebarUser();
    
    setSyncStatus('', 'Sincronizado');
    toast('✅ Perfil atualizado!');
    haptic([10, 30, 10]);
  } catch (err) {
    console.error(err);
    setSyncStatus('error', 'Erro');
    toast('❌ Erro ao salvar perfil');
  }
}

export async function sendPasswordReset() {
  haptic(10);
  const email = APP.user.email;
  
  try {
    const { error } = await sb.auth.resetPasswordForEmail(email);
    if (error) throw error;
    toast('📧 Link enviado para ' + email);
  } catch (err) {
    toast('❌ Erro ao enviar email');
  }
}

export function confirmLogout() {
  haptic(10);
  showConfirm(
    'Sair da conta?',
    'Você precisará fazer login novamente.',
    'danger',
    async () => {
      if (window.signOut) await window.signOut();
    },
    'Sair'
  );
}
