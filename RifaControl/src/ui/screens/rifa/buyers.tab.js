/* ============================================================
   Buyers Tab — Aba de Compradores
   ============================================================ */

import { APP } from '../../../config/state.js';
import { haptic } from '../../../utils/haptic.js';
import { escapeHtml, formatBRL, getAvatarColor, getAvatarInitial } from '../../../utils/format.js';
import { groupSalesByBuyer } from '../../../services/sales.service.js';
import { getRifa } from '../../../services/rifas.service.js';
import { showConfirm } from '../../components/confirm.js';
import { toast } from '../../components/toast.js';

// --- Estado local da tela (Filtros) ---
let search = '';
let filter = 'all'; // all | paid | pending | partial
let sort = 'name';  // name | value | pending | cotas
let expanded = new Set();

export function resetBuyersState() {
  search = '';
  filter = 'all';
  sort = 'name';
  expanded.clear();
}

export function renderSalesTab(c, r) {
  if (r.sales.length === 0) {
    c.innerHTML = `<div class="empty"><span class="emo">👥</span><h3>Nenhuma venda</h3><p>Toque no <b>+</b> para registrar!</p></div>`;
    return;
  }

  const grouped = groupSalesByBuyer(r);
  let buyers = Object.values(grouped);

  if (search) {
    const q = search.toLowerCase();
    buyers = buyers.filter(b => 
      b.name.toLowerCase().includes(q) || 
      (b.phone && b.phone.includes(q))
    );
  }

  buyers = buyers.filter(b => {
    const allPaid = b.totalPending === 0;
    const allPending = b.totalPaid === 0;
    if (filter === 'paid') return allPaid;
    if (filter === 'pending') return allPending;
    if (filter === 'partial') return !allPaid && !allPending;
    return true;
  });

  buyers.sort((a, b) => {
    if (sort === 'value') return b.valuePaid + b.valuePending - (a.valuePaid + a.valuePending);
    if (sort === 'pending') return b.valuePending - a.valuePending;
    if (sort === 'cotas') return b.sales.length - a.sales.length;
    return a.name.localeCompare(b.name);
  });

  const frag = document.createDocumentFragment();

  // --- TopBar (Busca e Filtros) ---
  const topBar = document.createElement('div');
  topBar.className = 'buyers-topbar';
  topBar.innerHTML = `
    <div class="buyers-search">
      <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5Zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14Z"/></svg>
      <input type="text" id="buyers-search-input" placeholder="Buscar comprador..." value="${escapeHtml(search)}">
    </div>
    <div class="buyers-filters">
      <button class="b-filter ${filter === 'all' ? 'active' : ''}" data-filter="all">Todos</button>
      <button class="b-filter ${filter === 'paid' ? 'active' : ''}" data-filter="paid">✅ Pagos</button>
      <button class="b-filter ${filter === 'pending' ? 'active' : ''}" data-filter="pending">⏳ Pend.</button>
      <button class="b-filter ${filter === 'partial' ? 'active' : ''}" data-filter="partial">🟡 Parc.</button>
    </div>
    <div class="buyers-sort">
      <select id="buyers-sort-select">
        <option value="name" ${sort === 'name' ? 'selected' : ''}>Nome (A-Z)</option>
        <option value="value" ${sort === 'value' ? 'selected' : ''}>Maior valor</option>
        <option value="pending" ${sort === 'pending' ? 'selected' : ''}>Maior pendência</option>
        <option value="cotas" ${sort === 'cotas' ? 'selected' : ''}>Mais cotas</option>
      </select>
    </div>
  `;
  frag.appendChild(topBar);

  // --- Lista de Compradores ---
  const listWrapper = document.createElement('div');
  listWrapper.className = 'buyers-list-wrapper';

  if (buyers.length === 0) {
    listWrapper.innerHTML = `<div class="empty" style="padding:30px;"><span class="emo">🔍</span><h3>Nenhum resultado</h3><p>Ajuste os filtros ou a busca.</p></div>`;
  } else {
    buyers.forEach(b => {
      const allPaid = b.totalPending === 0;
      const allPending = b.totalPaid === 0;
      const isExpanded = expanded.has(b.name);

      let statusCls = 'status-partial';
      let statusText = 'Parcial';
      if (allPaid) { statusCls = 'status-paid'; statusText = 'Pago'; }
      else if (allPending) { statusCls = 'status-pending'; statusText = 'Pendente'; }

      const color = getAvatarColor(b.name);
      const initial = getAvatarInitial(b.name);
      
      const numsPreview = b.sales.slice(0, 4).map(s => s.num).join(', ');
      const numsMore = b.sales.length > 4 ? ` +${b.sales.length - 4}` : '';

      const totalVal = b.valuePaid + b.valuePending;

      const row = document.createElement('div');
      row.className = `buyer-row ${isExpanded ? 'expanded' : ''}`;
      
      row.innerHTML = `
        <div class="buyer-row-main" data-action="toggle-expand">
          <div class="br-avatar" style="background:${color};">${initial}</div>
          
          <div class="br-info">
            <div class="br-name">${escapeHtml(b.name)}</div>
            <div class="br-nums">🎯 ${numsPreview}${numsMore}</div>
          </div>
          
          <div class="br-value">
            <div class="br-total">${formatBRL(totalVal)}</div>
            <div class="br-paid">${formatBRL(b.valuePaid)} pago</div>
          </div>
          
          <div class="br-status ${statusCls}">
            ${statusText}
          </div>
          
          <button class="br-menu-btn" data-action="open-menu">⋮</button>
        </div>
        
        <div class="buyer-row-details">
          <div class="brd-chips">
            ${b.sales.map(s => {
              const w = r.winner && r.winner.num === s.num ? 'winner' : '';
              const chipCls = s.paid ? 'paid' : 'pending';
              return `<button class="buyer-chip ${chipCls} ${w}" data-sid="${s.id}">${s.num}</button>`;
            }).join('')}
          </div>
          <div class="brd-actions">
            ${!allPaid ? `<button class="btn btn-primary btn-sm" data-action="mark-all-paid">✅ Marcar tudo</button>` : ''}
            <button class="btn btn-ghost btn-sm" data-action="add-numbers">➕ Adicionar</button>
            <button class="btn btn-ghost btn-sm" data-action="open-buyer">👤 Detalhes</button>
            ${b.phone ? `<button class="btn btn-ghost btn-sm" data-action="whatsapp">💬 WhatsApp</button>` : ''}
            <button class="btn btn-ghost btn-sm text-danger" data-action="delete-buyer">🗑️ Excluir</button>
          </div>
        </div>
      `;

      row.onclick = async (e) => {
        e.stopPropagation();

        const chip = e.target.closest('.buyer-chip');
        if (chip) {
          const { togglePaid } = await import('../../modals/sale.modal.js');
          togglePaid(parseInt(chip.dataset.sid));
          return;
        }

        const actionBtn = e.target.closest('[data-action]');
        if (!actionBtn) return;
        const action = actionBtn.dataset.action;

        if (action === 'toggle-expand' || action === 'open-menu') {
          if (expanded.has(b.name)) expanded.delete(b.name);
          else expanded.add(b.name);
          import('../rifa.screen.js').then(m => m.renderRifa());
        }
        else if (action === 'mark-all-paid') {
          const { markAllPaid } = await import('../../modals/sale.modal.js');
          markAllPaid(b.name);
        }
        else if (action === 'add-numbers') {
          const { addNumbersToBuyer } = await import('../../modals/sale.modal.js');
          addNumbersToBuyer(b.name, b.phone);
        }
        else if (action === 'open-buyer') {
          const { openBuyer } = await import('../buyer.screen.js');
          openBuyer(b.name, r.id);
        }
        else if (action === 'whatsapp') {
          shareWhatsBuyer(b.name, r.id);
        }
        else if (action === 'delete-buyer') {
          deleteBuyerSales(r, b.name);
        }
      };

      listWrapper.appendChild(row);
    });
  }

  frag.appendChild(listWrapper);
  c.innerHTML = '';
  c.appendChild(frag);

  // Bind da busca
  const searchInput = document.getElementById('buyers-search-input');
  if (searchInput) {
    let timeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        search = e.target.value;
        import('../rifa.screen.js').then(m => {
          m.renderRifa();
          const newInput = document.getElementById('buyers-search-input');
          if (newInput) {
            newInput.focus();
            newInput.setSelectionRange(newInput.value.length, newInput.value.length);
          }
        });
      }, 400);
    });
  }

  // Bind dos filtros
  document.querySelectorAll('.b-filter').forEach(btn => {
    btn.onclick = () => {
      filter = btn.dataset.filter;
      haptic(5);
      import('../rifa.screen.js').then(m => m.renderRifa());
    };
  });

  // Bind da ordenação
  const sortSelect = document.getElementById('buyers-sort-select');
  if (sortSelect) {
    sortSelect.onchange = (e) => {
      sort = e.target.value;
      haptic(5);
      import('../rifa.screen.js').then(m => m.renderRifa());
    };
  }
}

function shareWhatsBuyer(buyerName, rifaId) {
  const r = getRifa(rifaId);
  if (!r) return;
  const sales = r.sales.filter(s => s.name === buyerName);
  if (sales.length === 0 || !sales[0].phone) return;
  const phone = sales[0].phone.replace(/\D/g,'');
  const phoneFull = phone.length <= 11 ? '55' + phone : phone;
  const nums = sales.map(s=>s.num).join(', ');
  let total = 0;
  sales.forEach(s => { total += typeof s.price_charged === 'number' ? s.price_charged : r.price; });
  const msg = `Olá ${buyerName}! 🎟️\n\nSeus números na rifa *${r.name}*:\n\n🎯 ${nums}\n💰 Total: ${formatBRL(total)}\n${r.date ? '📅 ' + new Date(r.date+'T12:00:00').toLocaleDateString('pt-BR') + (r.time ? ' às ' + r.time : '') + '\n' : ''}\nBoa sorte! 🍀`;
  haptic(15);
  window.open(`https://wa.me/${phoneFull}?text=${encodeURIComponent(msg)}`, '_blank');
}

function deleteBuyerSales(rifa, buyerName) {
  showConfirm(
    'Excluir comprador?',
    `Todas as vendas de "${buyerName}" serão removidas.`,
    'danger',
    async () => {
      rifa.sales = rifa.sales.filter(s => s.name !== buyerName);
      try {
        const { saveRifaCloud } = await import('../../../services/rifas.service.js');
        await saveRifaCloud(rifa);
        const idx = APP.rifas.findIndex(x => x.id === rifa.id);
        if (idx >= 0) APP.rifas[idx] = rifa;
        import('../rifa.screen.js').then(m => m.renderRifa());
        haptic([20, 40, 20]);
        toast('🗑️ Vendas removidas');
      } catch (err) {
        console.error(err);
        toast('❌ Erro ao excluir');
      }
    }
  );
}