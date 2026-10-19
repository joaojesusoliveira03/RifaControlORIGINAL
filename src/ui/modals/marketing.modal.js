/* ============================================================
   Marketing — gerar texto de divulgação pra compartilhar
   ============================================================ */

import { APP } from '../../config/state.js';
import { haptic } from '../../utils/haptic.js';
import { toast } from '../components/toast.js';
import { copyToClipboard } from '../../utils/clipboard.js';
import { countSold } from '../../services/sales.service.js';

export function shareMarketingText() {
  haptic(10);
  const r = APP.currentRifa;
  if (!r) return;

  const sold = countSold(r);
  const pct = r.total ? Math.round(sold / r.total * 100) : 0;
  const dateStr = r.date ? new Date(r.date + 'T12:00:00').toLocaleDateString('pt-BR') : '';
  const timeStr = r.time || '';
  const emoji = r.emoji || '🎟️';

  let msg = `${emoji} *${r.name.toUpperCase()}* ${emoji}\n\n`;
  msg += `🎁 *${r.prize}*\n`;
  msg += `💰 *R$ ${r.price.toFixed(2)}* o número\n`;

  if (r.promo_enabled) {
    const unitPromo = r.promo_price / r.promo_quantity;
    const saving = r.price - unitPromo;
    const pctDesc = r.price > 0 ? Math.round((saving / r.price) * 100) : 0;
    msg += `🎁 *PROMOÇÃO*: Leve ${r.promo_quantity} por R$ ${r.promo_price.toFixed(2)}!\n`;
    msg += `   (R$ ${unitPromo.toFixed(2)} cada -${pctDesc}%)\n`;
  }

  msg += `\n⚡ *${sold}/${r.total}* vendidos (${pct}%)!\n`;
  msg += sold < r.total ? `🏃 Corre!\n\n` : `🔒 ESGOTADO!\n\n`;

  if (dateStr) msg += `📅 Sorteio: ${dateStr}${timeStr ? ' às ' + timeStr : ''}\n`;
  msg += `\n👉 Chama no WhatsApp!`;

  copyToClipboard(msg).then(() => {
    toast('📢 Copiado!');
    haptic([10, 30, 10]);
  });
}