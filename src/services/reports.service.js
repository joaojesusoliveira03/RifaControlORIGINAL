/* ============================================================
   Reports Service — agregações para relatórios
   ============================================================ */

import {
  calcArrecadado, calcPendente, countSold,
  countPaid, countPending, countAvailable
} from './sales.service.js';

/* ------------------------------------------------------------
   Relatório geral (visão macro)
   ------------------------------------------------------------ */
export function buildGeneralReport(rifas) {
  let arrecadado = 0;
  let pendente = 0;
  let vendidos = 0;
  let disponiveis = 0;
  let comGanhador = 0;

  rifas.forEach(r => {
    const sold = countSold(r);
    vendidos += sold;
    disponiveis += (r.total - sold);
    arrecadado += calcArrecadado(r);
    pendente += calcPendente(r);
    if (r.winner) comGanhador++;
  });

  const totalNumeros = vendidos + disponiveis;
  const pct = totalNumeros > 0 ? Math.round(vendidos / totalNumeros * 100) : 0;
  const totalPotencial = arrecadado + pendente;

  return {
    arrecadado,
    pendente,
    vendidos,
    disponiveis,
    comGanhador,
    totalRifas: rifas.length,
    totalPotencial,
    pctVendido: pct,
    totalNumeros
  };
}

/* ------------------------------------------------------------
   Resumo por rifa (pra cards empilhados)
   ------------------------------------------------------------ */
export function buildPerRifaReport(rifas) {
  return rifas.map(r => {
    const sold = countSold(r);
    const paid = countPaid(r);
    const pending = countPending(r);
    const available = countAvailable(r);
    const arrecadado = calcArrecadado(r);
    const pendenteValor = calcPendente(r);
    const totalPotencial = arrecadado + pendenteValor;
    const pct = r.total > 0 ? Math.round(sold / r.total * 100) : 0;

    // Conta compradores únicos
    const buyers = new Set(r.sales.map(s => s.name));

    return {
      id: r.id,
      name: r.name,
      emoji: r.emoji,
      prize: r.prize,
      colorIdx: r.colorIdx,
      total: r.total,
      sold,
      paid,
      pending,
      available,
      arrecadado,
      pendenteValor,
      totalPotencial,
      pct,
      buyersCount: buyers.size,
      hasWinner: !!r.winner,
      winner: r.winner,
      date: r.date,
      time: r.time
    };
  }).sort((a, b) => b.arrecadado - a.arrecadado);
}

/* ------------------------------------------------------------
   Ranking de compradores (global)
   ------------------------------------------------------------ */
export function buildBuyersRanking(rifas, limit = 20) {
  const map = {};

  rifas.forEach(r => {
    r.sales.forEach(s => {
      const price = typeof s.price_charged === 'number' ? s.price_charged : r.price;
      if (!map[s.name]) {
        map[s.name] = { name: s.name, count: 0, total: 0, paid: 0, rifas: new Set() };
      }
      map[s.name].count++;
      map[s.name].total += price;
      if (s.paid) map[s.name].paid += price;
      map[s.name].rifas.add(r.name);
    });
  });

  return Object.values(map)
    .map(x => ({
      name: x.name,
      count: x.count,
      total: x.total,
      paid: x.paid,
      rifas: x.rifas.size
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/* ------------------------------------------------------------
   Ranking de vendedores (global)
   ------------------------------------------------------------ */
export function buildSellersRanking(rifas) {
  const map = {};

  rifas.forEach(r => {
    r.sales.forEach(s => {
      const sellerName = s.sold_by_name || 'Você (sem rastreio)';
      const price = typeof s.price_charged === 'number' ? s.price_charged : r.price;
      if (!map[sellerName]) {
        map[sellerName] = {
          name: sellerName,
          count: 0,
          total: 0,
          paid: 0,
          rifas: new Set()
        };
      }
      map[sellerName].count++;
      map[sellerName].total += price;
      if (s.paid) map[sellerName].paid += price;
      map[sellerName].rifas.add(r.name);
    });
  });

  return Object.values(map)
    .map(x => ({
      name: x.name,
      count: x.count,
      total: x.total,
      paid: x.paid,
      rifas: x.rifas.size
    }))
    .sort((a, b) => b.count - a.count);
}

/* ------------------------------------------------------------
   Detalhes de uma rifa específica (drill-down)
   ------------------------------------------------------------ */
export function buildRifaDetailReport(rifa) {
  if (!rifa) return null;

  const sold = countSold(rifa);
  const paid = countPaid(rifa);
  const pending = countPending(rifa);
  const available = countAvailable(rifa);
  const arrecadado = calcArrecadado(rifa);
  const pendenteValor = calcPendente(rifa);
  const totalPotencial = arrecadado + pendenteValor;
  const pct = rifa.total > 0 ? Math.round(sold / rifa.total * 100) : 0;

  // Agrupa por comprador
  const byBuyer = {};
  rifa.sales.forEach(s => {
    if (!byBuyer[s.name]) {
      byBuyer[s.name] = { name: s.name, count: 0, total: 0, paid: 0, pending: 0, nums: [] };
    }
    const price = typeof s.price_charged === 'number' ? s.price_charged : rifa.price;
    byBuyer[s.name].count++;
    byBuyer[s.name].total += price;
    if (s.paid) byBuyer[s.name].paid += price;
    else byBuyer[s.name].pending += price;
    byBuyer[s.name].nums.push(s.num);
  });

  const topBuyers = Object.values(byBuyer)
    .map(b => ({ ...b, nums: b.nums.sort((a, z) => a - z) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Agrupa por vendedor
  const bySeller = {};
  rifa.sales.forEach(s => {
    const name = s.sold_by_name || 'Sem rastreio';
    if (!bySeller[name]) bySeller[name] = { name, count: 0, total: 0 };
    const price = typeof s.price_charged === 'number' ? s.price_charged : rifa.price;
    bySeller[name].count++;
    bySeller[name].total += price;
  });

  const topSellers = Object.values(bySeller).sort((a, b) => b.count - a.count);

  return {
    id: rifa.id,
    name: rifa.name,
    emoji: rifa.emoji,
    prize: rifa.prize,
    colorIdx: rifa.colorIdx,
    image: rifa.image,
    total: rifa.total,
    price: rifa.price,
    date: rifa.date,
    time: rifa.time,
    promo_enabled: rifa.promo_enabled,
    promo_quantity: rifa.promo_quantity,
    promo_price: rifa.promo_price,
    winner: rifa.winner,

    sold, paid, pending, available,
    arrecadado, pendenteValor, totalPotencial,
    pct,
    buyersCount: Object.keys(byBuyer).length,
    sellersCount: Object.keys(bySeller).length,

    topBuyers,
    topSellers
  };
}