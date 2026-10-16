/* ============================================================
   Rifas Service — CRUD de rifas (local + Supabase)
   ============================================================ */

import { sb } from '../config/supabase.js';
import { APP } from '../config/state.js';

/* ------------------------------------------------------------
   Mapper: linha do Supabase → objeto do app
   ------------------------------------------------------------ */
export function mapRifa(r) {
  return {
    id: r.id,
    owner_id: r.owner_id,
    name: r.name,
    prize: r.prize,
    price: parseFloat(r.price) || 0,
    total: r.total,
    date: r.date,
    time: r.time,
    emoji: r.emoji,
    colorIdx: r.color_idx,
    image: r.image,
    winner: r.winner,
    promo_enabled: r.promo_enabled,
    promo_quantity: r.promo_quantity,
    promo_price: parseFloat(r.promo_price) || 0,
    sales: r.sales || [],
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    isShared: r.owner_id !== APP.user.id
  };
}

/* ------------------------------------------------------------
   Leitura
   ------------------------------------------------------------ */

/**
 * Recarrega todas as rifas do servidor e atualiza APP.rifas.
 * Retorna a lista.
 */
export async function reloadRifas() {
  const { data, error } = await sb
    .from('rifas')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('reloadRifas error:', error);
    throw error;
  }

  APP.rifas = (data || []).map(mapRifa);
  return APP.rifas;
}

/**
 * Busca uma rifa localmente pelo id.
 */
export function getRifa(id) {
  return APP.rifas.find(r => r.id === id) || null;
}

/**
 * Substitui uma rifa em APP.rifas pela versão atualizada (in-place).
 */
export function replaceRifaLocal(rifa) {
  const idx = APP.rifas.findIndex(r => r.id === rifa.id);
  if (idx >= 0) APP.rifas[idx] = rifa;
}

/* ------------------------------------------------------------
   Escrita
   ------------------------------------------------------------ */

/**
 * Cria uma nova rifa.
 * @param {object} data - { name, prize, price, total, date, time, emoji, colorIdx, image, promo_enabled, promo_quantity, promo_price }
 */
export async function createRifa(data) {
  const { error } = await sb.from('rifas').insert({
    owner_id: APP.user.id,
    name: data.name,
    prize: data.prize || '—',
    price: data.price,
    total: data.total,
    date: data.date,
    time: data.time,
    emoji: data.emoji,
    color_idx: data.colorIdx,
    image: data.image,
    winner: null,
    promo_enabled: data.promo_enabled || false,
    promo_quantity: data.promo_quantity || 10,
    promo_price: data.promo_price || 10,
    sales: []
  });

  if (error) throw error;
}

/**
 * Atualiza uma rifa existente (todos os campos).
 */
export async function saveRifaCloud(rifa) {
  if (!rifa) return;

  const payload = {
    name: rifa.name,
    prize: rifa.prize,
    price: rifa.price,
    total: rifa.total,
    date: rifa.date,
    time: rifa.time,
    emoji: rifa.emoji,
    color_idx: rifa.colorIdx,
    image: rifa.image,
    winner: rifa.winner,
    sales: rifa.sales,
    promo_enabled: rifa.promo_enabled,
    promo_quantity: rifa.promo_quantity,
    promo_price: rifa.promo_price
  };

  const { error } = await sb
    .from('rifas')
    .update(payload)
    .eq('id', rifa.id);

  if (error) throw error;
}

/**
 * Exclui uma rifa.
 */
export async function deleteRifaFromCloud(id) {
  const { error } = await sb.from('rifas').delete().eq('id', id);
  if (error) throw error;
}

/* ------------------------------------------------------------
   Sincronização "amigável" com estado global
   ------------------------------------------------------------ */

/**
 * Atualiza uma rifa localmente E no servidor, e reflete em APP.rifas.
 * Retorna true se salvou, false se deu erro.
 */
export async function persistRifa(rifa) {
  try {
    await saveRifaCloud(rifa);
    replaceRifaLocal(rifa);
    return true;
  } catch (err) {
    console.error('persistRifa error:', err);
    return false;
  }
}