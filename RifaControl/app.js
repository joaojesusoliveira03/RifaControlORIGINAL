/* ============================================================
   RifaControl Cloud v1.1
   ============================================================ */

const SUPABASE_URL = 'https://iqlgjrctbhcvcmylhnpo.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxbGdqcmN0YmhjdmNteWxobnBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NTk3ODksImV4cCI6MjEwNzAzNTc4OX0.C_j3Qb1DRbo19EEySCCxZLDww6ArDo0f1QrcskB3RRk';

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

const APP = {
  user: null, profile: null, rifas: [],
  currentRifa: null, currentTab: 'numbers', currentReportTab: 'geral',
  currentBuyer: null, dark: false, accentIdx: 0, haptic: true, confetti: true,
  newRifaEmoji: '🎟️', newRifaColor: 0, newRifaImage: null, newRifaPromoEnabled: false,
  salePay: 'pending', search: '', gridFilter: 'all', authMode: 'login',
  realtimeChannel: null, isRecoveryMode: false
};

const RIFA_COLORS = [
  {c1:'#55efc4', c2:'#00b894'}, {c1:'#74b9ff', c2:'#0984e3'},
  {c1:'#a29bfe', c2:'#6C5CE7'}, {c1:'#fd79a8', c2:'#e84393'},
  {c1:'#fab1a0', c2:'#e17055'}, {c1:'#ffeaa7', c2:'#fdcb6e'},
  {c1:'#ff7675', c2:'#d63031'}, {c1:'#81ecec', c2:'#00cec9'}
];
const RIFA_EMOJIS = ['🎟️','🎁','🍕','💰','🎮','📱','🚗','🏖️','🎂','🍺','🐶','💎','🎧','👟','⌚','🎈','🍫','🧸','📚','🍔','🏆','💵','🏠','🎊'];
const ACCENT_COLORS = [
  {name:'verde', primary:'#00b894', dark:'#009178', light:'#55efc4'},
  {name:'roxo', primary:'#6C5CE7', dark:'#4834d4', light:'#a29bfe'},
  {name:'azul', primary:'#0984e3', dark:'#0062a3', light:'#74b9ff'},
  {name:'rosa', primary:'#e84393', dark:'#b02e70', light:'#fd79a8'},
  {name:'laranja', primary:'#e17055', dark:'#b85942', light:'#fab1a0'},
  {name:'vermelho', primary:'#d63031', dark:'#a32020', light:'#ff7675'}
];
const AVATAR_COLORS = ['#00b894','#0984e3','#6C5CE7','#e84393','#e17055','#f59e0b','#d63031','#00cec9'];

let searchTimeout = null, renderTimeout = null, pendingConfirm = null;
let toastTimer = null, sortInterval = null, currentSortRifa = null, currentSortResult = null;

function haptic(pattern = 10){ if(!APP.haptic) return; if('vibrate' in navigator){ try{ navigator.vibrate(pattern); }catch(e){} } }
function escapeHtml(s){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function shade(hex, pct){ const n = parseInt(hex.slice(1),16); let r=(n>>16)+pct,g=((n>>8)&0xff)+pct,b=(n&0xff)+pct; r=Math.max(0,Math.min(255,r)); g=Math.max(0,Math.min(255,g)); b=Math.max(0,Math.min(255,b)); return '#'+((r<<16)|(g<<8)|b).toString(16).padStart(6,'0'); }
function getAvatarColor(name){ if(!name) return AVATAR_COLORS[0]; let hash=0; for(let i=0;i<name.length;i++) hash=name.charCodeAt(i)+((hash<<5)-hash); return AVATAR_COLORS[Math.abs(hash)%AVATAR_COLORS.length]; }
function getAvatarInitial(name){ if(!name) return '?'; const parts=name.trim().split(/\s+/); if(parts.length===1) return parts[0][0].toUpperCase(); return (parts[0][0]+parts[parts.length-1][0]).toUpperCase(); }

function toast(msg, duration = 2000){
  const t = document.getElementById('toast');
  t.innerHTML = `<span class="toast-msg">${msg}</span>`;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>t.classList.remove('show'), duration);
}
function toastWithAction(msg, actionLabel, action, duration = 5000){
  const t = document.getElementById('toast');
  t.innerHTML = `<span class="toast-msg">${msg}</span><button class="toast-action">${actionLabel}</button>`;
  t.classList.add('show');
  t.querySelector('.toast-action').onclick = () => { t.classList.remove('show'); clearTimeout(toastTimer); haptic(10); action(); };
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>t.classList.remove('show'), duration);
}
function setSyncStatus(status, text){
  const el = document.getElementById('sync-status');
  const txt = document.getElementById('sync-text');
  if(!el) return;
  el.className = 'sync-status ' + status;
  if(txt) txt.textContent = text;
}
function launchConfetti(intensity = 'small'){
  if(!APP.confetti) return;
  const container = document.getElementById('confetti-container');
  if(!container) return;
  const colors = ['#00b894','#fdcb6e','#fd79a8','#6C5CE7','#0984e3','#e17055','#fbbf24'];
  const count = intensity === 'big' ? 40 : 15;
  const duration = intensity === 'big' ? 2500 : 1500;
  const frag = document.createDocumentFragment();
  for(let i = 0; i < count; i++){
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.left = Math.random() * 100 + '%';
    c.style.background = colors[Math.floor(Math.random() * colors.length)];
    c.style.width = (6 + Math.random() * 8) + 'px';
    c.style.height = (6 + Math.random() * 10) + 'px';
    c.style.borderRadius = Math.random() > .5 ? '50%' : '2px';
    c.style.animationDuration = (duration + Math.random() * 1000) + 'ms';
    c.style.animationDelay = Math.random() * 300 + 'ms';
    frag.appendChild(c);
    setTimeout(() => c.remove(), duration + 1500);
  }
  container.appendChild(frag);
}

function showAuthView(view){
  document.getElementById('auth-view-login').classList.add('hidden');
  document.getElementById('auth-view-forgot').classList.add('hidden');
  document.getElementById('auth-view-reset').classList.add('hidden');
  document.getElementById('auth-view-' + view).classList.remove('hidden');
}
function switchAuthTab(mode){
  haptic(5);
  APP.authMode = mode;
  document.getElementById('tab-login').classList.toggle('active', mode === 'login');
  document.getElementById('tab-signup').classList.toggle('active', mode === 'signup');
  document.getElementById('field-name').classList.toggle('hidden', mode === 'login');
  document.getElementById('btn-auth').textContent = mode === 'login' ? 'Entrar' : 'Criar conta';
  hideAuthMessage('auth-msg');
}
function showAuthMessage(elId, msg, type){
  const el = document.getElementById(elId);
  if(!el) return;
  el.textContent = msg;
  el.className = 'auth-message show ' + type;
}
function hideAuthMessage(elId){
  const el = document.getElementById(elId);
  if(!el) return;
  el.className = 'auth-message';
}

async function handleAuth(){
  const email = document.getElementById('in-auth-email').value.trim();
  const pass = document.getElementById('in-auth-pass').value;
  const name = document.getElementById('in-auth-name').value.trim();
  if(!email){ showAuthMessage('auth-msg', 'Informe o email', 'error'); return; }
  if(!pass || pass.length < 6){ showAuthMessage('auth-msg', 'Senha deve ter 6+ caracteres', 'error'); return; }
  if(APP.authMode === 'signup' && !name){ showAuthMessage('auth-msg', 'Informe seu nome', 'error'); return; }
  const btn = document.getElementById('btn-auth');
  btn.disabled = true;
  btn.textContent = 'Aguarde...';
  hideAuthMessage('auth-msg');
  try{
    if(APP.authMode === 'signup'){
      const { data, error } = await sb.auth.signUp({ email, password: pass, options: { data: { name } } });
      if(error) throw error;
      if(data.user && !data.session){ showAuthMessage('auth-msg', 'Confirme seu email antes de entrar', 'success'); }
      else { showAuthMessage('auth-msg', 'Conta criada! Entrando...', 'success'); }
    } else {
      const { error } = await sb.auth.signInWithPassword({ email, password: pass });
      if(error) throw error;
    }
  }catch(err){
    console.error(err);
    let msg = 'Erro inesperado';
    if(err.message.includes('Invalid login')) msg = 'Email ou senha incorretos';
    else if(err.message.includes('already registered')) msg = 'Esse email já está cadastrado';
    else if(err.message.includes('Password should be')) msg = 'Senha muito curta';
    else msg = err.message;
    showAuthMessage('auth-msg', msg, 'error');
    haptic(50);
  }finally{
    btn.disabled = false;
    btn.textContent = APP.authMode === 'login' ? 'Entrar' : 'Criar conta';
  }
}

function showForgotPassword(){
  haptic(8);
  document.getElementById('in-forgot-email').value = '';
  hideAuthMessage('forgot-msg');
  showAuthView('forgot');
}
function backToLogin(){
  haptic(8);
  hideAuthMessage('forgot-msg');
  hideAuthMessage('reset-msg');
  showAuthView('login');
}
async function sendForgotPassword(){
  const email = document.getElementById('in-forgot-email').value.trim();
  if(!email){ showAuthMessage('forgot-msg', 'Informe o email', 'error'); return; }
  const btn = document.getElementById('btn-forgot');
  btn.disabled = true;
  btn.textContent = 'Enviando...';
  hideAuthMessage('forgot-msg');
  try{
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + window.location.pathname });
    if(error) throw error;
    showAuthMessage('forgot-msg', '✅ Link enviado! Confira seu email', 'success');
    haptic([10, 30, 10]);
    setTimeout(() => { backToLogin(); }, 4000);
  }catch(err){
    console.error(err);
    let msg = 'Erro ao enviar. Tente de novo.';
    if(err.message.includes('rate limit')) msg = 'Muitos pedidos. Aguarde 1 min.';
    showAuthMessage('forgot-msg', msg, 'error');
    haptic(50);
  }finally{
    btn.disabled = false;
    btn.textContent = 'Enviar link';
  }
}
async function updatePassword(){
  const pass = document.getElementById('in-reset-pass').value;
  const pass2 = document.getElementById('in-reset-pass2').value;
  if(!pass || pass.length < 6){ showAuthMessage('reset-msg', 'Senha deve ter 6+ caracteres', 'error'); return; }
  if(pass !== pass2){ showAuthMessage('reset-msg', 'As senhas não batem', 'error'); return; }
  const btn = document.getElementById('btn-reset');
  btn.disabled = true;
  btn.textContent = 'Salvando...';
  hideAuthMessage('reset-msg');
  try{
    const { error } = await sb.auth.updateUser({ password: pass });
    if(error) throw error;
    showAuthMessage('reset-msg', '✅ Senha atualizada! Entrando...', 'success');
    haptic([10, 30, 10]);
    launchConfetti('small');
    setTimeout(async () => {
      APP.isRecoveryMode = false;
      document.getElementById('in-reset-pass').value = '';
      document.getElementById('in-reset-pass2').value = '';
    }, 1000);
  }catch(err){
    console.error(err);
    showAuthMessage('reset-msg', 'Erro ao salvar. Tente de novo.', 'error');
    haptic(50);
    btn.disabled = false;
    btn.textContent = 'Salvar nova senha';
  }
}
async function signOut(){
  haptic(15);
  if(APP.realtimeChannel){ sb.removeChannel(APP.realtimeChannel); APP.realtimeChannel = null; }
  await sb.auth.signOut();
  APP.user = null; APP.profile = null; APP.rifas = [];
  showAuthScreen();
  showAuthView('login');
  toast('👋 Até logo!');
}
function showAuthScreen(){
  document.getElementById('auth-screen').classList.remove('hidden');
  document.getElementById('app').classList.add('hidden');
}
function showApp(){
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
}

async function loadUserData(){
  setSyncStatus('syncing', 'Carregando...');
  try{
    const { data: prof } = await sb.from('profiles').select('*').eq('id', APP.user.id).single();
    APP.profile = prof || { name: APP.user.email, email: APP.user.email };
    document.getElementById('user-name').textContent = APP.profile.name || 'Sem nome';
    document.getElementById('user-email').textContent = APP.user.email;
    document.getElementById('user-avatar').textContent = (APP.profile.name || APP.user.email)[0].toUpperCase();
    await reloadRifas();
    setSyncStatus('', 'Sincronizado');
  }catch(err){
    console.error('Erro ao carregar dados:', err);
    setSyncStatus('error', 'Erro');
    toast('❌ Erro ao carregar dados');
  }
}
async function reloadRifas(){
  const { data, error } = await sb.from('rifas').select('*').order('created_at', { ascending: false });
  if(error){ console.error(error); throw error; }
  APP.rifas = (data || []).map(r => mapRifa(r));
  renderHome();
}
function mapRifa(r){
  return {
    id: r.id, owner_id: r.owner_id, name: r.name, prize: r.prize,
    price: parseFloat(r.price) || 0, total: r.total, date: r.date, time: r.time,
    emoji: r.emoji, colorIdx: r.color_idx, image: r.image, winner: r.winner,
    promo_enabled: r.promo_enabled, promo_quantity: r.promo_quantity,
    promo_price: parseFloat(r.promo_price) || 0, sales: r.sales || [],
    createdAt: r.created_at, updatedAt: r.updated_at,
    isShared: r.owner_id !== APP.user.id
  };
}

async function initAuth(){
  const { data: { session } } = await sb.auth.getSession();
  if(session && session.user){
    APP.user = session.user;
    showApp();
    await loadUserData();
    subscribeRealtime();
  } else {
    showAuthScreen();
    showAuthView('login');
  }
  sb.auth.onAuthStateChange(async (event, session) => {
    console.log('🔐 Auth event:', event);
    if(event === 'PASSWORD_RECOVERY'){
      APP.isRecoveryMode = true;
      showAuthScreen();
      showAuthView('reset');
      return;
    }
    if(event === 'SIGNED_IN' && session && session.user){
      if(APP.isRecoveryMode) return;
      APP.user = session.user;
      showApp();
      await loadUserData();
      subscribeRealtime();
    } else if(event === 'SIGNED_OUT'){
      APP.user = null; APP.isRecoveryMode = false;
      showAuthScreen();
      showAuthView('login');
    }
  });
  if(window.location.hash && window.location.hash.includes('type=recovery')){
    APP.isRecoveryMode = true;
    showAuthScreen();
    showAuthView('reset');
  }
}

function subscribeRealtime(){
  if(APP.realtimeChannel) sb.removeChannel(APP.realtimeChannel);
  APP.realtimeChannel = sb.channel('rifas-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'rifas' }, handleRealtimeUpdate)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'shares' }, () => { reloadRifas().catch(console.error); })
    .subscribe((status) => { console.log('📡 Realtime:', status); });
}
async function handleRealtimeUpdate(payload){
  const { eventType, new: newRow, old: oldRow } = payload;
  if(eventType === 'INSERT'){
    if(newRow.owner_id !== APP.user.id){ await reloadRifas(); toast('🎟️ Nova rifa compartilhada!', 3000); }
    else if(!APP.rifas.find(r => r.id === newRow.id)){ await reloadRifas(); }
    return;
  }
  if(eventType === 'UPDATE'){
    const idx = APP.rifas.findIndex(r => r.id === newRow.id);
    if(idx >= 0){
      const mapped = mapRifa(newRow);
      APP.rifas[idx] = mapped;
      if(APP.currentRifa && APP.currentRifa.id === newRow.id){ APP.currentRifa = mapped; renderRifa(); }
      renderHome();
    }
    return;
  }
  if(eventType === 'DELETE'){
    APP.rifas = APP.rifas.filter(r => r.id !== oldRow.id);
    if(APP.currentRifa && APP.currentRifa.id === oldRow.id){ APP.currentRifa = null; showScreen('home'); }
    renderHome();
  }
}

async function saveRifaCloud(rifa){
  if(!rifa) return;
  setSyncStatus('syncing', 'Salvando...');
  try{
    const payload = {
      name: rifa.name, prize: rifa.prize, price: rifa.price,
      total: rifa.total, date: rifa.date, time: rifa.time,
      emoji: rifa.emoji, color_idx: rifa.colorIdx, image: rifa.image,
      winner: rifa.winner, sales: rifa.sales,
      promo_enabled: rifa.promo_enabled, promo_quantity: rifa.promo_quantity, promo_price: rifa.promo_price
    };
    const { error } = await sb.from('rifas').update(payload).eq('id', rifa.id);
    if(error) throw error;
    setSyncStatus('', 'Sincronizado');
  }catch(err){
    console.error(err); setSyncStatus('error', 'Erro'); throw err;
  }
}
async function deleteRifaFromCloud(id){
  const { error } = await sb.from('rifas').delete().eq('id', id);
  if(error) throw error;
}

function calcSaleCost(totalNums, rifa){
  if(!rifa || !rifa.promo_enabled || !rifa.promo_quantity || !rifa.promo_price){
    return { total: totalNums * rifa.price, faixas: [{ qty: totalNums, unitPrice: rifa.price, subtotal: totalNums * rifa.price }], savings: 0, promoApplied: false, semPromo: totalNums * rifa.price };
  }
  const promoQty = rifa.promo_quantity, promoPrice = rifa.promo_price, unitPrice = rifa.price;
  const promoBundles = Math.floor(totalNums / promoQty);
  const remainder = totalNums % promoQty;
  const faixas = []; let total = 0;
  if(promoBundles > 0){ const sub = promoBundles * promoPrice; faixas.push({ qty: promoBundles * promoQty, unitPrice: promoPrice / promoQty, subtotal: sub, isPromo: true }); total += sub; }
  if(remainder > 0){ const sub = remainder * unitPrice; faixas.push({ qty: remainder, unitPrice: unitPrice, subtotal: sub, isPromo: false }); total += sub; }
  const semPromo = totalNums * unitPrice;
  return { total, faixas, savings: semPromo - total, promoApplied: promoBundles > 0, semPromo };
}
function calcArrecadado(rifa){
  let total = 0;
  rifa.sales.forEach(s => { if(!s.paid) return; total += typeof s.price_charged === 'number' ? s.price_charged : rifa.price; });
  return total;
}
function calcPendente(rifa){
  let total = 0;
  rifa.sales.forEach(s => { if(s.paid) return; total += typeof s.price_charged === 'number' ? s.price_charged : rifa.price; });
  return total;
}

function applyTheme(){
  document.body.classList.toggle('dark', APP.dark);
  const a = ACCENT_COLORS[APP.accentIdx];
  document.documentElement.style.setProperty('--primary', a.primary);
  document.documentElement.style.setProperty('--primary-dark', a.dark);
  document.documentElement.style.setProperty('--primary-light', a.light);
  const meta = document.querySelector('meta[name="theme-color"]');
  if(meta) meta.setAttribute('content', a.primary);
  const sw = document.getElementById('switch-dark'); if(sw) sw.classList.toggle('on', APP.dark);
  const swh = document.getElementById('switch-haptic'); if(swh) swh.classList.toggle('on', APP.haptic);
  const swc = document.getElementById('switch-confetti'); if(swc) swc.classList.toggle('on', APP.confetti);
  document.querySelectorAll('#color-grid .color-opt').forEach((el,i)=>{ el.classList.toggle('active', i === APP.accentIdx); });
}
function toggleDark(){ APP.dark = !APP.dark; haptic(15); applyTheme(); localStorage.setItem('rc_dark', APP.dark ? '1' : '0'); toast(APP.dark ? '🌙 Escuro' : '☀️ Claro'); }
function toggleHaptic(){ APP.haptic = !APP.haptic; haptic(15); applyTheme(); localStorage.setItem('rc_haptic', APP.haptic ? '1' : '0'); toast(APP.haptic ? '📳 Vibração on' : '📴 Vibração off'); }
function toggleConfetti(){ APP.confetti = !APP.confetti; haptic(15); applyTheme(); localStorage.setItem('rc_confetti', APP.confetti ? '1' : '0'); toast(APP.confetti ? '🎉 Confetes on' : '🎈 Confetes off'); }
function setAccent(i){ APP.accentIdx = i; haptic(15); applyTheme(); localStorage.setItem('rc_accent', i.toString()); toast('🎨 Cor atualizada!'); }

function showScreen(name){
  haptic(8);
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById('screen-'+name).classList.add('active');
  if(name === 'home') renderHome();
  if(name === 'sorteio') renderSorteioList();
  if(name === 'settings') renderSettings();
  if(name === 'reports') renderReports();
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.querySelectorAll('#screen-'+name+' .nav-item').forEach(n=>{
    const txt = n.textContent.trim();
    if((name==='home' && txt.includes('Rifas')) || (name==='sorteio' && txt.includes('Sortear')) || (name==='settings' && txt.includes('Ajustes'))) n.classList.add('active');
  });
}
function updateGreeting(){
  const h = new Date().getHours();
  let g = 'Boa tarde! 🌤️';
  if(h < 12) g = 'Bom dia! ☀️';
  else if(h >= 18) g = 'Boa noite! 🌙';
  document.getElementById('home-greeting').textContent = g;
}
function showConfirm(title, desc, iconType, onOk, okLabel){
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-desc').textContent = desc;
  const icon = document.getElementById('confirm-icon');
  icon.className = 'confirm-icon ' + (iconType || 'danger');
  icon.textContent = iconType === 'danger' ? '🗑️' : iconType === 'warning' ? '⚠️' : iconType === 'gold' ? '🏆' : '❓';
  const okBtn = document.getElementById('confirm-ok');
  okBtn.textContent = okLabel || 'Confirmar';
  okBtn.className = 'btn ' + (iconType === 'gold' ? 'btn-gold' : 'btn-danger');
  document.getElementById('modal-confirm').classList.add('show');
  pendingConfirm = onOk;
  haptic(20);
}
function closeConfirm(){ document.getElementById('modal-confirm').classList.remove('show'); pendingConfirm = null; }
function confirmOk(){ if(pendingConfirm) pendingConfirm(); closeConfirm(); }

function openRifaModal(){
  haptic(8);
  ['in-rifa-name','in-rifa-prize','in-rifa-price','in-rifa-date'].forEach(id => document.getElementById(id).value='');
  document.getElementById('in-rifa-total').value='100';
  document.getElementById('in-rifa-time').value='20:00';
  document.getElementById('promo-qty').value = '10';
  document.getElementById('promo-price').value = '10';
  APP.newRifaEmoji = '🎟️'; APP.newRifaColor = 0; APP.newRifaImage = null; APP.newRifaPromoEnabled = false;
  document.getElementById('promo-box').classList.add('disabled');
  document.getElementById('promo-switch').classList.remove('on');
  renderEmojiGrid(); renderRifaColorGrid(); renderRifaImageUploader(); updatePromoSummary();
  document.getElementById('modal-rifa').classList.add('show');
}
function openSaleModal(){
  haptic(8);
  ['in-sale-name','in-sale-phone','in-sale-nums'].forEach(id => document.getElementById(id).value='');
  selectPay('pending');
  document.getElementById('sale-calc').classList.remove('show');
  updateRandomHint();
  document.getElementById('modal-sale').classList.add('show');
  setTimeout(() => document.getElementById('in-sale-name').focus(), 300);
}
function closeModal(id){ document.getElementById(id).classList.remove('show'); }
document.querySelectorAll('.modal-overlay').forEach(o=>{
  o.addEventListener('click',e=>{ if(e.target===o){ if(!['modal-sort','modal-confirm','modal-num-info','modal-random'].includes(o.id)) o.classList.remove('show'); }});
});
function maskPhone(input){
  let v = input.value.replace(/\D/g, '');
  if(v.length > 11) v = v.slice(0, 11);
  if(v.length === 0){ input.value = ''; return; }
  if(v.length <= 2) input.value = '(' + v;
  else if(v.length <= 6) input.value = '(' + v.slice(0,2) + ') ' + v.slice(2);
  else if(v.length <= 10) input.value = '(' + v.slice(0,2) + ') ' + v.slice(2,6) + '-' + v.slice(6);
  else input.value = '(' + v.slice(0,2) + ') ' + v.slice(2,7) + '-' + v.slice(7);
}
function triggerImageUpload(ctx){ if(ctx === 'rifa') document.getElementById('rifa-image-input').click(); else if(ctx === 'edit') document.getElementById('edit-image-input').click(); }
function promptImageUrl(ctx){
  const url = prompt('Cole a URL da imagem:'); if(!url) return;
  const trimmed = url.trim(); if(!trimmed) return;
  if(ctx === 'rifa'){ APP.newRifaImage = trimmed; renderRifaImageUploader(); toast('🖼️ OK!'); }
  else if(ctx === 'edit'){ APP.currentRifa.image = trimmed; saveRifaCloud(APP.currentRifa).then(() => { renderRifa(); renderHome(); }); renderEditImageUploader(); toast('🖼️ Atualizada!'); }
}
function handleImageUpload(event, ctx){
  const file = event.target.files[0]; if(!file) return;
  if(!file.type.startsWith('image/')){ toast('⚠️ Imagem inválida'); return; }
  if(file.size > 3 * 1024 * 1024){ toast('⚠️ Máx 3MB'); haptic(50); return; }
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    if(ctx === 'rifa'){ APP.newRifaImage = dataUrl; renderRifaImageUploader(); toast('🖼️ Carregada!'); }
    else if(ctx === 'edit'){ APP.currentRifa.image = dataUrl; saveRifaCloud(APP.currentRifa).then(() => { renderRifa(); renderHome(); }); renderEditImageUploader(); toast('🖼️ Atualizada!'); }
    haptic([10, 30, 10]);
  };
  reader.readAsDataURL(file); event.target.value = '';
}
function removeImage(ctx){
  if(ctx === 'rifa'){ APP.newRifaImage = null; renderRifaImageUploader(); toast('Removida'); }
  else if(ctx === 'edit'){ APP.currentRifa.image = null; saveRifaCloud(APP.currentRifa).then(() => { renderRifa(); renderHome(); }); renderEditImageUploader(); toast('Removida'); }
  haptic(10);
}
function renderRifaImageUploader(){
  const el = document.getElementById('rifa-image-uploader'); if(!el) return;
  if(APP.newRifaImage){ el.classList.add('has-image'); el.innerHTML = `<button class="remove-img" onclick="event.stopPropagation(); removeImage('rifa')">✕</button><img src="${APP.newRifaImage}">`; }
  else { el.classList.remove('has-image'); el.innerHTML = `<div class="up-icon">🖼️</div><div class="up-text">Toque para escolher</div><div class="up-hint">Do prêmio, do item, do que quiser</div>`; }
}
function renderEditImageUploader(){
  const el = document.getElementById('edit-image-uploader'); if(!el) return;
  const r = APP.currentRifa; if(!r) return;
  if(r.image){ el.classList.add('has-image'); el.innerHTML = `<button class="remove-img" onclick="event.stopPropagation(); removeImage('edit')">✕</button><img src="${r.image}">`; }
  else { el.classList.remove('has-image'); el.innerHTML = `<div class="up-icon">🖼️</div><div class="up-text">Toque para escolher</div>`; }
}
function openEditImageModal(){ haptic(8); renderEditImageUploader(); document.getElementById('modal-edit-image').classList.add('show'); }

function togglePromo(){
  APP.newRifaPromoEnabled = !APP.newRifaPromoEnabled;
  const box = document.getElementById('promo-box'); const sw = document.getElementById('promo-switch');
  box.classList.toggle('disabled', !APP.newRifaPromoEnabled);
  sw.classList.toggle('on', APP.newRifaPromoEnabled);
  haptic(8); updatePromoSummary();
}
function updatePromoSummary(){
  const price = parseFloat(document.getElementById('in-rifa-price').value) || 0;
  const qty = parseInt(document.getElementById('promo-qty').value) || 0;
  const promoPrice = parseFloat(document.getElementById('promo-price').value) || 0;
  const el = document.getElementById('promo-summary'); if(!el) return;
  if(!APP.newRifaPromoEnabled){ el.innerHTML = '💡 Ative para configurar'; return; }
  if(qty < 2 || promoPrice <= 0 || price <= 0){ el.innerHTML = '⚠️ Preencha os valores'; return; }
  const unitPromo = promoPrice / qty; const saving = price - unitPromo;
  const pct = price > 0 ? Math.round((saving / price) * 100) : 0;
  if(saving <= 0){ el.innerHTML = `⚠️ A promoção não dá desconto`; return; }
  el.innerHTML = `💡 Cada número sai por <strong>R$ ${unitPromo.toFixed(2)}</strong><span class="save-badge">-${pct}%</span><br><span style="font-size:11px;color:var(--muted);">Economia de R$ ${saving.toFixed(2)} por número</span>`;
}
function renderEmojiGrid(){
  const g = document.getElementById('emoji-grid'); const frag = document.createDocumentFragment();
  RIFA_EMOJIS.forEach(e => {
    const b = document.createElement('button');
    b.className = 'emoji-opt' + (e===APP.newRifaEmoji?' active':'');
    b.textContent = e;
    b.onclick = () => { APP.newRifaEmoji = e; haptic(5); renderEmojiGrid(); };
    frag.appendChild(b);
  });
  g.innerHTML = ''; g.appendChild(frag);
}
function renderRifaColorGrid(){
  const g = document.getElementById('rifa-color-grid'); const frag = document.createDocumentFragment();
  RIFA_COLORS.forEach((c,i) => {
    const b = document.createElement('button');
    b.className = 'color-opt' + (i===APP.newRifaColor?' active':'');
    b.style.background = `linear-gradient(135deg,${c.c1},${c.c2})`;
    b.onclick = () => { APP.newRifaColor = i; haptic(5); renderRifaColorGrid(); };
    frag.appendChild(b);
  });
  g.innerHTML = ''; g.appendChild(frag);
}
function renderAccentGrid(){
  const g = document.getElementById('color-grid'); if(!g) return;
  const frag = document.createDocumentFragment();
  ACCENT_COLORS.forEach((c,i) => {
    const b = document.createElement('button');
    b.className = 'color-opt' + (i===APP.accentIdx?' active':'');
    b.style.background = c.primary;
    b.onclick = () => setAccent(i);
    frag.appendChild(b);
  });
  g.innerHTML = ''; g.appendChild(frag);
}
function selectPay(p){
  APP.salePay = p; haptic(5);
  const paid = document.getElementById('pay-paid'); const pending = document.getElementById('pay-pending');
  paid.style.background = p==='paid' ? 'var(--primary)' : 'var(--bg2)';
  paid.style.color = p==='paid' ? '#fff' : 'var(--text)';
  pending.style.background = p==='pending' ? 'var(--primary)' : 'var(--bg2)';
  pending.style.color = p==='pending' ? '#fff' : 'var(--text)';
}

async function saveRifa(){
  const name = document.getElementById('in-rifa-name').value.trim();
  const prize = document.getElementById('in-rifa-prize').value.trim();
  const price = parseFloat(document.getElementById('in-rifa-price').value) || 0;
  const total = parseInt(document.getElementById('in-rifa-total').value) || 0;
  const date = document.getElementById('in-rifa-date').value;
  const time = document.getElementById('in-rifa-time').value;
  const promoEnabled = APP.newRifaPromoEnabled;
  const promoQty = parseInt(document.getElementById('promo-qty').value) || 10;
  const promoPrice = parseFloat(document.getElementById('promo-price').value) || 10;
  if(!name){ toast('⚠️ Informe o nome'); haptic(50); return; }
  if(total <= 0){ toast('⚠️ Informe a qtd de números'); haptic(50); return; }
  if(promoEnabled && price > 0 && (promoPrice / promoQty) >= price){ toast('⚠️ A promoção não dá desconto'); haptic(50); return; }
  setSyncStatus('syncing', 'Salvando...');
  try{
    const { error } = await sb.from('rifas').insert({
      owner_id: APP.user.id, name, prize: prize || '—', price, total, date, time,
      emoji: APP.newRifaEmoji, color_idx: APP.newRifaColor, image: APP.newRifaImage, winner: null,
      promo_enabled: promoEnabled, promo_quantity: promoQty, promo_price: promoPrice, sales: []
    });
    if(error) throw error;
    closeModal('modal-rifa');
    await reloadRifas();
    setSyncStatus('', 'Sincronizado');
    haptic([10, 30, 10]);
    launchConfetti('small');
    toast('✨ Rifa criada!');
  }catch(err){
    console.error(err); setSyncStatus('error', 'Erro'); toast('❌ Erro ao salvar'); haptic(50);
  }
}

async function deleteRifa(id, ev){
  if(ev) ev.stopPropagation();
  const rifa = APP.rifas.find(r=>r.id===id); if(!rifa) return;
  if(rifa.isShared){ toast('⚠️ Você não é dono'); return; }
  showConfirm('Excluir rifa?', `"${rifa.name}" e ${rifa.sales.length} venda(s).`, 'danger', async () => {
    try{
      setSyncStatus('syncing', 'Excluindo...');
      await deleteRifaFromCloud(id);
      APP.rifas = APP.rifas.filter(r => r.id !== id);
      renderHome();
      setSyncStatus('', 'Sincronizado');
      haptic([20, 40, 20]);
      toast('🗑️ Excluída');
    }catch(err){ console.error(err); setSyncStatus('error', 'Erro'); toast('❌ Erro ao excluir'); }
  });
}

function renderHome(){
  updateGreeting();
  renderStats();
  const c = document.getElementById('home-rifas');
  const q = APP.search.toLowerCase().trim();
  if(q.length > 0){ renderSearchResults(q); return; }
  if(APP.rifas.length === 0){
    c.innerHTML = `<div class="empty"><span class="emo">🎟️</span><h3>Nenhuma rifa ainda</h3><p>Toque em <b>Nova Rifa</b> acima<br>para criar sua primeira!</p></div>`;
    return;
  }
  const minhas = APP.rifas.filter(r => !r.isShared);
  const compartilhadas = APP.rifas.filter(r => r.isShared);
  const frag = document.createDocumentFragment();
  if(minhas.length > 0){
    const title = document.createElement('div');
    title.className = 'section-title';
    title.innerHTML = `<h2>🎯 Minhas Rifas <span class="count">${minhas.length}</span></h2>`;
    frag.appendChild(title);
    minhas.forEach(r => frag.appendChild(createRifaCard(r)));
  }
  if(compartilhadas.length > 0){
    const title = document.createElement('div');
    title.className = 'section-title';
    title.style.marginTop = '20px';
    title.innerHTML = `<h2>👥 Compartilhadas comigo <span class="count">${compartilhadas.length}</span></h2>`;
    frag.appendChild(title);
    compartilhadas.forEach(r => frag.appendChild(createRifaCard(r)));
  }
  c.innerHTML = '';
  c.appendChild(frag);
  requestAnimationFrame(() => {
    c.querySelectorAll('.swipe-wrap[data-owner="true"]').forEach(wrap => initSwipe(wrap));
  });
}

function createRifaCard(r){
  const c1 = RIFA_COLORS[r.colorIdx||0].c1;
  const c2 = RIFA_COLORS[r.colorIdx||0].c2;
  const soldNums = new Set(r.sales.map(s=>s.num));
  const sold = soldNums.size;
  const pct = r.total ? Math.round(sold/r.total*100) : 0;
  const arrecadado = calcArrecadado(r);
  const pendente = calcPendente(r);
  const hasWinner = !!r.winner;
  const wrap = document.createElement('div');
  wrap.className = 'swipe-wrap';
  wrap.dataset.rifaId = r.id;
  wrap.dataset.owner = (!r.isShared).toString();
  const winnerHtml = hasWinner ? `<div class="card-winner">🏆 Nº ${r.winner.num} — ${escapeHtml(r.winner.name)}</div>` : '';
  const imageHtml = r.image ? `<div class="card-image"><img src="${r.image}" loading="lazy"></div>` : '';
  const sharedBadge = r.isShared ? `<div class="card-shared-badge">👥 Compartilhada</div>` : '';
  let priceLine = `R$ ${r.price.toFixed(2)} por número`;
  if(r.promo_enabled){
    priceLine = `R$ ${r.price.toFixed(2)} <span class="promo-tag">🎁 ${r.promo_quantity} por R$ ${r.promo_price.toFixed(2)}</span>`;
  }
  let meta = `<span class="mini-badge info">🎯 ${sold}/${r.total}</span>`;
  if(arrecadado > 0) meta += `<span class="mini-badge success">💰 R$ ${arrecadado.toFixed(2)}</span>`;
  if(pendente > 0) meta += `<span class="mini-badge warn">⏳ R$ ${pendente.toFixed(2)}</span>`;
  wrap.innerHTML = `
    <div class="swipe-bg"><svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg></div>
    <div class="rifa-card" style="--card-color:${c2}">
      ${winnerHtml}${sharedBadge}${imageHtml}
      <div class="card-body">
        <button class="card-list-btn">
          <svg viewBox="0 0 24 24"><path d="M3 5h2V3c-1.1 0-2 .9-2 2Zm0 8h2v-2H3v2Zm4 8h2v-2H7v2ZM3 9h2V7H3v2Zm10-6h-2v2h2V3Zm6 0v2h2c0-1.1-.9-2-2-2ZM5 21v-2H3c0 1.1.9 2 2 2Zm-2-4h2v-2H3v2ZM9 3H7v2h2V3Zm2 18h2v-2h-2v2Zm8-8h2v-2h-2v2Zm0 8c1.1 0 2-.9 2-2h-2v2Zm0-12h2V7h-2v2Zm0 8h2v-2h-2v2Zm-4 4h2v-2h-2v2Zm0-16h2V3h-2v2ZM7 17h10V7H7v10Zm2-8h6v6H9V9Z"/></svg>
        </button>
        <div class="rifa-top">
          <div class="rifa-avatar" style="background:linear-gradient(135deg,${c1},${c2})">${r.emoji}</div>
          <div class="rifa-info">
            <h3>${escapeHtml(r.name)}</h3>
            <p>${escapeHtml(r.prize)}</p>
            <div class="rifa-price-line">${priceLine}</div>
          </div>
        </div>
        <div class="rifa-progress"><div class="rifa-progress-fill" style="width:${pct}%"></div></div>
        <div class="rifa-meta">${meta}</div>
      </div>
    </div>`;
  const card = wrap.querySelector('.rifa-card');
  card.onclick = (e) => {
    if(e.target.closest('.card-list-btn')){ e.stopPropagation(); openListModal(r.id); return; }
    openRifa(r.id);
  };
  return wrap;
}

function renderSearchResults(q){
  const c = document.getElementById('home-rifas');
  const results = { rifas: [], compradores: [], numeros: [] };
  APP.rifas.forEach(r => {
    if(r.name.toLowerCase().includes(q) || r.prize.toLowerCase().includes(q)) results.rifas.push(r);
    r.sales.forEach(s => {
      if(s.name.toLowerCase().includes(q)) results.compradores.push({ rifa: r, sale: s });
      if(String(s.num).includes(q)) results.numeros.push({ rifa: r, sale: s });
    });
  });
  const total = results.rifas.length + results.compradores.length + results.numeros.length;
  if(total === 0){
    c.innerHTML = `<div class="empty"><span class="emo">🔍</span><h3>Nada encontrado</h3><p>Nenhum resultado para "<b>${escapeHtml(q)}</b>"</p></div>`;
    return;
  }
  const frag = document.createDocumentFragment();
  if(results.rifas.length > 0){
    const sec = document.createElement('div');
    sec.className = 'section-title';
    sec.innerHTML = `<h2>🎟️ Rifas <span class="count">${results.rifas.length}</span></h2>`;
    frag.appendChild(sec);
    results.rifas.forEach(r => frag.appendChild(createRifaCard(r)));
  }
  if(results.compradores.length > 0){
    const sec = document.createElement('div');
    sec.className = 'section-title';
    sec.style.marginTop = '16px';
    sec.innerHTML = `<h2>👤 Compradores <span class="count">${results.compradores.length}</span></h2>`;
    frag.appendChild(sec);
    const container = document.createElement('div');
    container.innerHTML = results.compradores.slice(0, 30).map(x => {
      const color = getAvatarColor(x.sale.name);
      return `<div class="search-result-item" data-action="buyer" data-name="${escapeHtml(x.sale.name)}" data-rifa="${x.rifa.id}" style="background:var(--card);border-radius:16px;padding:12px;margin-bottom:8px;display:flex;align-items:center;gap:12px;cursor:pointer;border:1px solid var(--border);">
        <div class="avatar" style="width:40px;height:40px;font-size:16px;background:linear-gradient(135deg,${color},${shade(color,-25)});">${getAvatarInitial(x.sale.name)}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:14px;font-weight:800;">${escapeHtml(x.sale.name)}</div>
          <div style="font-size:11px;color:var(--muted);">Nº ${x.sale.num} • ${escapeHtml(x.rifa.name)}</div>
        </div>
      </div>`;
    }).join('');
    frag.appendChild(container);
  }
  c.innerHTML = '';
  c.appendChild(frag);
  c.querySelectorAll('[data-action="buyer"]').forEach(el => {
    el.onclick = () => openBuyer(el.dataset.name, el.dataset.rifa);
  });
}

function renderStats(){
  let arrecadado = 0, pendente = 0, vendidos = 0;
  APP.rifas.forEach(r=>{
    arrecadado += calcArrecadado(r);
    pendente += calcPendente(r);
    vendidos += new Set(r.sales.map(s=>s.num)).size;
  });
  document.getElementById('stats-grid').innerHTML = `
    <div class="stat-card">
      <div class="stat-head"><div class="stat-label">Arrecadado</div><div class="stat-icon money">💰</div></div>
      <div class="stat-value">R$ ${arrecadado.toFixed(2)}</div>
      <div class="stat-sub">${vendidos} números vendidos</div>
    </div>
    <div class="stat-card">
      <div class="stat-head"><div class="stat-label">Pendente</div><div class="stat-icon pending">⏳</div></div>
      <div class="stat-value">R$ ${pendente.toFixed(2)}</div>
      <div class="stat-sub">${APP.rifas.length} rifa${APP.rifas.length!==1?'s':''}</div>
    </div>`;
}

document.getElementById('search-input').addEventListener('input', (e) => {
  APP.search = e.target.value;
  document.getElementById('clear-search').classList.toggle('show', APP.search.length > 0);
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => renderHome(), 280);
});
function clearSearch(){
  document.getElementById('search-input').value = '';
  APP.search = '';
  document.getElementById('clear-search').classList.remove('show');
  haptic(5); renderHome();
}

function initSwipe(wrap){
  const card = wrap.querySelector('.rifa-card'); if(!card) return;
  const rifaId = wrap.dataset.rifaId;
  let startX = 0, currentX = 0, isDragging = false, hasMoved = false;
  const onStart = (e) => {
    const touch = e.touches ? e.touches[0] : e;
    startX = touch.clientX; isDragging = true; hasMoved = false;
    card.style.transition = 'none';
  };
  const onMove = (e) => {
    if(!isDragging) return;
    const touch = e.touches ? e.touches[0] : e;
    currentX = touch.clientX - startX;
    if(Math.abs(currentX) > 5) hasMoved = true;
    if(currentX > 0) currentX = 0;
    if(currentX < -140) currentX = -140;
    card.style.transform = `translateX(${currentX}px)`;
  };
  const onEnd = () => {
    if(!isDragging) return;
    isDragging = false;
    card.style.transition = 'transform .25s ease';
    if(currentX < -100){
      card.style.transform = 'translateX(-100%)';
      setTimeout(()=>{ deleteRifa(rifaId); card.style.transform = ''; }, 180);
    } else card.style.transform = 'translateX(0)';
    currentX = 0;
  };
  card.addEventListener('touchstart', onStart, {passive:true});
  card.addEventListener('touchmove', onMove, {passive:true});
  card.addEventListener('touchend', onEnd);
  card.addEventListener('touchcancel', onEnd);
}

function openRifa(id){
  haptic(8);
  const r = APP.rifas.find(x=>x.id===id); if(!r) return;
  APP.currentRifa = r; APP.currentTab = 'numbers'; APP.gridFilter = 'all';
  const c2 = RIFA_COLORS[r.colorIdx||0].c2;
  document.getElementById('rifa-header').style.background = `linear-gradient(135deg,${c2},${shade(c2,-25)})`;
  document.getElementById('rifa-title').textContent = r.emoji + ' ' + r.name;
  document.getElementById('rifa-info').textContent = `🎁 ${r.prize}`;
  switchTab('numbers');
  document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));
  document.getElementById('screen-rifa').classList.add('active');
}

function switchTab(tab){
  haptic(5);
  APP.currentTab = tab;
  document.getElementById('tab-numbers').classList.toggle('active', tab==='numbers');
  document.getElementById('tab-sales').classList.toggle('active', tab==='sales');
  document.getElementById('tab-info').classList.toggle('active', tab==='info');
  document.getElementById('fab-rifa').style.display = tab === 'info' ? 'none' : 'flex';
  renderRifa();
}

function renderRifa(){
  clearTimeout(renderTimeout);
  renderTimeout = setTimeout(() => {
    const r = APP.currentRifa; if(!r) return;
    const c = document.getElementById('rifa-content');
    if(APP.currentTab === 'numbers') renderNumbersTab(c, r);
    else if(APP.currentTab === 'sales') renderSalesTab(c, r);
    else renderInfoTab(c, r);
  }, 0);
}

function renderNumbersTab(c, r){
  const soldNums = new Set(r.sales.map(s=>s.num));
  const paidNums = new Set(r.sales.filter(s=>s.paid).map(s=>s.num));
  const winnerNum = r.winner ? r.winner.num : null;
  const frag = document.createDocumentFragment();
  const counter = document.createElement('div');
  counter.className = 'quick-counter';
  counter.innerHTML = `
    <div class="qc-item paid"><div class="qc-value">${paidNums.size}</div><div class="qc-label">Pagos</div></div>
    <div class="qc-divider"></div>
    <div class="qc-item pending"><div class="qc-value">${soldNums.size - paidNums.size}</div><div class="qc-label">Pendentes</div></div>
    <div class="qc-divider"></div>
    <div class="qc-item available"><div class="qc-value">${r.total - soldNums.size}</div><div class="qc-label">Livres</div></div>
    ${winnerNum ? `<div class="qc-divider"></div><div class="qc-item winner"><div class="qc-value">${winnerNum}</div><div class="qc-label">🏆</div></div>` : ''}
    <div class="qc-divider"></div>
    <div class="qc-item total"><div class="qc-value">${r.total}</div><div class="qc-label">Total</div></div>
  `;
  frag.appendChild(counter);
  const filters = document.createElement('div');
  filters.className = 'filters-bar';
  filters.innerHTML = `
    <button class="filter-chip ${APP.gridFilter==='all'?'active':''}" data-filter="all">🎯 Todos</button>
    <button class="filter-chip ${APP.gridFilter==='paid'?'active':''}" data-filter="paid">✅ Pagos</button>
    <button class="filter-chip ${APP.gridFilter==='pending'?'active':''}" data-filter="pending">⏳ Pendentes</button>
    <button class="filter-chip ${APP.gridFilter==='available'?'active':''}" data-filter="available">⚪ Livres</button>
    ${winnerNum ? `<button class="filter-chip ${APP.gridFilter==='winner'?'active':''}" data-filter="winner">🏆 Ganhador</button>` : ''}
  `;
  filters.querySelectorAll('.filter-chip').forEach(b => {
    b.onclick = () => { APP.gridFilter = b.dataset.filter; haptic(5); renderRifa(); };
  });
  frag.appendChild(filters);
  if(r.winner){
    const dateStr = r.winner.date ? new Date(r.winner.date).toLocaleDateString('pt-BR') : '';
    const banner = document.createElement('div');
    banner.className = 'winner-banner';
    banner.innerHTML = `<div class="wb-label">🏆 Ganhador</div><div class="wb-number">Nº ${r.winner.num}</div><div class="wb-name">${escapeHtml(r.winner.name)}</div>${dateStr ? `<div class="wb-date">📅 ${dateStr}</div>` : ''}`;
    frag.appendChild(banner);
  }
  const pct = r.total ? Math.round(soldNums.size/r.total*100) : 0;
  const prog = document.createElement('div');
  prog.className = 'progress-bar';
  prog.innerHTML = `<div class="progress-fill" style="width:${pct}%"></div>`;
  frag.appendChild(prog);
  const grid = document.createElement('div');
  grid.className = 'numbers-grid';
  for(let i = 1; i <= r.total; i++){ grid.appendChild(createNumCell(i, soldNums, paidNums, winnerNum)); }
  grid.onclick = (e) => {
    const btn = e.target.closest('.num-cell'); if(!btn) return;
    const num = parseInt(btn.dataset.num); if(num) showNumInfo(num);
  };
  frag.appendChild(grid);
  c.innerHTML = '';
  c.appendChild(frag);
}

function createNumCell(i, soldNums, paidNums, winnerNum){
  const btn = document.createElement('button');
  const isPaid = paidNums.has(i);
  const isPending = soldNums.has(i) && !isPaid;
  const isWinner = winnerNum === i;
  let cls = 'num-cell';
  if(isWinner) cls += ' winner';
  else if(isPaid) cls += ' paid';
  else if(isPending) cls += ' pending';
  if(APP.gridFilter === 'paid' && !isPaid) cls += ' hidden-filter';
  else if(APP.gridFilter === 'pending' && !isPending) cls += ' hidden-filter';
  else if(APP.gridFilter === 'available' && soldNums.has(i)) cls += ' hidden-filter';
  else if(APP.gridFilter === 'winner' && !isWinner) cls += ' hidden-filter';
  btn.className = cls;
  btn.dataset.num = i;
  btn.textContent = i;
  return btn;
}

function renderSalesTab(c, r){
  if(r.sales.length === 0){
    c.innerHTML = `<div class="empty"><span class="emo">👥</span><h3>Nenhuma venda</h3><p>Toque no <b>+</b> para registrar!</p></div>`;
    return;
  }
  const grouped = {};
  r.sales.forEach(s => {
    const key = s.name;
    if(!grouped[key]) grouped[key] = { name: s.name, phone: s.phone || '', sales: [] };
    grouped[key].sales.push(s);
    if(s.phone && !grouped[key].phone) grouped[key].phone = s.phone;
  });
  const buyers = Object.values(grouped).sort((a, b) => a.name.localeCompare(b.name));
  const frag = document.createDocumentFragment();
  buyers.forEach(b => {
    b.sales.sort((x, y) => x.num - y.num);
    const totalPaid = b.sales.filter(s => s.paid).length;
    const totalPending = b.sales.length - totalPaid;
    const allPaid = totalPending === 0;
    const allPending = totalPaid === 0;
    const hasWinner = b.sales.some(s => r.winner && r.winner.num === s.num);
    let valuePaid = 0, valuePending = 0;
    b.sales.forEach(s => {
      const price = typeof s.price_charged === 'number' ? s.price_charged : r.price;
      if(s.paid) valuePaid += price; else valuePending += price;
    });
    let cls = 'buyer-card';
    if(allPending) cls += ' pending-all';
    else if(!allPaid) cls += ' partial';
    if(hasWinner) cls += ' winner-buyer';
    const color = getAvatarColor(b.name);
    const card = document.createElement('div');
    card.className = cls;
    const chipsHtml = b.sales.map(s => {
      const w = r.winner && r.winner.num === s.num ? '🏆' : '';
      const chipCls = s.paid ? 'paid' : 'pending';
      return `<button class="buyer-chip ${chipCls} ${w?'winner':''}" data-sid="${s.id}">${s.num}</button>`;
    }).join('');
    const badgeCls = allPaid ? 'all-paid' : allPending ? 'all-pending' : '';
    const badgeText = allPaid ? `R$ ${valuePaid.toFixed(2)}` : `${totalPaid}/${b.sales.length} pagos`;
    card.innerHTML = `
      <div class="buyer-header-row">
        <div class="buyer-avatar-sm" style="background:linear-gradient(135deg,${color},${shade(color,-25)});">${getAvatarInitial(b.name)}</div>
        <div class="buyer-info" data-action="open-buyer">
          <h4>${escapeHtml(b.name)} ${hasWinner ? '🏆' : ''}</h4>
          <p>${b.phone ? '📱 ' + escapeHtml(b.phone) + ' • ' : ''}${b.sales.length} número${b.sales.length>1?'s':''}</p>
        </div>
        <div class="buyer-total-badge ${badgeCls}">${badgeText}</div>
      </div>
      <div class="buyer-nums-label">🎯 Números (${b.sales.length})</div>
      <div class="buyer-nums-chips">${chipsHtml}</div>
      <div class="buyer-actions-row">
        ${!allPaid ? `<button class="buyer-action-btn primary" data-action="mark-all-paid" data-name="${escapeHtml(b.name)}">
          <svg viewBox="0 0 24 24"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          Marcar tudo
        </button>` : ''}
        <button class="buyer-action-btn" data-action="add-numbers" data-name="${escapeHtml(b.name)}" data-phone="${escapeHtml(b.phone)}">
          <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2Z"/></svg>
          Adicionar
        </button>
        <button class="buyer-action-btn" data-action="open-buyer" data-name="${escapeHtml(b.name)}">
          <svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>
          Detalhes
        </button>
      </div>
    `;
    card.onclick = (e) => {
      const chip = e.target.closest('.buyer-chip');
      if(chip){ e.stopPropagation(); togglePaid(parseInt(chip.dataset.sid)); return; }
      const actionBtn = e.target.closest('[data-action]');
      if(actionBtn){
        e.stopPropagation();
        const action = actionBtn.dataset.action;
        if(action === 'mark-all-paid') markAllPaid(b.name);
        else if(action === 'add-numbers') addNumbersToBuyer(b.name, b.phone);
        else if(action === 'open-buyer') openBuyer(b.name, r.id);
      }
    };
    frag.appendChild(card);
  });
  c.innerHTML = '';
  c.appendChild(frag);
}

async function markAllPaid(buyerName){
  const r = APP.currentRifa; if(!r) return;
  let count = 0;
  r.sales.forEach(s => { if(s.name === buyerName && !s.paid){ s.paid = true; count++; } });
  if(count === 0) return;
  try{
    await saveRifaCloud(r);
    const idx = APP.rifas.findIndex(x => x.id === r.id);
    if(idx >= 0) APP.rifas[idx] = r;
    renderRifa();
    haptic([20, 40, 20]);
    launchConfetti('small');
    toast(`✅ ${count} pago${count>1?'s':''}!`);
  }catch(err){ toast('❌ Erro ao salvar'); }
}

function addNumbersToBuyer(name, phone){
  haptic(8);
  openSaleModal();
  document.getElementById('in-sale-name').value = name;
  if(phone) document.getElementById('in-sale-phone').value = phone;
  updateRandomHint();
}

function renderInfoTab(c, r){
  const soldNums = new Set(r.sales.map(s=>s.num));
  const paid = r.sales.filter(s=>s.paid).length;
  const pending = r.sales.length - paid;
  const arrecadado = calcArrecadado(r);
  const totalPotencial = r.sales.length * r.price;
  const dataStr = r.date ? new Date(r.date+'T12:00:00').toLocaleDateString('pt-BR') : 'Não definida';
  const timeStr = r.time ? r.time : '';
  let html = '';
  if(r.image){ html += `<div class="prize-image"><img src="${r.image}" loading="lazy"></div>`; }
  else { html += `<div class="prize-image">${r.emoji}</div>`; }
  html += `<button class="btn btn-ghost" style="width:100%;margin-bottom:12px;" onclick="openEditImageModal()">${r.image ? '🔄 Trocar imagem' : '🖼️ Adicionar imagem'}</button>`;
  if(r.promo_enabled){
    const unitPromo = r.promo_price / r.promo_quantity;
    const saving = r.price - unitPromo;
    const pct = r.price > 0 ? Math.round((saving / r.price) * 100) : 0;
    html += `<div class="promo-info-banner"><div class="pib-icon">🎁</div><div class="pib-text"><strong>PROMOÇÃO ATIVA:</strong><br>Leve ${r.promo_quantity} por R$ ${r.promo_price.toFixed(2)}<br><span style="font-size:11.5px;opacity:.8;">Cada número sai por R$ ${unitPromo.toFixed(2)} (-${pct}%)</span></div></div>`;
  }
  if(r.winner){
    const wDate = r.winner.date ? new Date(r.winner.date).toLocaleDateString('pt-BR') : '';
    html += `<div class="winner-banner"><div class="wb-label">🏆 Ganhador Oficial</div><div class="wb-number">Nº ${r.winner.num}</div><div class="wb-name">${escapeHtml(r.winner.name)}</div>${wDate ? `<div class="wb-date">📅 ${wDate}</div>` : ''}</div>`;
  }
  html += `<div class="info-box"><div class="ib-icon">🎁</div><div class="ib-text"><strong>Prêmio:</strong> ${escapeHtml(r.prize)}<br><strong>Sorteio:</strong> ${dataStr}${timeStr ? ' às ' + timeStr : ''}</div></div>
  <div class="stat-card" style="margin-bottom:10px;cursor:default;">
    <div class="stat-label">💰 Arrecadado</div>
    <div class="stat-value">R$ ${arrecadado.toFixed(2)}</div>
    <div class="stat-sub">de R$ ${totalPotencial.toFixed(2)} vendidos</div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;">
    <div class="stat-card" style="cursor:default;"><div class="stat-label">✅ Pagos</div><div class="stat-value">${paid}</div></div>
    <div class="stat-card" style="cursor:default;"><div class="stat-label">⏳ Pendentes</div><div class="stat-value">${pending}</div></div>
    <div class="stat-card" style="cursor:default;"><div class="stat-label">🎯 Vendidos</div><div class="stat-value">${soldNums.size}</div></div>
    <div class="stat-card" style="cursor:default;"><div class="stat-label">🆓 Livres</div><div class="stat-value">${r.total - soldNums.size}</div></div>
  </div>
  <button class="btn btn-ghost" style="width:100%;margin-bottom:10px;" onclick="openEditPromoModal()">🎁 ${r.promo_enabled ? 'Editar promoção' : 'Adicionar promoção'}</button>`;
  if(!r.isShared){
    html += `<button class="btn btn-ghost" style="width:100%;margin-bottom:10px;color:var(--primary);" onclick="openShareModal()">👥 Compartilhar com alguém</button>`;
  }
  if(r.winner){
    html += `<button class="btn btn-ghost" style="width:100%;margin-bottom:10px;color:var(--danger);" onclick="removeWinner()">❌ Remover ganhador</button>`;
  } else {
    html += `<button class="btn-winner" onclick="openWinnerModal()"><svg viewBox="0 0 24 24"><path d="M5 16 3 5h4l1 6 4-6h4l-4 6h1l-4 6h-4Zm14-11v2h2l-2 9h-2l-1-5-1 5h-2l-2-9h2v-2h6Z"/></svg> Marcar Ganhador</button>`;
  }
  html += `<button class="btn btn-primary" style="width:100%;margin-bottom:8px;" onclick="shareMarketingText()">📢 Divulgação</button>`;
  html += `<button class="btn btn-ghost" style="width:100%;margin-bottom:8px;" onclick="openListModal('${r.id}')">📋 Gerar lista</button>`;
  html += `<button class="btn btn-accent" style="width:100%;" onclick="startSort('${r.id}')">🎲 Sortear agora</button>`;
  c.innerHTML = html;
}

function openEditPromoModal(){
  haptic(8);
  const r = APP.currentRifa; if(!r) return;
  let modal = document.getElementById('modal-edit-promo');
  if(!modal){
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
              <div><div class="promo-title">Ativar promoção</div><div class="promo-subtitle">Desconto por quantidade</div></div>
            </div>
            <div class="switch small" id="edit-promo-switch" onclick="toggleEditPromo()"></div>
          </div>
          <div class="promo-content">
            <div class="promo-row">
              <span class="promo-row-label">Leve</span>
              <input type="number" id="edit-promo-qty" min="2" inputmode="numeric" oninput="updateEditPromoSummary()">
              <span class="promo-row-label">por apenas</span>
              <span class="promo-row-label" style="font-weight:800;">R$</span>
              <input type="number" id="edit-promo-price" min="0.01" step="0.01" class="money" inputmode="decimal" oninput="updateEditPromoSummary()">
            </div>
            <div class="promo-summary" id="edit-promo-summary"></div>
          </div>
        </div>
        <div class="info-box" style="margin-top:10px;"><div class="ib-icon">💡</div><div class="ib-text" style="font-size:11.5px;"><strong>Importante:</strong> Vendas antigas <strong>não mudam</strong> de preço.</div></div>
        <div class="modal-actions">
          <button class="btn btn-ghost" onclick="closeModal('modal-edit-promo')">Cancelar</button>
          <button class="btn btn-primary" onclick="saveEditPromo()">Salvar</button>
        </div>
      </div>
    `;
    document.querySelector('.app').appendChild(modal);
    modal.addEventListener('click', e => { if(e.target === modal) modal.classList.remove('show'); });
  }
  document.getElementById('edit-promo-qty').value = r.promo_quantity || 10;
  document.getElementById('edit-promo-price').value = r.promo_price || 10;
  const sw = document.getElementById('edit-promo-switch');
  const box = document.getElementById('edit-promo-box');
  sw.classList.toggle('on', r.promo_enabled);
  box.classList.toggle('disabled', !r.promo_enabled);
  window._editPromoEnabled = r.promo_enabled;
  updateEditPromoSummary();
  modal.classList.add('show');
}
function toggleEditPromo(){
  window._editPromoEnabled = !window._editPromoEnabled;
  const sw = document.getElementById('edit-promo-switch');
  const box = document.getElementById('edit-promo-box');
  sw.classList.toggle('on', window._editPromoEnabled);
  box.classList.toggle('disabled', !window._editPromoEnabled);
  haptic(8);
  updateEditPromoSummary();
}
function updateEditPromoSummary(){
  const r = APP.currentRifa; if(!r) return;
  const qty = parseInt(document.getElementById('edit-promo-qty').value) || 0;
  const promoPrice = parseFloat(document.getElementById('edit-promo-price').value) || 0;
  const el = document.getElementById('edit-promo-summary');
  if(!window._editPromoEnabled){ el.innerHTML = '💡 Ative para configurar'; return; }
  if(qty < 2 || promoPrice <= 0){ el.innerHTML = '⚠️ Preencha os valores'; return; }
  const unitPromo = promoPrice / qty;
  const saving = r.price - unitPromo;
  const pct = r.price > 0 ? Math.round((saving / r.price) * 100) : 0;
  if(saving <= 0){ el.innerHTML = `⚠️ A promoção não dá desconto`; return; }
  el.innerHTML = `💡 Cada número sai por <strong>R$ ${unitPromo.toFixed(2)}</strong><span class="save-badge">-${pct}%</span>`;
}
async function saveEditPromo(){
  const r = APP.currentRifa; if(!r) return;
  const enabled = window._editPromoEnabled;
  const qty = parseInt(document.getElementById('edit-promo-qty').value) || 10;
  const price = parseFloat(document.getElementById('edit-promo-price').value) || 10;
  if(enabled && r.price > 0 && (price / qty) >= r.price){ toast('⚠️ A promoção não dá desconto'); haptic(50); return; }
  r.promo_enabled = enabled; r.promo_quantity = qty; r.promo_price = price;
  try{
    await saveRifaCloud(r);
    const idx = APP.rifas.findIndex(x => x.id === r.id);
    if(idx >= 0) APP.rifas[idx] = r;
    closeModal('modal-edit-promo');
    renderRifa(); renderHome();
    haptic([10, 30, 10]);
    toast(enabled ? '🎁 Promoção ativada!' : '🎁 Promoção desativada');
  }catch(err){ toast('❌ Erro ao salvar'); }
}

function openRandomNumbersModal(){
  haptic(8);
  const r = APP.currentRifa; if(!r) return;
  const soldNums = new Set(r.sales.map(s=>s.num));
  const available = r.total - soldNums.size;
  if(available === 0){ toast('⚠️ Todos vendidos'); return; }
  document.getElementById('in-random-count').value = '';
  document.getElementById('in-random-count').max = available;
  document.getElementById('random-hint').textContent = `${available} disponíveis`;
  document.getElementById('modal-random').classList.add('show');
  setTimeout(() => document.getElementById('in-random-count').focus(), 300);
}
function confirmRandomNumbers(){
  const r = APP.currentRifa; if(!r) return;
  const count = parseInt(document.getElementById('in-random-count').value);
  if(!count || count < 1){ toast('⚠️ Informe a quantidade'); haptic(50); return; }
  const soldNums = new Set(r.sales.map(s=>s.num));
  const available = [];
  for(let i = 1; i <= r.total; i++){ if(!soldNums.has(i)) available.push(i); }
  if(count > available.length){ toast(`⚠️ Só tem ${available.length}`); haptic(50); return; }
  const selected = [];
  const pool = [...available];
  for(let i = 0; i < count; i++){
    const idx = Math.floor(Math.random() * pool.length);
    selected.push(pool.splice(idx, 1)[0]);
  }
  selected.sort((a,b) => a - b);
  const input = document.getElementById('in-sale-nums');
  const current = input.value.trim();
  const currentNums = current ? current.split(',').map(n => n.trim()).filter(n => n && !isNaN(parseInt(n))).map(n => parseInt(n)) : [];
  const all = [...currentNums, ...selected];
  input.value = all.join(', ');
  closeModal('modal-random');
  haptic([10, 30, 10]);
  updateSaleCalc();
  toast(`🎲 ${count} aleatório${count>1?'s':''}`);
}
function updateRandomHint(){
  const el = document.getElementById('random-hint'); if(!el) return;
  const r = APP.currentRifa; if(!r){ el.textContent = ''; return; }
  const soldNums = new Set(r.sales.map(s=>s.num));
  const available = r.total - soldNums.size;
  el.textContent = `${available} disponíveis`;
}
function updateSaleCalc(){
  const input = document.getElementById('in-sale-nums');
  const calc = document.getElementById('sale-calc');
  if(!input || !calc) return;
  const r = APP.currentRifa; if(!r) return;
  const numsStr = input.value.trim();
  if(!numsStr){ calc.classList.remove('show'); return; }
  const nums = numsStr.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
  if(nums.length === 0){ calc.classList.remove('show'); return; }
  const count = nums.length;
  const result = calcSaleCost(count, r);
  let html = '';
  result.faixas.forEach(f => {
    const label = f.isPromo ? `🎁 ${f.qty} × R$ ${f.unitPrice.toFixed(2)}` : `${f.qty} × R$ ${f.unitPrice.toFixed(2)}`;
    html += `<div class="sale-calc-row"><span>${label}</span><span class="val">R$ ${f.subtotal.toFixed(2)}</span></div>`;
  });
  html += `<div class="sale-calc-divider"></div>`;
  html += `<div class="sale-calc-total"><span>💵 TOTAL</span><span class="val">R$ ${result.total.toFixed(2)}</span></div>`;
  if(result.savings > 0){
    const pct = Math.round((result.savings / result.semPromo) * 100);
    html += `<div class="sale-calc-saving">🎁 Você economizou R$ ${result.savings.toFixed(2)} <span class="pct">-${pct}%</span></div>`;
  }
  calc.innerHTML = html;
  calc.classList.add('show');
}

async function saveSale(){
  const name = document.getElementById('in-sale-name').value.trim();
  const phone = document.getElementById('in-sale-phone').value.trim();
  const numsStr = document.getElementById('in-sale-nums').value.trim();
  if(!name){ toast('⚠️ Informe o nome'); haptic(50); return; }
  if(!numsStr){ toast('⚠️ Informe os números'); haptic(50); return; }
  const nums = numsStr.split(',').map(n=>parseInt(n.trim())).filter(n=>!isNaN(n));
  if(nums.length === 0){ toast('⚠️ Números inválidos'); haptic(50); return; }
  const r = APP.currentRifa;
  const existing = new Set(r.sales.map(s=>s.num));
  const invalids = nums.filter(n => n < 1 || n > r.total);
  const dups = nums.filter(n => existing.has(n));
  if(invalids.length > 0){ toast(`⚠️ Inválidos: ${invalids.join(', ')}`); haptic(50); return; }
  if(dups.length > 0){ toast(`⚠️ Já vendidos: ${dups.join(', ')}`); haptic(50); return; }
  const unique = [...new Set(nums)];
  unique.sort((a,b) => a - b);
  const result = calcSaleCost(unique.length, r);
  const unitEffective = result.total / unique.length;
  const timestamp = Date.now();
  const soldAt = new Date().toISOString();
  const sellerName = APP.profile?.name || APP.user.email;
  const sellerId = APP.user.id;
  unique.forEach((num, i) => {
    r.sales.push({
      id: timestamp + i, num, name, phone,
      paid: APP.salePay === 'paid', date: soldAt,
      price_charged: unitEffective,
      promo_applied: result.promoApplied,
      promo_savings: result.savings / unique.length,
      promo_config: r.promo_enabled ? { quantity: r.promo_quantity, price: r.promo_price } : null,
      sold_by_id: sellerId, sold_by_name: sellerName, sold_by_email: APP.user.email
    });
  });
  try{
    await saveRifaCloud(r);
    const idx = APP.rifas.findIndex(x => x.id === r.id);
    if(idx >= 0) APP.rifas[idx] = r;
    closeModal('modal-sale');
    renderRifa();
    haptic([10, 30, 10]);
    launchConfetti('small');
    let msg = `✅ ${unique.length} número${unique.length>1?'s':''} vendido${unique.length>1?'s':''}!`;
    if(result.savings > 0) msg += ` 🎁 -R$ ${result.savings.toFixed(2)}`;
    toast(msg, 3000);
  }catch(err){ console.error(err); toast('❌ Erro ao salvar'); }
}
async function togglePaid(sid){
  const s = APP.currentRifa.sales.find(x=>x.id===sid); if(!s) return;
  s.paid = !s.paid;
  haptic(s.paid ? [10, 30, 10] : 10);
  if(s.paid) launchConfetti('small');
  try{
    await saveRifaCloud(APP.currentRifa);
    const idx = APP.rifas.findIndex(x => x.id === APP.currentRifa.id);
    if(idx >= 0) APP.rifas[idx] = APP.currentRifa;
    renderRifa();
  }catch(err){ toast('❌ Erro ao salvar'); }
}

function showNumInfo(num){
  haptic(8);
  const r = APP.currentRifa;
  const s = r.sales.find(x=>x.num===num);
  if(!s){
    openSaleModal();
    document.getElementById('in-sale-nums').value = num;
    updateSaleCalc(); updateRandomHint();
    return;
  }
  displayNumInfo(num, s, r);
}
function displayNumInfo(num, s, r){
  const isWinner = r.winner && r.winner.num === num;
  const icon = document.getElementById('num-info-icon');
  icon.textContent = isWinner ? '🏆' : '🎯';
  icon.className = 'confirm-icon ' + (isWin)
}