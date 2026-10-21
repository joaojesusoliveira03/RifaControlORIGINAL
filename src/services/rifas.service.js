/* ============================================================
   Rifas Service — CRUD de rifas (local + Supabase)
   ============================================================ */

import { sb } from '../config/supabase.js';
import { APP } from '../config/state.js';

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
    promos: r.promos || [], 
    prizes: r.prizes || [],          
    top_buyer_prize: r.top_buyer_prize || null, 
    sales: r.sales || [],
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    isShared: r.owner_id !== APP.user.id
  };
}

export async function reloadRifas() {
  const { data, error } = await sb
    .from('rifas')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  APP.rifas = (data || []).map(mapRifa);
  return APP.rifas;
}

export function getRifa(id) {
  return APP.rifas.find(r => r.id === id) || null;
}

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
    promo_enabled: false,
    promo_quantity: 10,
    promo_price: 10,
    promos: data.promos || [],
    prizes: data.prizes || [],
    top_buyer_prize: data.top_buyer_prize || null,
    sales: []
  });

  if (error) throw error;
}

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
    promo_enabled: (rifa.promos && rifa.promos.length > 0),
    promo_quantity: rifa.promos && rifa.promos[0] ? rifa.promos[0].quantity : 10,
    promo_price: rifa.promos && rifa.promos[0] ? rifa.promos[0].price : 10,
    promos: rifa.promos || [],
    prizes: rifa.prizes || [],
    top_buyer_prize: rifa.top_buyer_prize || null
  };

  const { error } = await sb
    .from('rifas')
    .update(payload)
    .eq('id', rifa.id);

  if (error) throw error;
}

export async function deleteRifaFromCloud(id) {
  const { error } = await sb.from('rifas').delete().eq('id', id);
  if (error) throw error;
}

export async function persistRifa(rifa) {
  try {
    await saveRifaCloud(rifa);
    const idx = APP.rifas.findIndex(r => r.id === rifa.id);
    if (idx >= 0) APP.rifas[idx] = rifa;
    return true;
  } catch (err) {
    console.error('persistRifa error:', err);
    return false;
  }
}