/* ============================================================
   Haptic — vibração (respeita flag do state)
   ============================================================ */

let hapticEnabled = true;

export function setHapticEnabled(enabled) {
  hapticEnabled = !!enabled;
}

export function haptic(pattern = 10) {
  if (!hapticEnabled) return;
  if ('vibrate' in navigator) {
    try { navigator.vibrate(pattern); } catch (e) { /* ignore */ }
  }
}