/* ============================================================
   Storage — wrapper seguro do localStorage
   ============================================================ */

const PREFIX = 'rc_';

export const storage = {
  get(key, fallback = null) {
    try {
      const v = localStorage.getItem(PREFIX + key);
      return v === null ? fallback : v;
    } catch (e) {
      return fallback;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, String(value));
      return true;
    } catch (e) {
      return false;
    }
  },

  getBool(key, fallback = false) {
    const v = this.get(key);
    if (v === null) return fallback;
    return v === '1' || v === 'true';
  },

  setBool(key, value) {
    return this.set(key, value ? '1' : '0');
  },

  getInt(key, fallback = 0) {
    const v = this.get(key);
    if (v === null) return fallback;
    const n = parseInt(v, 10);
    return isNaN(n) ? fallback : n;
  },

  setInt(key, value) {
    return this.set(key, String(value));
  },

  remove(key) {
    try { localStorage.removeItem(PREFIX + key); return true; }
    catch (e) { return false; }
  },

  clear() {
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith(PREFIX))
        .forEach(k => localStorage.removeItem(k));
      return true;
    } catch (e) { return false; }
  }
};