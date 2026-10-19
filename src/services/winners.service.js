/* ============================================================
   Winners Service — sorteio e definição de ganhador
   ============================================================ */

/**
 * Sorteia um número aleatório entre os vendidos.
 * Retorna { num, name, phone, sale } ou null se não houver vendas.
 */
export function pickRandomWinner(rifa) {
  if (!rifa || rifa.sales.length === 0) return null;
  const nums = [...new Set(rifa.sales.map(s => s.num))];
  const num = nums[Math.floor(Math.random() * nums.length)];
  const sale = rifa.sales.find(s => s.num === num);
  return { num, name: sale.name, phone: sale.phone || '', sale };
}

/**
 * Monta o objeto de ganhador oficial (com data ISO).
 */
export function buildWinnerRecord({ num, name, phone }) {
  return {
    num,
    name,
    phone: phone || '',
    date: new Date().toISOString()
  };
}

/**
 * Valida se um número pode ser definido como ganhador.
 * Retorna { ok: boolean, error?: string, sale?: object }
 */
export function validateWinnerNumber(rifa, num) {
  if (!rifa) return { ok: false, error: 'Rifa não encontrada' };
  if (!num || isNaN(num)) return { ok: false, error: 'Informe um número' };
  if (num < 1 || num > rifa.total) {
    return { ok: false, error: 'Número fora do intervalo da rifa' };
  }
  const sale = rifa.sales.find(s => s.num === num);
  if (!sale) return { ok: false, error: 'Esse número não foi vendido' };
  return { ok: true, sale };
}