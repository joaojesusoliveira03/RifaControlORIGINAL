/* ============================================================
   Shares Service — compartilhamento de rifas entre usuários
   ============================================================ */

import { sb } from '../config/supabase.js';
import { APP } from '../config/state.js';

/* ------------------------------------------------------------
   Lista compartilhamentos de uma rifa (com dados de perfil)
   ------------------------------------------------------------ */
export async function listShares(rifaId) {
  const { data: shares, error } = await sb
    .from('shares')
    .select('*')
    .eq('rifa_id', rifaId);

  if (error) throw error;
  if (!shares || shares.length === 0) return [];

  const userIds = shares.map(s => s.user_id);
  const { data: profiles } = await sb
    .from('profiles')
    .select('id, email, name')
    .in('id', userIds);

  return shares.map(s => {
    const p = (profiles || []).find(x => x.id === s.user_id)
      || { id: s.user_id, email: '?', name: '?' };
    return {
      id: s.id,
      rifa_id: s.rifa_id,
      user_id: s.user_id,
      email: p.email,
      name: p.name || p.email
    };
  });
}

/* ------------------------------------------------------------
   Busca perfil por email (pra compartilhar)
   Retorna { id, email } ou null.
   ------------------------------------------------------------ */
export async function findUserByEmail(email) {
  const normalized = String(email || '').trim().toLowerCase();
  const { data, error } = await sb
    .from('profiles')
    .select('id, email, name')
    .eq('email', normalized)
    .limit(1);

  if (error) throw error;
  return data && data[0] ? data[0] : null;
}

/* ------------------------------------------------------------
   Compartilha uma rifa com um usuário.
   Retorna { ok, error? }
   ------------------------------------------------------------ */
export async function shareRifaWithUser(rifaId, targetUserId) {
  if (targetUserId === APP.user.id) {
    return { ok: false, error: 'Você já tem acesso' };
  }

  const { data: existing } = await sb
    .from('shares')
    .select('id')
    .eq('rifa_id', rifaId)
    .eq('user_id', targetUserId);

  if (existing && existing.length > 0) {
    return { ok: false, error: 'Já compartilhado' };
  }

  const { error } = await sb
    .from('shares')
    .insert({ rifa_id: rifaId, user_id: targetUserId });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/* ------------------------------------------------------------
   Remove um compartilhamento (usado pelo dono da rifa)
   ------------------------------------------------------------ */
export async function removeShare(shareId) {
  const { error } = await sb.from('shares').delete().eq('id', shareId);
  if (error) throw error;
}

/* ------------------------------------------------------------
   Sair de uma rifa compartilhada
   (remove APENAS o share do usuário logado)
   ------------------------------------------------------------
   ⚠️ Se essa função não estiver apagando de verdade no banco,
   é porque a tabela `shares` no Supabase NÃO tem policy de DELETE
   com `auth.uid() = user_id` liberada. Verifique em:
   Supabase → Authentication → Policies → shares
   ------------------------------------------------------------ */
export async function leaveSharedRifa(rifaId) {
  if (!APP.user) {
    throw new Error('Usuário não autenticado');
  }

  // Log de debug
  console.log('🔍 leaveSharedRifa:', {
    rifaId,
    userId: APP.user.id
  });

  // 1) Tenta deletar e RETORNA as linhas afetadas (pra confirmar)
  const { data, error, count } = await sb
    .from('shares')
    .delete()
    .eq('rifa_id', rifaId)
    .eq('user_id', APP.user.id)
    .select();

  console.log('📊 Resultado DELETE:', { data, error, count });

  if (error) {
    console.error('❌ Erro ao deletar share:', error);
    throw error;
  }

  // 2) Se deletou 0 linhas, é porque o RLS bloqueou (ou o share já não existia)
  if (!data || data.length === 0) {
    console.warn('⚠️ Nenhuma linha foi deletada. Provável bloqueio de RLS.');

    // Verifica se o share ainda existe
    const { data: stillExists, error: checkErr } = await sb
      .from('shares')
      .select('id, user_id, rifa_id')
      .eq('rifa_id', rifaId)
      .eq('user_id', APP.user.id);

    console.log('🔎 Share ainda existe?', stillExists, checkErr);

    if (stillExists && stillExists.length > 0) {
      throw new Error(
        'RLS bloqueou a remoção. Vá em Supabase → Authentication → Policies → shares e crie uma policy de DELETE com: auth.uid() = user_id'
      );
    }

    // Se não existe mais, considera OK (talvez já tinha saído antes)
    return true;
  }

  console.log('✅ Share removido com sucesso:', data);
  return true;
}