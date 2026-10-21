/* ============================================================
   Sales Service — cálculos de venda, arrecadação, pagamentos
   ============================================================ */

export function calcSaleCost(totalNums, rifa) {
  const price = rifa?.price || 0;
  const promos = rifa?.promos || [];

  // Se não tem promoção, cobra o valor cheio
  if (!rifa || !promos || promos.length === 0) {
    return {
      total: totalNums * price,
      faixas: [{ qty: totalNums, unitPrice: price, subtotal: totalNums * price, isPromo: false }],
      savings: 0,
      promoApplied: false,
      semPromo: totalNums * price
    };
  }

  // Algoritmo guloso: pega os pacotes que dão o maior desconto por cota primeiro
  const sortedPromos = [...promos].sort((a, b) => {
    const unitA = a.price / a.quantity;
    const unitB = b.price / b.quantity;
    return unitA - unitB;
  });

  let remaining = totalNums;
  let total = 0;
  const faixas = [];

  for (const promo of sortedPromos) {
    if (remaining >= promo.quantity) {
      const qtyPacks = Math.floor(remaining / promo.quantity);
      const qtyNums = qtyPacks * promo.quantity;
      const subtotal = qtyPacks * promo.price;
      
      faixas.push({
        qty: qtyNums,
        unitPrice: promo.price / promo.quantity,
        subtotal: subtotal,
        isPromo: true
      });
      
      total += subtotal;
      remaining -= qtyNums;
    }
  }

  if (remaining > 0) {
    const subtotal = remaining * price;
    faixas.push({
      qty: remaining,
      unitPrice: price,
      subtotal: subtotal,
      isPromo: false
    });
    total += subtotal;
  }

  const semPromo = totalNums * price;
  return {
    total,
    faixas,
    savings: semPromo - total,
    promoApplied: total < semPromo,
    semPromo
  };
}

export function calcArrecadado(rifa) {
  if (!rifa) return 0;
  let total = 0;
  rifa.sales.forEach(s => {
    if (!s.paid) return;
    total += typeof s.price_charged === 'number' ? s.price_charged : rifa.price;
  });
  return total;
}

export function calcPendente(rifa) {
  if (!rifa) return 0;
  let total = 0;
  rifa.sales.forEach(s => {
    if (s.paid) return;
    total += typeof s.price_charged === 'number' ? s.price_charged : rifa.price;
  });
  return total;
}

export function calcTotal(rifa) {
  return calcArrecadado(rifa) + calcPendente(rifa);
}

export function countSold(rifa) {
  if (!rifa) return 0;
  return new Set(rifa.sales.map(s => s.num)).size;
}

export function countPaid(rifa) {
  if (!rifa) return 0;
  return new Set(rifa.sales.filter(s => s.paid).map(s => s.num)).size;
}

export function countPending(rifa) {
  return countSold(rifa) - countPaid(rifa);
}

export function countAvailable(rifa) {
  if (!rifa) return 0;
  return rifa.total - countSold(rifa);
}

export function getSoldNumbers(rifa) {
  if (!rifa) return new Set();
  return new Set(rifa.sales.map(s => s.num));
}

export function getPaidNumbers(rifa) {
  if (!rifa) return new Set();
  return new Set(rifa.sales.filter(s => s.paid).map(s => s.num));
}

export function getAvailableNumbers(rifa) {
  if (!rifa) return [];
  const sold = getSoldNumbers(rifa);
  const available = [];
  for (let i = 1; i <= rifa.total; i++) {
    if (!sold.has(i)) available.push(i);
  }
  return available;
}

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

  Object.values(grouped).forEach(g => g.sales.sort((a, b) => a.num - b.num));

  return grouped;
}

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