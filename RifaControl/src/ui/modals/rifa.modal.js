/* ============================================================
   Rifa Modal — criar nova rifa
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
   Render grids
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
   Promoção
   ------------------------------------------------------------ */
function togglePromo() {
  APP.newRifaPromoEnabled = !APP.newRifaPromoEnabled;
  const box = document.getElementById('promo-box');
  const sw = document.getElementById('promo-switch');
  if (box) box.classList.toggle('disabled', !APP.newRifaPromoEnabled);
  if (sw) sw.classList.toggle('on', APP.newRifaPromoEnabled);
  haptic(8);
  updatePromoSummary();
}

function updatePromoSummary() {
  const price = parseFloat(document.getElementById('in-rifa-price')?.value) || 0;
  const qty = parseInt(document.getElementById('promo-qty')?.value) || 0;
  const promoPrice = parseFloat(document.getElementById('promo-price')?.value) || 0;
  const el = document.getElementById('promo-summary');
  if (!el) return;

  if (!APP.newRifaPromoEnabled) {
    el.innerHTML = '💡 Ative para configurar';
    return;
  }
  if (qty < 2 || promoPrice <= 0 || price <= 0) {
    el.innerHTML = '⚠️ Preencha os valores';
    return;
  }

  const unitPromo = promoPrice / qty;
  const saving = price - unitPromo;
  const pct = price > 0 ? Math.round((saving / price) * 100) : 0;

  if (saving <= 0) {
    el.innerHTML = `⚠️ A promoção não dá desconto`;
    return;
  }

  el.innerHTML = `💡 Cada número sai por <strong>R$ ${unitPromo.toFixed(2)}</strong><span class="save-badge">-${pct}%</span><br><span style="font-size:11px;color:var(--muted);">Economia de R$ ${saving.toFixed(2)} por número</span>`;
}

/* ------------------------------------------------------------
   Abrir modal
   ------------------------------------------------------------ */
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
  const pq = document.getElementById('promo-qty');
  if (pq) pq.value = '10';
  const pp = document.getElementById('promo-price');
  if (pp) pp.value = '10';

  APP.newRifaEmoji = '🎟️';
  APP.newRifaColor = 0;
  APP.newRifaImage = null;
  APP.newRifaPromoEnabled = false;

  const box = document.getElementById('promo-box');
  if (box) box.classList.add('disabled');
  const sw = document.getElementById('promo-switch');
  if (sw) sw.classList.remove('on');

  renderEmojiGrid();
  renderRifaColorGrid();
  renderRifaImageUploader();
  updatePromoSummary();

  const modal = document.getElementById('modal-rifa');
  if (modal) modal.classList.add('show');
}

/* ------------------------------------------------------------
   Salvar
   ------------------------------------------------------------ */
export async function saveRifa() {
  const name = document.getElementById('in-rifa-name').value.trim();
  const prize = document.getElementById('in-rifa-prize').value.trim();
  const price = parseFloat(document.getElementById('in-rifa-price').value) || 0;
  const total = parseInt(document.getElementById('in-rifa-total').value) || 0;
  const date = document.getElementById('in-rifa-date').value;
  const time = document.getElementById('in-rifa-time').value;

  const promoEnabled = APP.newRifaPromoEnabled;
  const promoQty = parseInt(document.getElementById('promo-qty').value) || 10;
  const promoPrice = parseFloat(document.getElementById('promo-price').value) || 10;

  if (!name) { toast('⚠️ Informe o nome'); haptic(50); return; }
  if (total <= 0) { toast('⚠️ Informe a qtd de números'); haptic(50); return; }
  if (promoEnabled && price > 0 && (promoPrice / promoQty) >= price) {
    toast('⚠️ A promoção não dá desconto');
    haptic(50);
    return;
  }

  setSyncStatus('syncing', 'Salvando...');

  try {
    await createRifa({
      name, prize: prize || '—', price, total, date, time,
      emoji: APP.newRifaEmoji,
      colorIdx: APP.newRifaColor,
      image: APP.newRifaImage,
      promo_enabled: promoEnabled,
      promo_quantity: promoQty,
      promo_price: promoPrice
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
   Imagem (upload / URL)
   ------------------------------------------------------------ */
export function triggerImageUpload(ctx) {
  if (ctx === 'rifa') document.getElementById('rifa-image-input')?.click();
  else if (ctx === 'edit') document.getElementById('edit-image-input')?.click();
}

export function handleImageUpload(event, ctx) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    toast('⚠️ Imagem inválida');
    return;
  }
  if (file.size > 3 * 1024 * 1024) {
    toast('⚠️ Máx 3MB');
    haptic(50);
    return;
  }

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
   Modal de edição de imagem (rifa atual)
   ------------------------------------------------------------ */
export function openEditImageModal() {
  haptic(8);
  const r = APP.currentRifa;
  if (!r) return;

  renderEditImageUploader();

  const modal = document.getElementById('modal-edit-image');
  if (modal) modal.classList.add('show');
}

function renderEditImageUploader() {
  const el = document.getElementById('edit-image-uploader');
  if (!el) return;

  const r = APP.currentRifa;
  if (!r) return;

  if (r.image) {
    el.classList.add('has-image');
    el.innerHTML = `<button class="remove-img" onclick="event.stopPropagation(); window.removeEditImage()">✕</button><img src="${r.image}">`;
  } else {
    el.classList.remove('has-image');
    el.innerHTML = `<div class="up-icon">🖼️</div><div class="up-text">Toque para escolher</div>`;
  }
}

export async function removeEditImage() {
  const r = APP.currentRifa;
  if (!r) return;
  r.image = null;
  try {
    const { saveRifaCloud } = await import('../../services/rifas.service.js');
    await saveRifaCloud(r);
    const idx = APP.rifas.findIndex(x => x.id === r.id);
    if (idx >= 0) APP.rifas[idx] = r;
    const { renderRifa } = await import('../screens/rifa.screen.js');
    renderRifa();
    renderEditImageUploader();
    toast('Removida');
  } catch (err) {
    toast('❌ Erro');
  }
  haptic(10);
}

/* ------------------------------------------------------------
   Handler de upload de imagem no contexto "edit"
   ------------------------------------------------------------ */
export function handleEditImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    toast('⚠️ Imagem inválida');
    return;
  }
  if (file.size > 3 * 1024 * 1024) {
    toast('⚠️ Máx 3MB');
    haptic(50);
    return;
  }

  const reader = new FileReader();
  reader.onload = async (e) => {
    const dataUrl = e.target.result;
    const r = APP.currentRifa;
    if (!r) return;

    r.image = dataUrl;
    try {
      const { saveRifaCloud } = await import('../../services/rifas.service.js');
      await saveRifaCloud(r);
      const idx = APP.rifas.findIndex(x => x.id === r.id);
      if (idx >= 0) APP.rifas[idx] = r;

      const { renderRifa } = await import('../screens/rifa.screen.js');
      renderRifa();
      renderEditImageUploader();
      toast('🖼️ Atualizada!');
    } catch (err) {
      toast('❌ Erro');
    }
    haptic([10, 30, 10]);
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

export function promptEditImageUrl() {
  const url = prompt('Cole a URL da imagem:');
  if (!url) return;
  const trimmed = url.trim();
  if (!trimmed) return;

  (async () => {
    const r = APP.currentRifa;
    if (!r) return;
    r.image = trimmed;
    try {
      const { saveRifaCloud } = await import('../../services/rifas.service.js');
      await saveRifaCloud(r);
      const idx = APP.rifas.findIndex(x => x.id === r.id);
      if (idx >= 0) APP.rifas[idx] = r;

      const { renderRifa } = await import('../screens/rifa.screen.js');
      renderRifa();
      renderEditImageUploader();
      toast('🖼️ Atualizada!');
    } catch (err) {
      toast('❌ Erro');
    }
  })();
}

/* ------------------------------------------------------------
   Modal de edição de promoção (rifa atual)
   ------------------------------------------------------------ */
export function openEditPromoModal() {
  haptic(8);
  const r = APP.currentRifa;
  if (!r) return;

  let modal = document.getElementById('modal-edit-promo');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-edit-promo';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-handle"></div>
        <h2><span class="emo gold">🎁</span>Promoção</h2>
        <div class="promo-box" id="edit-promo-box">
          <div class="promo-header">
            <div class="promo-header-left">
              <div class="promo-icon">🎁</div>
              <div>
                <div class="promo-title">Ativar promoção</div>
                <div class="promo-subtitle">Desconto por quantidade</div>
              </div>
            </div>
            <div class="switch small" id="edit-promo-switch" onclick="window.toggleEditPromo()"></div>
          </div>
          <div class="promo-content">
            <div class="promo-row">
              <span class="promo-row-label">Leve</span>
              <input type="number" id="edit-promo-qty" min="2" inputmode="numeric" oninput="window.updateEditPromoSummary()">
              <span class="promo-row-label">por apenas</span>
              <span class="promo-row-label" style="font-weight:800;">R$</span>
              <input type="number" id="edit-promo-price" min="0.01" step="0.01" class="money" inputmode="decimal" oninput="window.updateEditPromoSummary()">
            </div>
            <div class="promo-summary" id="edit-promo-summary"></div>
          </div>
        </div>
        <div class="info-box" style="margin-top:10px;">
          <div class="ib-icon">💡</div>
          <div class="ib-text" style="font-size:11.5px;"><strong>Importante:</strong> Vendas antigas <strong>não mudam</strong> de preço.</div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" onclick="window.closeModal('modal-edit-promo')">Cancelar</button>
          <button class="btn btn-primary" onclick="window.saveEditPromo()">Salvar</button>
        </div>
      </div>
    `;
    document.querySelector('.app')?.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('show'); });
  }

  const qtyEl = document.getElementById('edit-promo-qty');
  const priceEl = document.getElementById('edit-promo-price');
  if (qtyEl) qtyEl.value = r.promo_quantity || 10;
  if (priceEl) priceEl.value = r.promo_price || 10;

  const sw = document.getElementById('edit-promo-switch');
  const box = document.getElementById('edit-promo-box');
  if (sw) sw.classList.toggle('on', r.promo_enabled);
  if (box) box.classList.toggle('disabled', !r.promo_enabled);

  window._editPromoEnabled = r.promo_enabled;
  window.updateEditPromoSummary();

  modal.classList.add('show');
}

export function toggleEditPromo() {
  window._editPromoEnabled = !window._editPromoEnabled;
  const sw = document.getElementById('edit-promo-switch');
  const box = document.getElementById('edit-promo-box');
  if (sw) sw.classList.toggle('on', window._editPromoEnabled);
  if (box) box.classList.toggle('disabled', !window._editPromoEnabled);
  haptic(8);
  window.updateEditPromoSummary();
}

export function updateEditPromoSummary() {
  const r = APP.currentRifa;
  if (!r) return;

  const qty = parseInt(document.getElementById('edit-promo-qty')?.value) || 0;
  const promoPrice = parseFloat(document.getElementById('edit-promo-price')?.value) || 0;
  const el = document.getElementById('edit-promo-summary');
  if (!el) return;

  if (!window._editPromoEnabled) {
    el.innerHTML = '💡 Ative para configurar';
    return;
  }
  if (qty < 2 || promoPrice <= 0) {
    el.innerHTML = '⚠️ Preencha os valores';
    return;
  }

  const unitPromo = promoPrice / qty;
  const saving = r.price - unitPromo;
  const pct = r.price > 0 ? Math.round((saving / r.price) * 100) : 0;

  if (saving <= 0) {
    el.innerHTML = `⚠️ A promoção não dá desconto`;
    return;
  }

  el.innerHTML = `💡 Cada número sai por <strong>R$ ${unitPromo.toFixed(2)}</strong><span class="save-badge">-${pct}%</span>`;
}

export async function saveEditPromo() {
  const r = APP.currentRifa;
  if (!r) return;

  const enabled = window._editPromoEnabled;
  const qty = parseInt(document.getElementById('edit-promo-qty')?.value) || 10;
  const price = parseFloat(document.getElementById('edit-promo-price')?.value) || 10;

  if (enabled && r.price > 0 && (price / qty) >= r.price) {
    toast('⚠️ A promoção não dá desconto');
    haptic(50);
    return;
  }

  r.promo_enabled = enabled;
  r.promo_quantity = qty;
  r.promo_price = price;

  try {
    const { saveRifaCloud } = await import('../../services/rifas.service.js');
    await saveRifaCloud(r);

    const idx = APP.rifas.findIndex(x => x.id === r.id);
    if (idx >= 0) APP.rifas[idx] = r;

    const { closeModal } = await import('../components/modal.js');
    closeModal('modal-edit-promo');

    const { renderRifa } = await import('../screens/rifa.screen.js');
    const { renderHome } = await import('../screens/home.screen.js');
    renderRifa();
    renderHome();

    haptic([10, 30, 10]);
    toast(enabled ? '🎁 Promoção ativada!' : '🎁 Promoção desativada');
  } catch (err) {
    toast('❌ Erro ao salvar');
  }
}