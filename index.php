<?php
session_start();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Expense Tracker</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>

<?php if (!isset($_SESSION['user_id'])): ?>

<!-- ─── LOGIN ─── -->
<div class="login-wrap">
  <div class="login-box">
    <div class="login-logo">💰</div>
    <h1 class="login-title">Expense Tracker</h1>
    <p class="login-sub">Track your finances, master your money</p>

    <div class="input-group">
      <span class="icon">👤</span>
      <input type="text" id="username" placeholder="Username" autocomplete="username">
    </div>
    <div class="input-group">
      <span class="icon">🔒</span>
      <input type="password" id="password" placeholder="Password" autocomplete="current-password" onkeydown="if(event.key==='Enter') login()">
    </div>

    <button class="btn-primary" onclick="login()">Sign In</button>

    <div class="divider">or</div>

    <button class="btn-secondary" onclick="register()">Create Account</button>
  </div>
</div>

<?php else: ?>

<!-- ─── SIDEBAR OVERLAY ─── -->
<div class="sidebar-overlay" id="sidebarOverlay" onclick="closeSidebar()"></div>

<!-- ─── SIDEBAR ─── -->
<div class="sidebar" id="sidebar">
  <div class="sidebar-brand">
    <span class="logo">💰</span>
    <span class="brand-text">FinTracker</span>
  </div>

  <div class="nav-label">Menu</div>
  <button class="nav-link active" onclick="showView('dashboard')" id="nav-dashboard">
    <span class="nav-icon">📊</span> Dashboard
  </button>
  <button class="nav-link" onclick="showView('transactions')" id="nav-transactions">
    <span class="nav-icon">🔄</span> Transactions
  </button>
  <button class="nav-link" onclick="showView('monthly')" id="nav-monthly">
    <span class="nav-icon">📅</span> Monthly Report
  </button>

  <div class="sidebar-footer">
    <div style="padding: 6px 12px; font-size:0.78rem; color:var(--text-muted); margin-bottom:8px;">
      Signed in as <strong style="color:var(--text-secondary)"><?= htmlspecialchars($_SESSION['username']) ?></strong>
    </div>
    <button class="logout-btn" onclick="logout()">
      <span>🚪</span> Sign Out
    </button>
  </div>
</div>

<!-- ─── MAIN ─── -->
<div class="main">

  <!-- TOPBAR -->
  <div class="topbar">
    <div class="topbar-left">
      <button class="menu-btn" onclick="toggleSidebar()">☰</button>
      <div>
        <div class="topbar-title" id="viewTitle">Dashboard</div>
        <div class="topbar-sub" id="viewSub">Your financial overview</div>
      </div>
    </div>
    <div class="user-badge">
      <div class="user-avatar"><?= strtoupper(substr($_SESSION['username'], 0, 1)) ?></div>
      <span class="user-name"><?= htmlspecialchars($_SESSION['username']) ?></span>
    </div>
  </div>

  <!-- ─── DASHBOARD VIEW ─── -->
  <div id="view-dashboard">

    <!-- SUMMARY CARDS -->
    <div class="cards">
      <div class="stat-card balance">
        <span class="stat-icon">⚖️</span>
        <div class="stat-label">Net Balance</div>
        <div class="stat-value">₹<span id="balance">0</span></div>
        <div class="stat-change">Income minus expenses</div>
      </div>
      <div class="stat-card income">
        <span class="stat-icon">📈</span>
        <div class="stat-label">Total Income</div>
        <div class="stat-value">₹<span id="income">0</span></div>
        <div class="stat-change">All time earnings</div>
      </div>
      <div class="stat-card expense">
        <span class="stat-icon">📉</span>
        <div class="stat-label">Total Expenses</div>
        <div class="stat-value">₹<span id="expense">0</span></div>
        <div class="stat-change">All time spending</div>
      </div>
    </div>

    <!-- ADD + RECENT TABLE -->
    <div class="content-grid">

      <!-- ADD TRANSACTION -->
      <div class="card">
        <div class="card-header">
          <div class="card-title"><span class="dot"></span> Add Transaction</div>
        </div>

        <div class="form-group">
          <label class="form-label">Description</label>
          <input type="text" id="desc" class="form-control" placeholder="e.g. Salary, Rent, Food...">
        </div>

        <div class="form-group">
          <label class="form-label">Amount (₹)</label>
          <input type="number" id="amount" class="form-control" placeholder="0.00" min="0" step="0.01">
        </div>

        <div class="form-group">
          <label class="form-label">Category</label>
          <select id="category" class="form-control">
            <option value="General">General</option>
            <option value="Food">🍔 Food & Dining</option>
            <option value="Transport">🚗 Transport</option>
            <option value="Bills">💡 Bills & Utilities</option>
            <option value="Shopping">🛍️ Shopping</option>
            <option value="Entertainment">🎬 Entertainment</option>
            <option value="Health">🏥 Health</option>
            <option value="Salary">💼 Salary</option>
            <option value="Investment">📈 Investment</option>
            <option value="Other">📦 Other</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Type</label>
          <div class="type-toggle">
            <button class="type-btn active-income" id="btnIncome" onclick="setType('income')">📈 Income</button>
            <button class="type-btn" id="btnExpense" onclick="setType('expense')">📉 Expense</button>
          </div>
          <input type="hidden" id="type" value="income">
        </div>

        <button class="add-btn" onclick="addTransaction()">
          <span>+</span> Add Transaction
        </button>
      </div>

      <!-- RECENT TRANSACTIONS -->
      <div class="card">
        <div class="card-header">
          <div class="card-title"><span class="dot"></span> Recent Transactions</div>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="list">
              <tr><td colspan="5"><div class="empty-state"><div class="empty-icon">📭</div>No transactions yet</div></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- CHARTS -->
    <div class="charts-row">
      <div class="card">
        <div class="card-header">
          <div class="card-title"><span class="dot"></span> Spending Breakdown</div>
          <div class="chart-tabs">
            <button class="chart-tab active" onclick="switchChart('doughnut', this)">Donut</button>
            <button class="chart-tab" onclick="switchChart('bar', this)">Bar</button>
          </div>
        </div>
        <canvas id="chart" height="240"></canvas>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title"><span class="dot"></span> Monthly Overview</div>
        </div>
        <canvas id="barChart" height="240"></canvas>
      </div>
    </div>

  </div>

  <!-- ─── TRANSACTIONS VIEW ─── -->
  <div id="view-transactions" style="display:none">
    <div class="card">
      <div class="card-header">
        <div class="card-title"><span class="dot"></span> All Transactions</div>
        <div style="display:flex;gap:8px;">
          <select id="filterType" class="form-control" style="width:130px;padding:7px 12px;font-size:0.82rem;" onchange="renderTable()">
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Description</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody id="allList">
            <tr><td colspan="6"><div class="empty-state"><div class="empty-icon">📭</div>No transactions found</div></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- ─── MONTHLY VIEW ─── -->
  <div id="view-monthly" style="display:none">
    <div class="card monthly-card">
      <div class="card-header">
        <div class="card-title"><span class="dot"></span> Monthly Report</div>
      </div>
      <canvas id="monthlyBarChart" height="220"></canvas>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title"><span class="dot"></span> Month-by-Month Breakdown</div>
      </div>
      <div id="monthlyList"></div>
    </div>
  </div>

</div><!-- end .main -->

<?php endif; ?>

<!-- TOAST CONTAINER -->
<div class="toast-wrap" id="toastWrap"></div>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="script.js"></script>
</body>
</html>