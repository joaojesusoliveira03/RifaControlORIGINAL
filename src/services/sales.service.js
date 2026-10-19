/* ============================================================
   Sales Service — cálculos de venda, arrecadação, pagamentos
   ============================================================ */

/**
 * Calcula o custo total de uma venda considerando promoção.
 * Retorna as faixas aplicadas, total, economia e flags.
 */
export function calcSaleCost(totalNums, rifa) {
  if (!rifa || !rifa.promo_enabled || !rifa.promo_quantity || !rifa.promo_price) {
    return {
      total: totalNums * rifa.price,
      faixas: [{ qty: totalNums, unitPrice: rifa.price, subtotal: totalNums * rifa.price }],
      savings: 0,
      promoApplied: false,
      semPromo: totalNums * rifa.price
    };
  }

  const promoQty = rifa.promo_quantity;
  const promoPrice = rifa.promo_price;
  const unitPrice = rifa.price;

  const promoBundles = Math.floor(totalNums / promoQty);
  const remainder = totalNums % promoQty;

  const faixas = [];
  let total = 0;

  if (promoBundles > 0) {
    const sub = promoBundles * promoPrice;
    faixas.push({
      qty: promoBundles * promoQty,
      unitPrice: promoPrice / promoQty,
      subtotal: sub,
      isPromo: true
    });
    total += sub;
  }

  if (remainder > 0) {
    const sub = remainder * unitPrice;
    faixas.push({
      qty: remainder,
      unitPrice,
      subtotal: sub,
      isPromo: false
    });
    total += sub;
  }

  const semPromo = totalNums * unitPrice;
  return {
    total,
    faixas,
    savings: semPromo - total,
    promoApplied: promoBundles > 0,
    semPromo
  };
}

/**
 * Retorna o valor efetivamente arrecadado (somente pagos).
 */
export function calcArrecadado(rifa) {
  if (!rifa) return 0;
  let total = 0;
  rifa.sales.forEach(s => {
    if (!s.paid) return;
    total += typeof s.price_charged === 'number' ? s.price_charged : rifa.price;
  });
  return total;
}

/**
 * Retorna o valor pendente (vendas não pagas).
 */
export function calcPendente(rifa) {
  if (!rifa) return 0;
  let total = 0;
  rifa.sales.forEach(s => {
    if (s.paid) return;
    total += typeof s.price_charged === 'number' ? s.price_charged : rifa.price;
  });
  return total;
}

/**
 * Retorna o valor total (pago + pendente).
 */
export function calcTotal(rifa) {
  return calcArrecadado(rifa) + calcPendente(rifa);
}

/**
 * Conta quantos números únicos foram vendidos.
 */
export function countSold(rifa) {
  if (!rifa) return 0;
  return new Set(rifa.sales.map(s => s.num)).size;
}

/**
 * Conta quantos números únicos estão pagos.
 */
export function countPaid(rifa) {
  if (!rifa) return 0;
  return new Set(rifa.sales.filter(s => s.paid).map(s => s.num)).size;
}

/**
 * Conta quantos números estão pendentes (vendidos mas não pagos).
 */
export function countPending(rifa) {
  return countSold(rifa) - countPaid(rifa);
}

/**
 * Conta quantos números estão livres.
 */
export function countAvailable(rifa) {
  if (!rifa) return 0;
  return rifa.total - countSold(rifa);
}

/**
 * Retorna set de números vendidos.
 */
export function getSoldNumbers(rifa) {
  if (!rifa) return new Set();
  return new Set(rifa.sales.map(s => s.num));
}

/**
 * Retorna set de números pagos.
 */
export function getPaidNumbers(rifa) {
  if (!rifa) return new Set();
  return new Set(rifa.sales.filter(s => s.paid).map(s => s.num));
}

/**
 * Retorna array de números disponíveis (não vendidos).
 */
export function getAvailableNumbers(rifa) {
  if (!rifa) return [];
  const sold = getSoldNumbers(rifa);
  const available = [];
  for (let i = 1; i <= rifa.total; i++) {
    if (!sold.has(i)) available.push(i);
  }
  return available;
}

/**
 * Marca todas as vendas de um comprador como pagas (in-place).
 * Retorna quantas foram alteradas.
 */
export function markAllPaidFor(rifa, buyerName) {
  if (!rifa) return 0;
  let count = 0;
  rifa.sales.forEach(s => {
    if (s.name === buyerName && !s.paid) {
      s.paid = true;
      count++;
    }
  });
  return count;
}

/**
 * Agrupa vendas por comprador.
 * Retorna { [name]: { name, phone, sales: [], totalPaid, totalPending, valuePaid, valuePending, hasWinner } }
 */
export function groupSalesByBuyer(rifa) {
  if (!rifa) return {};
  const grouped = {};

  rifa.sales.forEach(s => {
    if (!grouped[s.name]) {
      grouped[s.name] = {
        name: s.name,
        phone: s.phone || '',
        sales: [],
        totalPaid: 0,
        totalPending: 0,
        valuePaid: 0,
        valuePending: 0,
        hasWinner: false
      };
    }
    const g = grouped[s.name];
    g.sales.push(s);
    if (s.phone && !g.phone) g.phone = s.phone;

    const price = typeof s.price_charged === 'number' ? s.price_charged : rifa.price;
    if (s.paid) { g.totalPaid++; g.valuePaid += price; }
    else        { g.totalPending++; g.valuePending += price; }

    if (rifa.winner && rifa.winner.num === s.num) g.hasWinner = true;
  });

  // Ordena números dentro de cada comprador
  Object.values(grouped).forEach(g => g.sales.sort((a, b) => a.num - b.num));

  return grouped;
}

/**
 * Gera os dados completos de um comprador (pra tela buyer).
 */
export function buildBuyerData(rifa, buyerName) {
  if (!rifa) return null;
  const sales = rifa.sales.filter(s => s.name === buyerName);
  if (sales.length === 0) return null;

  sales.sort((a, b) => a.num - b.num);

  let valuePaid = 0, valuePending = 0, totalSavings = 0;
  sales.forEach(s => {
    const p = typeof s.price_charged === 'number' ? s.price_charged : rifa.price;
    if (s.paid) valuePaid += p; else valuePending += p;
    if (s.promo_savings) totalSavings += s.promo_savings;
  });

  const sellers = [...new Set(sales.map(s => s.sold_by_name).filter(Boolean))];

  return {
    name: buyerName,
    phone: sales[0].phone || '',
    sales,
    total: sales.length,
    totalPaid: sales.filter(s => s.paid).length,
    totalPending: sales.filter(s => !s.paid).length,
    valuePaid,
    valuePending,
    totalValue: valuePaid + valuePending,
    totalSavings,
    sellers,
    hasWinner: sales.some(s => rifa.winner && rifa.winner.num === s.num)
  };
}