/* ============================================================
   Realtime — inscrição em mudanças do Supabase
   ============================================================ */

import { sb } from '../config/supabase.js';
import { APP } from '../config/state.js';
import { toast } from '../ui/components/toast.js';
import { reloadRifas, mapRifa } from '../services/rifas.service.js';
import { renderHome } from '../ui/screens/home.screen.js';
import { renderRifa } from '../ui/screens/rifa.screen.js';
import { showScreen } from './router.js';

/**
 * Inicia canal realtime (remove o anterior se existir).
 */
export function subscribeRealtime() {
  if (APP.realtimeChannel) {
    sb.removeChannel(APP.realtimeChannel);
    APP.realtimeChannel = null;
  }

  APP.realtimeChannel = sb
    .channel('rifas-realtime')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'rifas' },
      handleRifaChange)
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'shares' },
      () => { reloadRifas().catch(console.error); })
    .subscribe(status => {
      console.log('📡 Realtime:', status);
    });
}

/**
 * Remove o canal atual (chamado no logout).
 */
export function stopRealtime() {
  if (APP.realtimeChannel) {
    sb.removeChannel(APP.realtimeChannel);
    APP.realtimeChannel = null;
  }
}

/* ------------------------------------------------------------
   Handlers internos
   ------------------------------------------------------------ */

async function handleRifaChange(payload) {
  const { eventType, new: newRow, old: oldRow } = payload;

  if (eventType === 'INSERT') {
    if (newRow.owner_id !== APP.user?.id) {
      await reloadRifas();
      toast('🎟️ Nova rifa compartilhada!', 3000);
    } else if (!APP.rifas.find(r => r.id === newRow.id)) {
      await reloadRifas();
    }
    return;
  }

  if (eventType === 'UPDATE') {
    const idx = APP.rifas.findIndex(r => r.id === newRow.id);
    if (idx >= 0) {
      const mapped = mapRifa(newRow);
      APP.rifas[idx] = mapped;

      if (APP.currentRifa && APP.currentRifa.id === newRow.id) {
        APP.currentRifa = mapped;
        renderRifa();
      }
      renderHome();
    }
    return;
  }

  if (eventType === 'DELETE') {
    APP.rifas = APP.rifas.filter(r => r.id !== oldRow.id);
    if (APP.currentRifa && APP.currentRifa.id === oldRow.id) {
      APP.currentRifa = null;
      showScreen('home');
    }
    renderHome();
  }
}