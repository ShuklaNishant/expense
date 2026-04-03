/* ─── STATE ─── */
let allTransactions = [];
let chart = null;
let barChart = null;
let monthlyBarChart = null;
let currentType = 'income';
let currentChartType = 'doughnut';
let currentView = 'dashboard';

/* ─── TOAST ─── */
function showToast(msg, type = 'success') {
  const wrap = document.getElementById('toastWrap');
  if (!wrap) return;
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${type === 'success' ? '✅' : '❌'}</span> ${msg}`;
  wrap.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(20px)'; el.style.transition = 'all 0.3s'; setTimeout(() => el.remove(), 300); }, 2800);
}

/* ─── TYPE TOGGLE ─── */
function setType(t) {
  currentType = t;
  document.getElementById('type').value = t;
  const btnI = document.getElementById('btnIncome');
  const btnE = document.getElementById('btnExpense');
  btnI.className = 'type-btn' + (t === 'income' ? ' active-income' : '');
  btnE.className = 'type-btn' + (t === 'expense' ? ' active-expense' : '');
}

/* ─── SIDEBAR ─── */
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('open');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('open');
}

/* ─── VIEWS ─── */
function showView(view) {
  currentView = view;
  ['dashboard', 'transactions', 'monthly'].forEach(v => {
    const el = document.getElementById('view-' + v);
    if (el) el.style.display = v === view ? 'block' : 'none';
    const nav = document.getElementById('nav-' + v);
    if (nav) nav.classList.toggle('active', v === view);
  });

  const titles = {
    dashboard: ['Dashboard', 'Your financial overview'],
    transactions: ['Transactions', 'All recorded entries'],
    monthly: ['Monthly Report', 'Month-by-month analysis']
  };

  document.getElementById('viewTitle').textContent = titles[view][0];
  document.getElementById('viewSub').textContent = titles[view][1];

  if (view === 'transactions') renderAllTable();
  if (view === 'monthly') renderMonthly();

  closeSidebar();
}

/* ─── LOGIN ─── */
function login() {
  const u = document.getElementById('username').value.trim();
  const p = document.getElementById('password').value;
  if (!u || !p) { showToast('Please fill in all fields', 'error'); return; }

  fetch('login.php', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `username=${encodeURIComponent(u)}&password=${encodeURIComponent(p)}`
  }).then(r => r.text()).then(data => {
    if (data.trim() === 'success') { location.reload(); }
    else { showToast(data, 'error'); }
  });
}

/* ─── REGISTER ─── */
function register() {
  const u = document.getElementById('username').value.trim();
  const p = document.getElementById('password').value;
  if (!u || !p) { showToast('Please fill in all fields', 'error'); return; }

  fetch('register.php', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `username=${encodeURIComponent(u)}&password=${encodeURIComponent(p)}`
  }).then(r => r.text()).then(data => {
    if (data.trim() === 'success') {
      showToast('Account created! Please login.');
      document.getElementById('password').value = '';
    } else { showToast(data, 'error'); }
  });
}

/* ─── LOGOUT ─── */
function logout() {
  fetch('logout.php', { credentials: 'same-origin' }).then(() => location.reload());
}

/* ─── ADD TRANSACTION ─── */
function addTransaction() {
  const desc = document.getElementById('desc').value.trim();
  const amount = document.getElementById('amount').value;
  const type = document.getElementById('type').value;
  const category = document.getElementById('category').value;

  if (!desc) { showToast('Please enter a description', 'error'); return; }
  if (!amount || parseFloat(amount) <= 0) { showToast('Please enter a valid amount', 'error'); return; }

  fetch('add_transaction.php', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `desc=${encodeURIComponent(desc)}&amount=${encodeURIComponent(amount)}&type=${encodeURIComponent(type)}&category=${encodeURIComponent(category)}`
  }).then(r => r.text()).then(data => {
    if (data.trim() === 'success') {
      showToast(`${type === 'income' ? 'Income' : 'Expense'} added successfully!`);
      document.getElementById('desc').value = '';
      document.getElementById('amount').value = '';
      loadTransactions();
    } else { showToast(data, 'error'); }
  });
}

/* ─── DELETE ─── */
function deleteTransaction(id) {
  if (!confirm('Delete this transaction?')) return;
  fetch('delete_transaction.php?id=' + id, { credentials: 'same-origin' })
    .then(r => r.text()).then(data => {
      if (data.trim() === 'success') {
        showToast('Transaction deleted');
        loadTransactions();
      } else { showToast(data, 'error'); }
    });
}

/* ─── LOAD ─── */
function loadTransactions() {
  fetch('fetch_transactions.php', { credentials: 'same-origin' })
    .then(r => r.json())
    .then(data => {
      allTransactions = data;
      renderTable();
      updateSummary();
      drawCharts();
      if (currentView === 'transactions') renderAllTable();
      if (currentView === 'monthly') renderMonthly();
    })
    .catch(err => console.error('Fetch error:', err));
}

/* ─── SUMMARY ─── */
function updateSummary() {
  let income = 0, expense = 0;
  allTransactions.forEach(t => {
    if (t.type === 'income') income += parseFloat(t.amount);
    else expense += parseFloat(t.amount);
  });

  const fmt = n => n.toLocaleString('en-IN', { maximumFractionDigits: 2 });

  const balEl = document.getElementById('balance');
  const incEl = document.getElementById('income');
  const expEl = document.getElementById('expense');

  if (balEl) balEl.textContent = fmt(income - expense);
  if (incEl) incEl.textContent = fmt(income);
  if (expEl) expEl.textContent = fmt(expense);
}

/* ─── RENDER RECENT TABLE (dashboard) ─── */
function renderTable() {
  const list = document.getElementById('list');
  if (!list) return;

  const recent = allTransactions.slice(0, 8);

  if (recent.length === 0) {
    list.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">📭</div>No transactions yet. Add one!</div></td></tr>`;
    return;
  }

  list.innerHTML = recent.map(t => `
    <tr>
      <td>${escHtml(t.description)}</td>
      <td><span style="font-size:0.8rem;color:var(--text-muted)">${escHtml(t.category || 'General')}</span></td>
      <td class="amount-cell ${t.type}">₹${parseFloat(t.amount).toLocaleString('en-IN', {maximumFractionDigits:2})}</td>
      <td><span class="type-badge ${t.type}">${t.type === 'income' ? '📈' : '📉'} ${t.type}</span></td>
      <td><button class="del-btn" onclick="deleteTransaction(${t.id})">Delete</button></td>
    </tr>
  `).join('');
}

/* ─── RENDER ALL TABLE (transactions view) ─── */
function renderAllTable() {
  const list = document.getElementById('allList');
  if (!list) return;

  const filter = document.getElementById('filterType')?.value || 'all';
  const filtered = filter === 'all' ? allTransactions : allTransactions.filter(t => t.type === filter);

  if (filtered.length === 0) {
    list.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">📭</div>No transactions found</div></td></tr>`;
    return;
  }

  list.innerHTML = filtered.map((t, i) => `
    <tr>
      <td style="color:var(--text-muted);font-size:0.8rem">${i + 1}</td>
      <td>${escHtml(t.description)}</td>
      <td><span style="font-size:0.8rem;color:var(--text-muted)">${escHtml(t.category || 'General')}</span></td>
      <td class="amount-cell ${t.type}">₹${parseFloat(t.amount).toLocaleString('en-IN', {maximumFractionDigits:2})}</td>
      <td><span class="type-badge ${t.type}">${t.type === 'income' ? '📈' : '📉'} ${t.type}</span></td>
      <td><button class="del-btn" onclick="deleteTransaction(${t.id})">Delete</button></td>
    </tr>
  `).join('');
}

/* ─── MONTHLY DATA ─── */
function getMonthlyData() {
  const months = {};
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  allTransactions.forEach(t => {
    // Use id as proxy for date ordering if no date field
    const d = t.created_at ? new Date(t.created_at) : new Date();
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    if (!months[key]) months[key] = { label, income: 0, expense: 0 };
    if (t.type === 'income') months[key].income += parseFloat(t.amount);
    else months[key].expense += parseFloat(t.amount);
  });

  return Object.entries(months).sort((a, b) => a[0].localeCompare(b[0])).map(([, v]) => v);
}

/* ─── RENDER MONTHLY ─── */
function renderMonthly() {
  const data = getMonthlyData();
  const list = document.getElementById('monthlyList');

  if (!list) return;

  if (data.length === 0) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">📅</div>No data available</div>`;
    drawMonthlyBar([]);
    return;
  }

  const maxExp = Math.max(...data.map(m => m.expense), 1);

  list.innerHTML = data.map(m => `
    <div class="month-row">
      <div class="month-name">${m.label}</div>
      <div class="month-bar-wrap">
        <div class="month-bar-fill" style="width:${Math.round((m.expense / maxExp) * 100)}%"></div>
      </div>
      <div class="month-amounts">
        <span class="month-inc">+₹${m.income.toLocaleString('en-IN', {maximumFractionDigits:0})}</span>
        <span class="month-exp">-₹${m.expense.toLocaleString('en-IN', {maximumFractionDigits:0})}</span>
      </div>
    </div>
  `).join('');

  drawMonthlyBar(data);
}

/* ─── CHARTS ─── */
const chartColors = {
  primary: '#00d4ff',
  green: '#00e5a0',
  red: '#ff4f6a',
  gold: '#ffd060',
  purple: '#a78bfa',
  orange: '#fb923c',
};

function drawCharts() {
  drawMainChart();
  drawMonthlyOverviewBar();
}

function switchChart(type, btn) {
  currentChartType = type;
  document.querySelectorAll('.chart-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  drawMainChart();
}

function drawMainChart() {
  const ctx = document.getElementById('chart');
  if (!ctx) return;

  let income = 0, expense = 0;
  allTransactions.forEach(t => {
    if (t.type === 'income') income += parseFloat(t.amount);
    else expense += parseFloat(t.amount);
  });

  if (chart) chart.destroy();

  const base = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#8ba3c7', font: { family: 'Space Grotesk', size: 12 } } },
      tooltip: {
        backgroundColor: '#111d33',
        borderColor: 'rgba(0,212,255,0.2)',
        borderWidth: 1,
        titleColor: '#e8f0fe',
        bodyColor: '#8ba3c7',
        callbacks: { label: ctx => ` ₹${ctx.raw.toLocaleString('en-IN')}` }
      }
    }
  };

  if (currentChartType === 'doughnut') {
    chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Income', 'Expense'],
        datasets: [{ data: [income, expense], backgroundColor: [chartColors.green, chartColors.red], borderWidth: 0, hoverOffset: 8 }]
      },
      options: { ...base, cutout: '65%' }
    });
  } else {
    chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Income', 'Expense'],
        datasets: [{
          data: [income, expense],
          backgroundColor: [rgba(chartColors.green, 0.7), rgba(chartColors.red, 0.7)],
          borderColor: [chartColors.green, chartColors.red],
          borderWidth: 2,
          borderRadius: 8,
        }]
      },
      options: {
        ...base,
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#8ba3c7', font: { family: 'Space Grotesk' } } },
          y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#8ba3c7', font: { family: 'Space Grotesk' }, callback: v => '₹' + v.toLocaleString('en-IN') } }
        }
      }
    });
  }
}

function rgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function drawMonthlyOverviewBar() {
  const ctx = document.getElementById('barChart');
  if (!ctx) return;

  const data = getMonthlyData();
  if (barChart) barChart.destroy();

  const labels = data.map(m => m.label);
  const incomes = data.map(m => m.income);
  const expenses = data.map(m => m.expense);

  barChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels.length ? labels : ['No Data'],
      datasets: [
        {
          label: 'Income',
          data: incomes.length ? incomes : [0],
          backgroundColor: rgba(chartColors.green, 0.7),
          borderColor: chartColors.green,
          borderWidth: 2,
          borderRadius: 6,
        },
        {
          label: 'Expense',
          data: expenses.length ? expenses : [0],
          backgroundColor: rgba(chartColors.red, 0.7),
          borderColor: chartColors.red,
          borderWidth: 2,
          borderRadius: 6,
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: '#8ba3c7', font: { family: 'Space Grotesk', size: 12 } } },
        tooltip: {
          backgroundColor: '#111d33',
          borderColor: 'rgba(0,212,255,0.2)',
          borderWidth: 1,
          titleColor: '#e8f0fe',
          bodyColor: '#8ba3c7',
          callbacks: { label: ctx => ` ${ctx.dataset.label}: ₹${ctx.raw.toLocaleString('en-IN')}` }
        }
      },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#8ba3c7', font: { family: 'Space Grotesk', size: 11 } } },
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#8ba3c7', font: { family: 'Space Grotesk', size: 11 }, callback: v => '₹' + v.toLocaleString('en-IN') } }
      }
    }
  });
}

function drawMonthlyBar(data) {
  const ctx = document.getElementById('monthlyBarChart');
  if (!ctx) return;

  if (monthlyBarChart) monthlyBarChart.destroy();

  const labels = data.map(m => m.label);
  const net = data.map(m => m.income - m.expense);

  monthlyBarChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels.length ? labels : ['No Data'],
      datasets: [{
        label: 'Net Savings',
        data: net.length ? net : [0],
        backgroundColor: net.map(v => v >= 0 ? rgba(chartColors.green, 0.7) : rgba(chartColors.red, 0.7)),
        borderColor: net.map(v => v >= 0 ? chartColors.green : chartColors.red),
        borderWidth: 2,
        borderRadius: 8,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: '#8ba3c7', font: { family: 'Space Grotesk', size: 12 } } },
        tooltip: {
          backgroundColor: '#111d33',
          borderColor: 'rgba(0,212,255,0.2)',
          borderWidth: 1,
          titleColor: '#e8f0fe',
          bodyColor: '#8ba3c7',
          callbacks: { label: ctx => ` Net: ₹${ctx.raw.toLocaleString('en-IN')}` }
        }
      },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#8ba3c7', font: { family: 'Space Grotesk', size: 11 } } },
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#8ba3c7', font: { family: 'Space Grotesk', size: 11 }, callback: v => '₹' + v.toLocaleString('en-IN') } }
      }
    }
  });
}

/* ─── UTILS ─── */
function escHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ─── INIT ─── */
window.onload = function () {
  if (document.getElementById('list')) {
    loadTransactions();
  }
};