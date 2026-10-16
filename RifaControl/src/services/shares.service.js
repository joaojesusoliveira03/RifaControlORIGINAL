/* ============================================================
   Shares Service — compartilhamento de rifas entre usuários
   ============================================================ */

import { sb } from '../config/supabase.js';
import { APP } from '../config/state.js';

/**
 * Lista compartilhamentos de uma rifa (com dados de perfil).
 */
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

/**
 * Busca perfil por email (pra compartilhar).
 * Retorna { id, email } ou null.
 */
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

/**
 * Compartilha uma rifa com um usuário.
 * Retorna { ok, error? }
 */
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

/**
 * Remove um compartilhamento.
 */
export async function removeShare(shareId) {
  const { error } = await sb.from('shares').delete().eq('id', shareId);
  if (error) throw error;
}