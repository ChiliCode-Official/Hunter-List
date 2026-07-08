// =====================================================
//  HUNTER LIST — Main Application Logic
// =====================================================

import './style.css';
import { loadState, saveState, buildDefaultState } from './data.js';

// ── State ────────────────────────────────────────────
let state = loadState();
let editTarget = null; // { collectionId, catName, itemId }
let addTarget  = null; // { collectionId, catName }
let lastDeletedItem = null;
let undoToastEl = null;
let undoTimeout = null;

// ── DOM References ───────────────────────────────────
const collectionsTabsEl  = document.getElementById('collections-tabs');
const collectionViewEl   = document.getElementById('collection-view');
const headerStatsEl      = document.getElementById('header-stats');
const progressFillEl     = document.getElementById('progress-fill');
const progressLabelEl    = document.getElementById('progress-label');
const progressPctEl      = document.getElementById('progress-pct');

// Edit Modal
const modalOverlay    = document.getElementById('modal-overlay');
const modalInput      = document.getElementById('modal-input');
const modalSave       = document.getElementById('modal-save');
const modalDelete     = document.getElementById('modal-delete');
const modalClose      = document.getElementById('modal-close');

// Add Modal
const addModalOverlay = document.getElementById('add-modal-overlay');
const addModalInput   = document.getElementById('add-modal-input');
const addModalSave    = document.getElementById('add-modal-save');
const addModalCancel  = document.getElementById('add-modal-cancel');
const addModalClose   = document.getElementById('add-modal-close');

// ── Helpers ──────────────────────────────────────────
function genId() {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}

function showToast(msg) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2200);
}

// ── Compute Stats ────────────────────────────────────
function getCollectionStats(collId) {
  const colData = state.data[collId];
  if (!colData) return { total: 0, checked: 0 };
  let total = 0, checked = 0;
  for (const cat of Object.values(colData)) {
    for (const item of cat.items) {
      total++;
      if (item.checked) checked++;
    }
  }
  return { total, checked };
}

function getCategoryStats(colId, catName) {
  const cat = state.data[colId]?.[catName];
  if (!cat) return { total: 0, checked: 0 };
  const total   = cat.items.length;
  const checked = cat.items.filter(i => i.checked).length;
  return { total, checked };
}

// ── Progress Ring SVG ────────────────────────────────
function buildRingSVG(checked, total) {
  const pct = total > 0 ? checked / total : 0;
  const r = 14;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  return `
    <svg width="36" height="36" viewBox="0 0 36 36">
      <circle class="ring-bg"   cx="18" cy="18" r="${r}" />
      <circle class="ring-fill" cx="18" cy="18" r="${r}"
        stroke-dasharray="${circ}"
        stroke-dashoffset="${offset}"
      />
    </svg>
    <div class="ring-text">${Math.round(pct * 100)}%</div>
  `;
}

// ── Render Tabs ──────────────────────────────────────
function renderTabs() {
  collectionsTabsEl.innerHTML = '';
  for (const col of state.collections) {
    const stats = getCollectionStats(col.id);
    const btn = document.createElement('button');
    btn.className = 'tab-btn' + (col.id === state.activeCollection ? ' active' : '');
    btn.dataset.colId = col.id;
    btn.innerHTML = `
      <span>${col.icon}</span>
      <span>${col.name}</span>
      <span class="tab-badge">${stats.checked}/${stats.total}</span>
    `;
    btn.addEventListener('click', () => {
      state.activeCollection = col.id;
      saveState(state);
      renderTabs();
      renderCollection();
      updateGlobalProgress();
    });
    collectionsTabsEl.appendChild(btn);
  }
}

// ── Render Header Stats ──────────────────────────────
function renderHeaderStats() {
  const { total, checked } = getCollectionStats(state.activeCollection);
  headerStatsEl.innerHTML = `
    <div class="stat-pill">🎯 ${checked} / ${total} Listo</div>
  `;
}

// ── Update Progress Bar ──────────────────────────────
function updateGlobalProgress() {
  const { total, checked } = getCollectionStats(state.activeCollection);
  const pct = total > 0 ? Math.round((checked / total) * 100) : 0;
  progressFillEl.style.width = pct + '%';
  progressLabelEl.textContent = `${checked} / ${total} Items`;
  progressPctEl.textContent   = pct + '%';

  const container = document.getElementById('progress-bar-container');
  if (container) {
    if (pct === 100 && total > 0) {
      container.classList.remove('complete');
      void container.offsetWidth; // trigger reflow
      container.classList.add('complete');
    } else {
      container.classList.remove('complete');
    }
  }

  renderHeaderStats();
  renderTabs(); // Update badge counters
}

// ── Render Collection ────────────────────────────────
function renderCollection() {
  const colId  = state.activeCollection;
  const colCfg = state.collections.find(c => c.id === colId);
  const colData = state.data[colId];

  if (!colData || !colCfg) {
    collectionViewEl.innerHTML = `<div class="empty-state"><div class="empty-icon">🎯</div><p>No hay colección activa.</p></div>`;
    return;
  }

  const { total, checked } = getCollectionStats(colId);

  let html = `
    <div class="collection-header">
      <div class="collection-title-block">
        <span class="collection-icon">${colCfg.icon}</span>
        <div>
          <div class="collection-title">${colCfg.name}</div>
          <div class="collection-subtitle">${colCfg.subtitle} · ${checked} de ${total} listos</div>
          <div class="collection-actions">
            <button class="btn-text" id="btn-expand-all">Abrir todo</button>
            <span style="color:var(--clr-text-muted);font-size:0.7rem">•</span>
            <button class="btn-text" id="btn-collapse-all">Cerrar todo</button>
          </div>
        </div>
      </div>
      <button class="btn-reset-collection" data-col-id="${colId}" title="Resetear esta colección">
        ↺ Resetear
      </button>
    </div>
    <div class="categories-grid">
  `;

  for (const [catName, catData] of Object.entries(colData)) {
    const catStats = getCategoryStats(colId, catName);
    const isCollapsed = catData.collapsed ? 'collapsed' : '';

    html += `
      <div class="category-card ${isCollapsed}" data-col="${colId}" data-cat="${catName}">
        <div class="category-card-header" data-toggle-cat="${catName}">
          <div class="category-name-block">
            <span class="category-icon">${catData.icon}</span>
            <div>
              <div class="category-name">${catName}</div>
              <div class="category-count">${catStats.checked} / ${catStats.total}</div>
            </div>
          </div>
          <div class="category-header-right">
            <div class="category-progress-ring">
              ${buildRingSVG(catStats.checked, catStats.total)}
            </div>
            <span class="category-chevron">▾</span>
          </div>
        </div>
        <ul class="category-items-list">
    `;

    for (const item of catData.items) {
      const checkedClass = item.checked ? 'checked' : '';
      html += `
        <li class="item-row ${checkedClass}" 
            data-col="${colId}" data-cat="${catName}" data-item-id="${item.id}"
            tabindex="0" role="checkbox" aria-checked="${item.checked}">
          <div class="item-checkbox-wrap">
            <span class="checkmark">✓</span>
          </div>
          <span class="item-label">${escapeHtml(item.name)}</span>
          <div class="item-actions">
            <button class="item-edit-btn" 
                    data-edit-col="${colId}" 
                    data-edit-cat="${catName}" 
                    data-edit-item="${item.id}"
                    title="Editar">✎</button>
            <button class="item-delete-btn" 
                    data-delete-col="${colId}" 
                    data-delete-cat="${catName}" 
                    data-delete-item="${item.id}"
                    title="Borrar">🗑</button>
          </div>
        </li>
      `;
    }

    html += `
        </ul>
        <button class="add-item-btn" 
                data-add-col="${colId}" 
                data-add-cat="${catName}">
          <span class="plus-icon">+</span>
          Añadir elemento
        </button>
      </div>
    `;
  }

  html += `</div>`;
  collectionViewEl.innerHTML = html;
  attachCollectionListeners();
}

// ── Escape HTML ──────────────────────────────────────
function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Attach Event Listeners ───────────────────────────
function attachCollectionListeners() {
  // Toggle category collapse
  collectionViewEl.querySelectorAll('[data-toggle-cat]').forEach(header => {
    header.addEventListener('click', () => {
      const card    = header.closest('.category-card');
      const colId   = card.dataset.col;
      const catName = card.dataset.cat;
      state.data[colId][catName].collapsed = !state.data[colId][catName].collapsed;
      card.classList.toggle('collapsed');
      saveState(state);
    });
  });

  // Toggle item checked
  collectionViewEl.querySelectorAll('.item-row').forEach(row => {
    const toggle = (e) => {
      // Don't toggle when clicking action buttons
      if (e.target.closest('.item-edit-btn') || e.target.closest('.item-delete-btn')) return;
      const colId  = row.dataset.col;
      const catName = row.dataset.cat;
      const itemId = row.dataset.itemId;
      const cat    = state.data[colId][catName];
      const item   = cat.items.find(i => i.id === itemId);
      if (!item) return;
      item.checked = !item.checked;
      row.classList.toggle('checked', item.checked);
      row.setAttribute('aria-checked', item.checked);
      saveState(state);
      updateGlobalProgress();

      // Update category ring inline (without full re-render)
      const card = row.closest('.category-card');
      const colId2 = card.dataset.col;
      const catName2 = card.dataset.cat;
      const catStats = getCategoryStats(colId2, catName2);
      const ringEl = card.querySelector('.category-progress-ring');
      if (ringEl) ringEl.innerHTML = buildRingSVG(catStats.checked, catStats.total);
      const countEl = card.querySelector('.category-count');
      if (countEl) countEl.textContent = `${catStats.checked} / ${catStats.total}`;
    };
    row.addEventListener('click', toggle);
    row.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(e); } });
  });

  // Edit item buttons
  collectionViewEl.querySelectorAll('.item-edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const colId  = btn.dataset.editCol;
      const catName = btn.dataset.editCat;
      const itemId = btn.dataset.editItem;
      const item   = state.data[colId][catName].items.find(i => i.id === itemId);
      if (!item) return;
      editTarget = { colId, catName, itemId };
      modalInput.value = item.name;
      openModal(modalOverlay);
      modalInput.focus();
      modalInput.select();
    });
  });

  // Delete item buttons
  collectionViewEl.querySelectorAll('.item-delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const colId  = btn.dataset.deleteCol;
      const catName = btn.dataset.deleteCat;
      const itemId = btn.dataset.deleteItem;
      const items  = state.data[colId][catName].items;
      const idx    = items.findIndex(i => i.id === itemId);
      if (idx !== -1) {
        lastDeletedItem = {
          colId,
          catName,
          item: items[idx],
          index: idx
        };
        items.splice(idx, 1);
        saveState(state);
        renderCollection();
        updateGlobalProgress();
        showUndoToast('Elemento eliminado');
      }
    });
  });

  // Add item buttons
  collectionViewEl.querySelectorAll('.add-item-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      addTarget = { colId: btn.dataset.addCol, catName: btn.dataset.addCat };
      addModalInput.value = '';
      openModal(addModalOverlay);
      addModalInput.focus();
    });
  });

  // Reset collection button
  collectionViewEl.querySelector('.btn-reset-collection')?.addEventListener('click', (e) => {
    const colId = e.currentTarget.dataset.colId;
    if (!confirm(`¿Resetear todos los checks de "${colId}"? (No borra ítems editados)`)) return;
    for (const cat of Object.values(state.data[colId])) {
      for (const item of cat.items) item.checked = false;
    }
    saveState(state);
    renderCollection();
    updateGlobalProgress();
    showToast('✓ Colección reseteada');
  });

  // Expand / Collapse all
  collectionViewEl.querySelector('#btn-expand-all')?.addEventListener('click', () => {
    const cats = Object.keys(state.data[state.activeCollection]);
    for (const cat of cats) state.data[state.activeCollection][cat].collapsed = false;
    saveState(state);
    renderCollection();
  });

  collectionViewEl.querySelector('#btn-collapse-all')?.addEventListener('click', () => {
    const cats = Object.keys(state.data[state.activeCollection]);
    for (const cat of cats) state.data[state.activeCollection][cat].collapsed = true;
    saveState(state);
    renderCollection();
  });
}

// ── Undo Handling ────────────────────────────────────
function initUndoToast() {
  if (document.getElementById('undo-toast')) {
    undoToastEl = document.getElementById('undo-toast');
    return;
  }
  const toast = document.createElement('div');
  toast.id = 'undo-toast';
  toast.className = 'undo-toast';
  toast.innerHTML = `
    <span id="undo-message">Elemento eliminado</span>
    <button class="undo-btn" id="undo-action-btn">Deshacer</button>
  `;
  document.body.appendChild(toast);
  undoToastEl = toast;

  document.getElementById('undo-action-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    performUndo();
  });

  // Swipe down gesture detection
  let startY = 0;
  let currentY = 0;
  let isDragging = false;

  const onStart = (e) => {
    startY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
    isDragging = true;
    undoToastEl.style.transition = 'none';
  };

  const onMove = (e) => {
    if (!isDragging) return;
    const y = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
    const diffY = y - startY;
    if (diffY > 0) {
      currentY = diffY;
      undoToastEl.style.transform = `translateX(-50%) translateY(${currentY}px)`;
    }
  };

  const onEnd = () => {
    if (!isDragging) return;
    isDragging = false;
    undoToastEl.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease';
    if (currentY > 40) {
      dismissUndoToast(true);
    } else {
      undoToastEl.style.transform = 'translateX(-50%) translateY(0)';
    }
    currentY = 0;
  };

  undoToastEl.addEventListener('touchstart', onStart);
  undoToastEl.addEventListener('touchmove', onMove);
  undoToastEl.addEventListener('touchend', onEnd);

  undoToastEl.addEventListener('mousedown', onStart);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onEnd);
}

function showUndoToast(msg) {
  initUndoToast();
  const msgEl = document.getElementById('undo-message');
  if (msgEl) msgEl.textContent = msg;
  undoToastEl.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease';
  undoToastEl.style.transform = 'translateX(-50%) translateY(0)';
  undoToastEl.classList.add('show');

  if (undoTimeout) clearTimeout(undoTimeout);
  undoTimeout = setTimeout(() => {
    dismissUndoToast(false);
  }, 2500);
}

function dismissUndoToast(immediate) {
  if (!undoToastEl) return;
  if (immediate) {
    undoToastEl.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
  }
  undoToastEl.classList.remove('show');
  undoToastEl.style.transform = 'translateX(-50%) translateY(120px)';
  if (undoTimeout) {
    clearTimeout(undoTimeout);
    undoTimeout = null;
  }
}

function performUndo() {
  if (!lastDeletedItem) return;
  const { colId, catName, item, index } = lastDeletedItem;
  state.data[colId][catName].items.splice(index, 0, item);
  saveState(state);
  renderCollection();
  updateGlobalProgress();
  lastDeletedItem = null;
  dismissUndoToast(true);
  showToast('✓ Elemento restaurado');
}

// ── Modal Helpers ────────────────────────────────────
function openModal(overlay) {
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
}

function closeModal(overlay) {
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
}

// ── Edit Modal Logic ─────────────────────────────────
modalSave.addEventListener('click', () => {
  if (!editTarget) return;
  const val = modalInput.value.trim();
  if (!val) return;
  const { colId, catName, itemId } = editTarget;
  const item = state.data[colId][catName].items.find(i => i.id === itemId);
  if (item) {
    item.name = val;
    saveState(state);
    renderCollection();
    updateGlobalProgress();
    showToast('✓ Elemento actualizado');
  }
  closeModal(modalOverlay);
  editTarget = null;
});

modalDelete.addEventListener('click', () => {
  if (!editTarget) return;
  const { colId, catName, itemId } = editTarget;
  const cat = state.data[colId][catName];
  cat.items = cat.items.filter(i => i.id !== itemId);
  saveState(state);
  renderCollection();
  updateGlobalProgress();
  showToast('🗑 Elemento eliminado');
  closeModal(modalOverlay);
  editTarget = null;
});

modalClose.addEventListener('click', () => {
  closeModal(modalOverlay);
  editTarget = null;
});

modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) { closeModal(modalOverlay); editTarget = null; }
});

modalInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') modalSave.click();
  if (e.key === 'Escape') { closeModal(modalOverlay); editTarget = null; }
});

// ── Add Modal Logic ──────────────────────────────────
addModalSave.addEventListener('click', () => {
  if (!addTarget) return;
  const val = addModalInput.value.trim();
  if (!val) { addModalInput.focus(); return; }
  const { colId, catName } = addTarget;
  const newItem = { id: genId(), name: val, checked: false };
  state.data[colId][catName].items.push(newItem);
  saveState(state);
  renderCollection();
  updateGlobalProgress();
  showToast(`➕ "${val}" añadido`);
  closeModal(addModalOverlay);
  addTarget = null;
});

addModalCancel.addEventListener('click', () => { closeModal(addModalOverlay); addTarget = null; });
addModalClose.addEventListener('click',  () => { closeModal(addModalOverlay); addTarget = null; });

addModalOverlay.addEventListener('click', (e) => {
  if (e.target === addModalOverlay) { closeModal(addModalOverlay); addTarget = null; }
});

addModalInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter')  addModalSave.click();
  if (e.key === 'Escape') { closeModal(addModalOverlay); addTarget = null; }
});

// ── Init ─────────────────────────────────────────────
function init() {
  renderTabs();
  renderCollection();
  updateGlobalProgress();
}

init();
