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
      updateRifaPreview(); // Atualiza o preview
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
      updateRifaPreview(); // Atualiza o preview
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
   Lógica da Promoção
   ------------------------------------------------------------ */
export function togglePromo() {
  APP.newRifaPromoEnabled = !APP.newRifaPromoEnabled;
  const box = document.getElementById('promo-box');
  const sw = document.getElementById('promo-switch');
  if (box) box.classList.toggle('disabled', !APP.newRifaPromoEnabled);
  if (sw) sw.classList.toggle('on', APP.newRifaPromoEnabled);
  haptic(8);
  updatePromoSummary();
  updateRifaPreview();
}

export function updatePromoSummary() {
  const price = parseFloat(document.getElementById('in-rifa-price')?.value) || 0;
  const qty = parseInt(document.getElementById('promo-qty')?.value) || 0;
  const promoPrice = parseFloat(document.getElementById('promo-price')?.value) || 0;
  const el = document.getElementById('promo-summary');
  
  // Salva no state global para o preview ler
  APP.newRifaPromoQuantity = qty;
  APP.newRifaPromoPrice = promoPrice;

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
   Atualiza o Preview do Card em Tempo Real
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

  // Atualiza textos no preview
  const elName = document.getElementById('preview-name');
  const elPrize = document.getElementById('preview-prize');
  const elPrice = document.getElementById('preview-price');
  const elTotal = document.getElementById('preview-total');
  const elAvatar = document.getElementById('preview-avatar');

  if (elName) elName.textContent = name;
  if (elPrize) elPrize.textContent = prize;
  
  // Atualiza linha de preço (com promoção se ativa)
  if (elPrice) {
    if (APP.newRifaPromoEnabled && APP.newRifaPromoQuantity && APP.newRifaPromoPrice) {
      elPrice.innerHTML = `R$ ${price.toFixed(2)} <span class="promo-tag">🎁 ${APP.newRifaPromoQuantity} por R$ ${APP.newRifaPromoPrice.toFixed(2)}</span>`;
    } else {
      elPrice.textContent = `R$ ${price.toFixed(2)} por número`;
    }
  }
  
  // Atualiza contador (sempre 0 vendidos ao criar)
  if (elTotal) elTotal.innerHTML = `🎯 0/${total}`;
  
  // Atualiza ícone e cor do avatar no preview
  if (elAvatar) {
    elAvatar.textContent = APP.newRifaEmoji || '🎟️';
    const c = RIFA_COLORS[APP.newRifaColor || 0];
    elAvatar.style.background = `linear-gradient(135deg, ${c.c1}, ${c.c2})`;
    
    const previewCard = document.getElementById('preview-card');
    if (previewCard) {
      previewCard.style.setProperty('--card-color', c.c2);
    }
  }
}

/* ------------------------------------------------------------
   Abrir Modal
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
  APP.newRifaPromoQuantity = 10;
  APP.newRifaPromoPrice = 10;

  const box = document.getElementById('promo-box');
  if (box) box.classList.add('disabled');
  const sw = document.getElementById('promo-switch');
  if (sw) sw.classList.remove('on');

  renderEmojiGrid();
  renderRifaColorGrid();
  renderRifaImageUploader();
  updatePromoSummary();
  
  // Inicializa o preview vazio
  updateRifaPreview();

  const modal = document.getElementById('modal-rifa');
  if (modal) modal.classList.add('show');
}

/* ------------------------------------------------------------
   Salvar Rifa
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
   Imagem (Upload / URL)
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