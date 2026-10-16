/* ============================================================
   Reports Service — agregações para os relatórios
   ============================================================ */

import { calcArrecadado, calcPendente, countSold } from './sales.service.js';

/**
 * Relatório geral: soma de tudo.
 */
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

  return {
    arrecadado,
    pendente,
    vendidos,
    disponiveis,
    comGanhador,
    totalRifas: rifas.length,
    pctVendido: pct,
    totalNumeros
  };
}

/**
 * Ranking de compradores por quantidade de cotas.
 */
export function buildBuyersRanking(rifas, limit = 20) {
  const map = {};

  rifas.forEach(r => {
    r.sales.forEach(s => {
      const price = typeof s.price_charged === 'number' ? s.price_charged : r.price;
      if (!map[s.name]) {
        map[s.name] = { name: s.name, count: 0, total: 0, rifas: new Set() };
      }
      map[s.name].count++;
      map[s.name].total += price;
      map[s.name].rifas.add(r.name);
    });
  });

  return Object.values(map)
    .map(x => ({ name: x.name, count: x.count, total: x.total, rifas: x.rifas.size }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Ranking de vendedores por quantidade de cotas.
 */
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
    .map(x => ({ name: x.name, count: x.count, total: x.total, paid: x.paid, rifas: x.rifas.size }))
    .sort((a, b) => b.count - a.count);
}