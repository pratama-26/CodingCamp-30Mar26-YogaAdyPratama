(function () {
  'use strict';

  const STORAGE_KEY = 'expense-visualizer-transactions';
  const CATEGORIES_KEY = 'expense-visualizer-categories';
  const THEME_KEY = 'expense-visualizer-theme';

  // ── Storage helpers ──────────────────────────────────────────────────────────

  function isStorageAvailable() {
    try {
      const t = '__storage_test__';
      localStorage.setItem(t, t);
      localStorage.removeItem(t);
      return true;
    } catch (e) {
      return false;
    }
  }

  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('expense-visualizer: failed to parse stored transactions, resetting.', e);
      return [];
    }
  }

  function saveToStorage(data) {
    if (!isStorageAvailable()) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function loadCategories() {
    try {
      const raw = localStorage.getItem(CATEGORIES_KEY);
      return raw ? JSON.parse(raw) : ['Food', 'Transport', 'Fun'];
    } catch (e) {
      return ['Food', 'Transport', 'Fun'];
    }
  }

  function saveCategories() {
    if (!isStorageAvailable()) return;
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  }

  // ── State ────────────────────────────────────────────────────────────────────

  let transactions = [];
  let categories = [];
  let sortOrder = 'none';
  let chartInstance = null;

  // ── Category helpers ─────────────────────────────────────────────────────────

  function rebuildCategorySelect() {
    const sel = document.getElementById('input-category');
    if (!sel) return;
    const current = sel.value;
    sel.innerHTML = '<option value="">Select category</option>';
    categories.forEach(function (c) {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      sel.appendChild(opt);
    });
    if (categories.includes(current)) sel.value = current;
  }

  function addCategory(name) {
    const trimmed = name.trim();
    if (!trimmed || categories.includes(trimmed)) return;
    categories.push(trimmed);
    saveCategories();
    rebuildCategorySelect();
  }

  // ── Validation ───────────────────────────────────────────────────────────────

  function validateForm(name, amount, category) {
    if (!name || name.trim() === '') return 'Name is required.';
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) return 'Amount must be a positive number.';
    if (!categories.includes(category)) return 'Please select a valid category.';
    return null;
  }

  // ── Mutations ────────────────────────────────────────────────────────────────

  function addTransaction(name, amount, category) {
    const error = validateForm(name, amount, category);
    const formError = document.getElementById('form-error');
    if (error) {
      if (formError) { formError.textContent = error; formError.classList.add('visible'); }
      return;
    }
    const id = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : Date.now().toString() + Math.random();
    transactions.push({ id, name: name.trim(), amount: parseFloat(amount), category });
    saveToStorage(transactions);
    const nameEl = document.getElementById('input-name');
    const amountEl = document.getElementById('input-amount');
    const categoryEl = document.getElementById('input-category');
    if (nameEl) nameEl.value = '';
    if (amountEl) amountEl.value = '';
    if (categoryEl) categoryEl.value = '';
    if (formError) { formError.textContent = ''; formError.classList.remove('visible'); }
    render();
  }

  function deleteTransaction(id) {
    transactions = transactions.filter(function (t) { return t.id !== id; });
    saveToStorage(transactions);
    render();
  }

  // ── Sorting ──────────────────────────────────────────────────────────────────

  function getSorted() {
    const copy = transactions.slice();
    if (sortOrder === 'amount-asc')  return copy.sort(function (a, b) { return a.amount - b.amount; });
    if (sortOrder === 'amount-desc') return copy.sort(function (a, b) { return b.amount - a.amount; });
    if (sortOrder === 'category-asc')  return copy.sort(function (a, b) { return a.category.localeCompare(b.category); });
    if (sortOrder === 'category-desc') return copy.sort(function (a, b) { return b.category.localeCompare(a.category); });
    return copy;
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  function renderTotal() {
    const total = transactions.reduce(function (s, t) { return s + t.amount; }, 0);
    const el = document.getElementById('total-balance');
    if (el) el.textContent = total.toFixed(2);
  }

  function renderList() {
    const list = document.getElementById('transaction-list');
    const emptyState = document.getElementById('empty-state');
    if (!list) return;
    list.innerHTML = '';
    if (emptyState) emptyState.style.display = transactions.length === 0 ? '' : 'none';
    getSorted().forEach(function (t) {
      const li = document.createElement('li');
      li.className = 'transaction-item';
      li.innerHTML =
        '<span class="tx-name">' + escapeHtml(t.name) + '</span>' +
        '<span class="tx-amount">$' + t.amount.toFixed(2) + '</span>' +
        '<span class="tx-category">' + escapeHtml(t.category) + '</span>';
      const btn = document.createElement('button');
      btn.textContent = 'Delete';
      btn.className = 'tx-delete';
      btn.addEventListener('click', function () { deleteTransaction(t.id); });
      li.appendChild(btn);
      list.appendChild(li);
    });
  }

  function renderChart() {
    if (typeof window.Chart === 'undefined') {
      const section = document.getElementById('chart-section');
      if (section) section.style.display = 'none';
      return;
    }
    // Build totals for every known category
    const totals = {};
    categories.forEach(function (c) { totals[c] = 0; });
    transactions.forEach(function (t) {
      if (totals[t.category] !== undefined) totals[t.category] += t.amount;
    });
    const labels = Object.keys(totals);
    const data = Object.values(totals);
    if (chartInstance) {
      chartInstance.data.labels = labels;
      chartInstance.data.datasets[0].data = data;
      chartInstance.update();
    } else {
      const canvas = document.getElementById('chart-canvas');
      if (!canvas) return;
      chartInstance = new window.Chart(canvas, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{ data: data, backgroundColor: generateColors(labels.length) }]
        }
      });
    }
  }

  function render() {
    renderList();
    renderTotal();
    renderChart();
  }

  // ── Theme ────────────────────────────────────────────────────────────────────

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    if (isStorageAvailable()) localStorage.setItem(THEME_KEY, next);
  }

  // ── Utilities ────────────────────────────────────────────────────────────────

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function generateColors(n) {
    const palette = ['#4caf50','#2196f3','#ff9800','#e91e63','#9c27b0','#00bcd4','#ff5722','#607d8b'];
    const out = [];
    for (let i = 0; i < n; i++) out.push(palette[i % palette.length]);
    return out;
  }

  // ── Init ─────────────────────────────────────────────────────────────────────

  function init() {
    // Theme
    const savedTheme = isStorageAvailable() ? localStorage.getItem(THEME_KEY) : null;
    applyTheme(savedTheme || 'light');
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

    // Storage warning
    if (!isStorageAvailable()) {
      const warning = document.getElementById('storage-warning');
      if (warning) warning.removeAttribute('hidden');
    }

    // Load data
    categories = loadCategories();
    transactions = loadFromStorage();

    // Rebuild category select with persisted categories
    rebuildCategorySelect();

    // Add-category button
    const addCatBtn = document.getElementById('btn-add-category');
    if (addCatBtn) {
      addCatBtn.addEventListener('click', function () {
        const input = document.getElementById('input-new-category');
        if (!input) return;
        addCategory(input.value);
        input.value = '';
      });
    }

    // Sort control
    const sortSel = document.getElementById('sort-select');
    if (sortSel) {
      sortSel.addEventListener('change', function () {
        sortOrder = sortSel.value;
        renderList();
      });
    }

    // Transaction form
    const form = document.getElementById('expense-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        const name     = (document.getElementById('input-name')     || {}).value || '';
        const amount   = (document.getElementById('input-amount')   || {}).value || '';
        const category = (document.getElementById('input-category') || {}).value || '';
        addTransaction(name.trim(), amount.trim(), category);
      });
    }

    render();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
