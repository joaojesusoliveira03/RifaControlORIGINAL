/* ============================================================
   Sale Modal — registrar venda, aleatórios, toggle pagamento
   ============================================================ */

import { APP } from '../../config/state.js';
import { haptic } from '../../utils/haptic.js';
import { toast } from '../components/toast.js';
import { launchConfetti } from '../components/confetti.js';
import { closeModal } from '../components/modal.js';
import { saveRifaCloud, getRifa } from '../../services/rifas.service.js';
import {
  calcSaleCost, markAllPaidFor, getAvailableNumbers
} from '../../services/sales.service.js';
import { formatBRL } from '../../utils/format.js';

/* ------------------------------------------------------------
   Abrir modal de nova venda
   ------------------------------------------------------------ */
export function openSaleModal() {
  haptic(8);

  ['in-sale-name', 'in-sale-phone', 'in-sale-nums'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  selectPay('pending');

  const calc = document.getElementById('sale-calc');
  if (calc) calc.classList.remove('show');

  updateRandomHint();

  const modal = document.getElementById('modal-sale');
  if (modal) modal.classList.add('show');

  setTimeout(() => {
    const name = document.getElementById('in-sale-name');
    if (name) name.focus();
  }, 300);
}

/* ------------------------------------------------------------
   Status pagamento
   ------------------------------------------------------------ */
export function selectPay(p) {
  APP.salePay = p;
  haptic(5);

  const paid = document.getElementById('pay-paid');
  const pending = document.getElementById('pay-pending');

  if (paid) {
    paid.style.background = p === 'paid' ? 'var(--primary)' : 'var(--bg2)';
    paid.style.color = p === 'paid' ? '#fff' : 'var(--text)';
  }
  if (pending) {
    pending.style.background = p === 'pending' ? 'var(--primary)' : 'var(--bg2)';
    pending.style.color = p === 'pending' ? '#fff' : 'var(--text)';
  }
}

/* ------------------------------------------------------------
   Cálculo
   ------------------------------------------------------------ */
export function updateSaleCalc() {
  const input = document.getElementById('in-sale-nums');
  const calc = document.getElementById('sale-calc');
  if (!input || !calc) return;

  const r = APP.currentRifa;
  if (!r) return;

  const numsStr = input.value.trim();
  if (!numsStr) {
    calc.classList.remove('show');
    return;
  }

  const nums = numsStr.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
  if (nums.length === 0) {
    calc.classList.remove('show');
    return;
  }

  const result = calcSaleCost(nums.length, r);

  let html = '';
  result.faixas.forEach(f => {
    const label = f.isPromo
      ? `🎁 ${f.qty} × ${formatBRL(f.unitPrice)}`
      : `${f.qty} × ${formatBRL(f.unitPrice)}`;
    html += `<div class="sale-calc-row"><span>${label}</span><span class="val">${formatBRL(f.subtotal)}</span></div>`;
  });

  html += `<div class="sale-calc-divider"></div>`;
  html += `<div class="sale-calc-total"><span>💵 TOTAL</span><span class="val">${formatBRL(result.total)}</span></div>`;

  if (result.savings > 0) {
    const pct = Math.round((result.savings / result.semPromo) * 100);
    html += `<div class="sale-calc-saving">🎁 Você economizou ${formatBRL(result.savings)} <span class="pct">-${pct}%</span></div>`;
  }

  calc.innerHTML = html;
  calc.classList.add('show');
}

/* ------------------------------------------------------------
   Hint de números disponíveis
   ------------------------------------------------------------ */
export function updateRandomHint() {
  const el = document.getElementById('random-hint');
  if (!el) return;

  const r = APP.currentRifa;
  if (!r) { el.textContent = ''; return; }

  const available = getAvailableNumbers(r).length;
  el.textContent = `${available} disponíveis`;
}

/* ------------------------------------------------------------
   Números aleatórios
   ------------------------------------------------------------ */
export function openRandomNumbersModal() {
  haptic(8);

  const r = APP.currentRifa;
  if (!r) return;

  const available = getAvailableNumbers(r).length;
  if (available === 0) {
    toast('⚠️ Todos vendidos');
    return;
  }

  const input = document.getElementById('in-random-count');
  if (input) {
    input.value = '';
    input.max = available;
  }

  const hint = document.getElementById('random-hint');
  if (hint) hint.textContent = `${available} disponíveis`;

  const modal = document.getElementById('modal-random');
  if (modal) modal.classList.add('show');

  setTimeout(() => input?.focus(), 300);
}

export function confirmRandomNumbers() {
  const r = APP.currentRifa;
  if (!r) return;

  const input = document.getElementById('in-random-count');
  const count = parseInt(input?.value);
  if (!count || count < 1) {
    toast('⚠️ Informe a quantidade');
    haptic(50);
    return;
  }

  const available = getAvailableNumbers(r);
  if (count > available.length) {
    toast(`⚠️ Só tem ${available.length}`);
    haptic(50);
    return;
  }

  const selected = [];
  const pool = [...available];
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    selected.push(pool.splice(idx, 1)[0]);
  }
  selected.sort((a, b) => a - b);

  const numsInput = document.getElementById('in-sale-nums');
  const current = numsInput.value.trim();
  const currentNums = current
    ? current.split(',').map(n => n.trim()).filter(n => n && !isNaN(parseInt(n))).map(n => parseInt(n))
    : [];

  const all = [...currentNums, ...selected];
  numsInput.value = all.join(', ');

  closeModal('modal-random');
  haptic([10, 30, 10]);
  updateSaleCalc();
  toast(`🎲 ${count} aleatório${count > 1 ? 's' : ''}`);
}

/* ------------------------------------------------------------
   Salvar venda
   ------------------------------------------------------------ */
export async function saveSale() {
  const name = document.getElementById('in-sale-name').value.trim();
  const phone = document.getElementById('in-sale-phone').value.trim();
  const numsStr = document.getElementById('in-sale-nums').value.trim();

  if (!name) { toast('⚠️ Informe o nome'); haptic(50); return; }
  if (!numsStr) { toast('⚠️ Informe os números'); haptic(50); return; }

  const nums = numsStr.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
  if (nums.length === 0) {
    toast('⚠️ Números inválidos');
    haptic(50);
    return;
  }

  const r = APP.currentRifa;
  const existing = new Set(r.sales.map(s => s.num));

  const invalids = nums.filter(n => n < 1 || n > r.total);
  const dups = nums.filter(n => existing.has(n));

  if (invalids.length > 0) {
    toast(`⚠️ Inválidos: ${invalids.join(', ')}`);
    haptic(50);
    return;
  }
  if (dups.length > 0) {
    toast(`⚠️ Já vendidos: ${dups.join(', ')}`);
    haptic(50);
    return;
  }

  const unique = [...new Set(nums)];
  unique.sort((a, b) => a - b);

  const result = calcSaleCost(unique.length, r);
  const unitEffective = result.total / unique.length;

  const timestamp = Date.now();
  const soldAt = new Date().toISOString();
  const sellerName = APP.profile?.name || APP.user.email;
  const sellerId = APP.user.id;
  const sellerEmail = APP.user.email;

  unique.forEach((num, i) => {
    r.sales.push({
      id: timestamp + i,
      num,
      name,
      phone,
      paid: APP.salePay === 'paid',
      date: soldAt,
      price_charged: unitEffective,
      promo_applied: result.promoApplied,
      promo_savings: result.savings / unique.length,
      promo_config: r.promo_enabled ? { quantity: r.promo_quantity, price: r.promo_price } : null,
      sold_by_id: sellerId,
      sold_by_name: sellerName,
      sold_by_email: sellerEmail
    });
  });

  try {
    await saveRifaCloud(r);
    const idx = APP.rifas.findIndex(x => x.id === r.id);
    if (idx >= 0) APP.rifas[idx] = r;

    closeModal('modal-sale');

    const { renderRifa } = await import('../screens/rifa.screen.js');
    renderRifa();

    haptic([10, 30, 10]);
    launchConfetti('small');

    let msg = `✅ ${unique.length} número${unique.length > 1 ? 's' : ''} vendido${unique.length > 1 ? 's' : ''}!`;
    if (result.savings > 0) msg += ` 🎁 -${formatBRL(result.savings)}`;
    toast(msg, 3000);
  } catch (err) {
    console.error(err);
    toast('❌ Erro ao salvar');
  }
}

/* ------------------------------------------------------------
   Toggle pago
   ------------------------------------------------------------ */
export async function togglePaid(sid) {
  const r = APP.currentRifa;
  const s = r.sales.find(x => x.id === sid);
  if (!s) return;

  s.paid = !s.paid;
  haptic(s.paid ? [10, 30, 10] : 10);

  if (s.paid) launchConfetti('small');

  try {
    await saveRifaCloud(r);
    const idx = APP.rifas.findIndex(x => x.id === r.id);
    if (idx >= 0) APP.rifas[idx] = r;

    const { renderRifa } = await import('../screens/rifa.screen.js');
    renderRifa();
  } catch (err) {
    toast('❌ Erro ao salvar');
  }
}

/* ------------------------------------------------------------
   Marcar tudo pago (de um comprador)
   ------------------------------------------------------------ */
export async function markAllPaid(buyerName) {
  const r = APP.currentRifa;
  if (!r) return;

  const count = markAllPaidFor(r, buyerName);
  if (count === 0) return;

  try {
    await saveRifaCloud(r);
    const idx = APP.rifas.findIndex(x => x.id === r.id);
    if (idx >= 0) APP.rifas[idx] = r;

    const { renderRifa } = await import('../screens/rifa.screen.js');
    renderRifa();

    haptic([20, 40, 20]);
    launchConfetti('small');
    toast(`✅ ${count} pago${count > 1 ? 's' : ''}!`);
  } catch (err) {
    toast('❌ Erro ao salvar');
  }
}

/* ------------------------------------------------------------
   Abrir modal já com nome de comprador
   ------------------------------------------------------------ */
export function addNumbersToBuyer(name, phone) {
  haptic(8);
  openSaleModal();

  const nameEl = document.getElementById('in-sale-name');
  if (nameEl) nameEl.value = name;

  if (phone) {
    const phoneEl = document.getElementById('in-sale-phone');
    if (phoneEl) phoneEl.value = phone;
  }

  updateRandomHint();
}