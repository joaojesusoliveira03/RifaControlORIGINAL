/* ============================================================
   Rifa Modal — Lógica de Criação, Imagens e Promoção
   ============================================================ */

import { APP } from '../../config/state.js';
import { RIFA_COLORS, RIFA_EMOJIS } from '../../config/constants.js';
import { haptic } from '../../utils/haptic.js';
import { toast } from '../components/toast.js';
import { launchConfetti } from '../components/confetti.js';
import { closeModal } from '../components/modal.js';
import { createRifa, reloadRifas } from '../../services/rifas.service.js';
import { setSyncStatus } from '../../core/auth.js';

/* ------------------------------------------------------------
   Renderizar grids (Emoji e Cor)
   ------------------------------------------------------------ */
function renderEmojiGrid() {
  const g = document.getElementById('emoji-grid');
  if (!g) return;
  const frag = document.createDocumentFragment();

  RIFA_EMOJIS.forEach(e => {
    const b = document.createElement('button');
    b.className = 'emoji-opt' + (e === APP.newRifaEmoji ? ' active' : '');
    b.textContent = e;
    b.onclick = () => {
      APP.newRifaEmoji = e;
      haptic(5);
      renderEmojiGrid();
      updateRifaPreview();
    };
    frag.appendChild(b);
  });

  g.innerHTML = '';
  g.appendChild(frag);
}

function renderRifaColorGrid() {
  const g = document.getElementById('rifa-color-grid');
  if (!g) return;
  const frag = document.createDocumentFragment();

  RIFA_COLORS.forEach((c, i) => {
    const b = document.createElement('button');
    b.className = 'color-opt' + (i === APP.newRifaColor ? ' active' : '');
    b.style.background = `linear-gradient(135deg,${c.c1},${c.c2})`;
    b.onclick = () => {
      APP.newRifaColor = i;
      haptic(5);
      renderRifaColorGrid();
      updateRifaPreview();
    };
    frag.appendChild(b);
  });

  g.innerHTML = '';
  g.appendChild(frag);
}

function renderRifaImageUploader() {
  const el = document.getElementById('rifa-image-uploader');
  if (!el) return;

  if (APP.newRifaImage) {
    el.classList.add('has-image');
    el.innerHTML = `<button class="remove-img" onclick="event.stopPropagation(); window.removeRifaImage()">✕</button><img src="${APP.newRifaImage}">`;
  } else {
    el.classList.remove('has-image');
    el.innerHTML = `<div class="up-icon">🖼️</div><div class="up-text">Toque para escolher</div><div class="up-hint">Do prêmio, do item, do que quiser</div>`;
  }
}

/* ------------------------------------------------------------
   NOVO SISTEMA DE PACOTES PROMOCIONAIS
   ------------------------------------------------------------ */

export function renderPromoList() {
  const container = document.getElementById('promo-list-container');
  if (!container) return;

  container.innerHTML = '';
  
  if (!APP.newRifaPromos) APP.newRifaPromos = [];

  APP.newRifaPromos.forEach((promo, index) => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex; align-items:center; gap:8px; background:var(--card2); padding:10px; border-radius:12px; border:1px solid var(--border);';
    
    row.innerHTML = `
      <span style="font-size:11px; font-weight:700; color:var(--muted); white-space:nowrap;">Leve</span>
      <input type="number" min="2" value="${promo.quantity}" onchange="window.updatePromoItem(${index}, 'quantity', this.value)" style="width:60px; padding:8px; text-align:center; border-radius:8px; border:1px solid var(--border); background:var(--card); font-weight:800; color:var(--text);">
      <span style="font-size:11px; font-weight:700; color:var(--muted); white-space:nowrap;">por R$</span>
      <input type="number" min="0.01" step="0.01" value="${promo.price}" onchange="window.updatePromoItem(${index}, 'price', this.value)" style="width:80px; padding:8px; text-align:center; border-radius:8px; border:1px solid var(--border); background:var(--card); font-weight:800; color:var(--text);">
      <button type="button" onclick="window.removePromoItem(${index})" style="margin-left:auto; background:none; border:none; color:var(--danger); font-size:16px; cursor:pointer;">✕</button>
    `;
    container.appendChild(row);
  });
}

export function addPromoRow() {
  if (!APP.newRifaPromos) APP.newRifaPromos = [];
  APP.newRifaPromos.push({ quantity: 3, price: 10 });
  haptic(5);
  renderPromoList();
  updatePromoSummary();
}

export function removePromoItem(index) {
  APP.newRifaPromos.splice(index, 1);
  haptic(5);
  renderPromoList();
  updatePromoSummary();
}

export function updatePromoItem(index, field, value) {
  APP.newRifaPromos[index][field] = parseFloat(value) || 0;
  updatePromoSummary();
}

export function updatePromoSummary() {
  const price = parseFloat(document.getElementById('in-rifa-price')?.value) || 0;
  const el = document.getElementById('promo-summary');
  if (!el) return;

  if (!APP.newRifaPromos || APP.newRifaPromos.length === 0) {
    el.style.display = 'none';
    return;
  }

  let html = '<div style="font-size:10px; font-weight:800; color:var(--muted); margin-bottom:6px; text-transform:uppercase;">Pacotes Ativos</div>';
  
  APP.newRifaPromos.forEach(p => {
    if (p.quantity < 2 || p.price <= 0) return;
    const unitPromo = p.price / p.quantity;
    const saving = price - unitPromo;
    const pct = price > 0 ? Math.round((saving / price) * 100) : 0;
    
    if (saving > 0) {
      html += `<div style="display:flex; justify-content:space-between; align-items:center; padding:4px 0; border-bottom:1px dashed rgba(255,255,255,0.1);">
        <span style="font-size:12px;">🎁 <b>${p.quantity} cotas</b> por R$ ${p.price.toFixed(2)}</span>
        <span style="font-size:11px; color:var(--success); font-weight:700;">-${pct}%</span>
      </div>`;
    } else {
      html += `<div style="padding:4px 0; font-size:11px; color:var(--warning);">⚠️ O pacote de ${p.quantity} unidades não tem desconto.</div>`;
    }
  });

  el.innerHTML = html;
  el.style.display = 'block';
}

/* ------------------------------------------------------------
   Preview e Salvar
   ------------------------------------------------------------ */
export function updateRifaPreview() {
  const nameEl = document.getElementById('in-rifa-name');
  const prizeEl = document.getElementById('in-rifa-prize');
  const priceEl = document.getElementById('in-rifa-price');
  const totalEl = document.getElementById('in-rifa-total');
  
  if (!nameEl || !prizeEl || !priceEl || !totalEl) return;

  const name = nameEl.value.trim() || 'Nome da Rifa';
  const prize = prizeEl.value.trim() || 'Prêmio';
  const price = parseFloat(priceEl.value) || 0;
  const total = parseInt(totalEl.value) || 0;

  const elName = document.getElementById('preview-name');
  const elPrize = document.getElementById('preview-prize');
  const elPrice = document.getElementById('preview-price');
  const elTotal = document.getElementById('preview-total');
  const elAvatar = document.getElementById('preview-avatar');

  if (elName) elName.textContent = name;
  if (elPrize) elPrize.textContent = prize;
  
  if (elPrice) {
    if (APP.newRifaPromos && APP.newRifaPromos.length > 0 && APP.newRifaPromos[0].price > 0) {
      const p = APP.newRifaPromos[0];
      elPrice.innerHTML = `R$ ${price.toFixed(2)} <span class="promo-tag">🎁 ${p.quantity} por R$ ${p.price.toFixed(2)}</span>`;
    } else {
      elPrice.textContent = `R$ ${price.toFixed(2)} por número`;
    }
  }
  
  if (elTotal) elTotal.innerHTML = `🎯 0/${total}`;
  
  if (elAvatar) {
    elAvatar.textContent = APP.newRifaEmoji || '🎟️';
    const c = RIFA_COLORS[APP.newRifaColor || 0];
    elAvatar.style.background = `linear-gradient(135deg, ${c.c1}, ${c.c2})`;
    
    const previewCard = document.getElementById('preview-card');
    if (previewCard) previewCard.style.setProperty('--card-color', c.c2);
  }
}

export function openRifaModal() {
  haptic(8);

  ['in-rifa-name', 'in-rifa-prize', 'in-rifa-price', 'in-rifa-date'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  const total = document.getElementById('in-rifa-total');
  if (total) total.value = '100';
  const time = document.getElementById('in-rifa-time');
  if (time) time.value = '20:00';

  APP.newRifaEmoji = '🎟️';
  APP.newRifaColor = 0;
  APP.newRifaImage = null;
  APP.newRifaPromos = []; // Zera os pacotes

  renderEmojiGrid();
  renderRifaColorGrid();
  renderRifaImageUploader();
  renderPromoList();
  updatePromoSummary();
  updateRifaPreview();

  const modal = document.getElementById('modal-rifa');
  if (modal) modal.classList.add('show');
}

export async function saveRifa() {
  const name = document.getElementById('in-rifa-name').value.trim();
  const prize = document.getElementById('in-rifa-prize').value.trim();
  const price = parseFloat(document.getElementById('in-rifa-price').value) || 0;
  const total = parseInt(document.getElementById('in-rifa-total').value) || 0;
  const date = document.getElementById('in-rifa-date').value;
  const time = document.getElementById('in-rifa-time').value;

  if (!name) { toast('⚠️ Informe o nome'); haptic(50); return; }
  if (total <= 0) { toast('⚠️ Informe a qtd de números'); haptic(50); return; }

  // Limpa pacotes inválidos
  const validPromos = (APP.newRifaPromos || []).filter(p => p.quantity >= 2 && p.price > 0);

  setSyncStatus('syncing', 'Salvando...');

  try {
    await createRifa({
      name, prize: prize || '—', price, total, date, time,
      emoji: APP.newRifaEmoji,
      colorIdx: APP.newRifaColor,
      image: APP.newRifaImage,
      promos: validPromos // Envia o array de pacotes
    });

    closeModal('modal-rifa');
    await reloadRifas();

    const { renderHome } = await import('../screens/home.screen.js');
    renderHome();

    setSyncStatus('', 'Sincronizado');
    haptic([10, 30, 10]);
    launchConfetti('small');
    toast('✨ Rifa criada!');
  } catch (err) {
    console.error(err);
    setSyncStatus('error', 'Erro');
    toast('❌ Erro ao salvar');
    haptic(50);
  }
}

/* ------------------------------------------------------------
   Imagens
   ------------------------------------------------------------ */
export function triggerImageUpload(ctx) {
  if (ctx === 'rifa') document.getElementById('rifa-image-input')?.click();
  else if (ctx === 'edit') document.getElementById('edit-image-input')?.click();
}

export function handleImageUpload(event, ctx) {
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { toast('⚠️ Imagem inválida'); return; }
  if (file.size > 3 * 1024 * 1024) { toast('⚠️ Máx 3MB'); haptic(50); return; }

  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    if (ctx === 'rifa') {
      APP.newRifaImage = dataUrl;
      renderRifaImageUploader();
      toast('🖼️ Carregada!');
    }
    haptic([10, 30, 10]);
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

export function promptImageUrl(ctx) {
  const url = prompt('Cole a URL da imagem:');
  if (!url) return;
  const trimmed = url.trim();
  if (!trimmed) return;
  if (ctx === 'rifa') {
    APP.newRifaImage = trimmed;
    renderRifaImageUploader();
    toast('🖼️ OK!');
  }
}

export function removeRifaImage() {
  APP.newRifaImage = null;
  renderRifaImageUploader();
  toast('Removida');
  haptic(10);
}

/* ------------------------------------------------------------
   Funções Antigas de Edição (Restauradas para a tela Info)
   ------------------------------------------------------------ */
export function openEditImageModal() {
  haptic(8);
  const r = APP.currentRifa;
  if (!r) return;
  
  const el = document.getElementById('modal-edit-image');
  if (el) el.classList.add('show');
}

export function removeEditImage() {
  const r = APP.currentRifa;
  if (!r) return;
  r.image = null;
  
  import('../../services/rifas.service.js').then(async m => {
    await m.saveRifaCloud(r);
    const { renderRifa } = await import('../screens/rifa.screen.js');
    renderRifa();
    import('../components/modal.js').then(m => m.closeModal('modal-edit-image'));
    toast('Imagem removida');
  });
}

export function handleEditImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    const r = APP.currentRifa;
    if (!r) return;
    r.image = dataUrl;
    
    import('../../services/rifas.service.js').then(async m => {
      await m.saveRifaCloud(r);
      const { renderRifa } = await import('../screens/rifa.screen.js');
      renderRifa();
      import('../components/modal.js').then(m => m.closeModal('modal-edit-image'));
      toast('Imagem atualizada!');
      haptic([10, 30, 10]);
    });
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

export function promptEditImageUrl() {
  const url = prompt('Cole a URL da imagem:');
  if (!url) return;
  const r = APP.currentRifa;
  if (!r) return;
  
  r.image = url.trim();
  import('../../services/rifas.service.js').then(async m => {
    await m.saveRifaCloud(r);
    const { renderRifa } = await import('../screens/rifa.screen.js');
    renderRifa();
    import('../components/modal.js').then(m => m.closeModal('modal-edit-image'));
    toast('Imagem atualizada!');
  });
}

export function openEditPromoModal() {
  haptic(8);
  const r = APP.currentRifa;
  if (!r) return;

  const box = document.getElementById('edit-promo-box');
  const sw = document.getElementById('edit-promo-switch');
  
  const qty = document.getElementById('edit-promo-qty');
  const price = document.getElementById('edit-promo-price');

  const currentPromo = r.promos && r.promos.length > 0 ? r.promos[0] : null;

  if (currentPromo) {
    if (qty) qty.value = currentPromo.quantity;
    if (price) price.value = currentPromo.price;
    if (box) box.classList.remove('disabled');
    if (sw) sw.classList.add('on');
  } else {
    if (qty) qty.value = 10;
    if (price) price.value = 10;
    if (box) box.classList.add('disabled');
    if (sw) sw.classList.remove('on');
  }

  const el = document.getElementById('modal-edit-promo');
  if (el) el.classList.add('show');
}

export function toggleEditPromo() {
  const box = document.getElementById('edit-promo-box');
  const sw = document.getElementById('edit-promo-switch');
  if (box) box.classList.toggle('disabled');
  if (sw) sw.classList.toggle('on');
  haptic(5);
}

export function updateEditPromoSummary() {
  // Função vazia apenas para não dar erro de referência no HTML
}

export async function saveEditPromo() {
  const r = APP.currentRifa;
  if (!r) return;

  const qty = parseInt(document.getElementById('edit-promo-qty')?.value) || 0;
  const price = parseFloat(document.getElementById('edit-promo-price')?.value) || 0;
  const isEnabled = document.getElementById('edit-promo-switch')?.classList.contains('on');

  if (isEnabled && qty >= 2 && price > 0) {
    r.promos = [{ quantity: qty, price: price }];
  } else {
    r.promos = [];
  }

  try {
    const { saveRifaCloud } = await import('../../services/rifas.service.js');
    await saveRifaCloud(r);
    
    import('../components/modal.js').then(m => m.closeModal('modal-edit-promo'));
    const { renderRifa } = await import('../screens/rifa.screen.js');
    renderRifa();
    toast('✅ Promoção atualizada!');
    haptic([10, 30, 10]);
  } catch (err) {
    toast('❌ Erro ao salvar');
  }
}