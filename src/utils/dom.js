/* ============================================================
   DOM — atalhos e helpers para manipulação do DOM
   ============================================================ */

/**
 * Atalho para document.querySelector.
 * Uso: $('#meu-id'), $('.minha-classe')
 */
export function $(sel, parent = document) {
  return parent.querySelector(sel);
}

/**
 * Atalho para document.querySelectorAll (retorna Array).
 */
export function $$(sel, parent = document) {
  return Array.from(parent.querySelectorAll(sel));
}

/**
 * Cria um elemento com atributos e filhos.
 * Uso: createEl('div', { className: 'x' }, [child1, child2])
 */
export function createEl(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'className') el.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on') && typeof v === 'function') {
      el.addEventListener(k.slice(2).toLowerCase(), v);
    }
    else if (k === 'dataset' && typeof v === 'object') {
      Object.entries(v).forEach(([dk, dv]) => { el.dataset[dk] = dv; });
    }
    else el.setAttribute(k, v);
  });
  const list = Array.isArray(children) ? children : [children];
  list.forEach(c => {
    if (c == null) return;
    if (typeof c === 'string') el.appendChild(document.createTextNode(c));
    else el.appendChild(c);
  });
  return el;
}

/**
 * Adiciona/remove classe condicionalmente.
 */
export function toggleClass(el, className, force) {
  if (!el) return;
  el.classList.toggle(className, force);
}

/**
 * Substitui conteúdo com segurança (aceita texto ou nó).
 */
export function setHTML(el, html) {
  if (!el) return;
  el.innerHTML = html;
}

/**
 * Escuta um evento com cleanup.
 */
export function on(el, event, handler, options) {
  if (!el) return () => {};
  el.addEventListener(event, handler, options);
  return () => el.removeEventListener(event, handler, options);
}

/**
 * Debounce simples.
 */
export function debounce(fn, delay = 300) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}