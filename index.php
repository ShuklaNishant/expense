<?php
session_start();
?>

<!DOCTYPE html>
<html>
<head>
  <title>Expense Tracker</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>

<?php if (!isset($_SESSION['user_id'])): ?>

<!-- 🔐 LOGIN -->
<div style="display:flex; justify-content:center; align-items:center; height:100vh;">
  <div style="background:#1e293b; padding:30px; border-radius:10px; width:300px;">
    <h2 style="text-align:center;">💰 Expense Tracker</h2>

    <input type="text" id="username" placeholder="Username">
    <input type="password" id="password" placeholder="Password">

    <button onclick="login()">Login</button>
    <button onclick="register()">Register</button>
  </div>
</div>

<?php else: ?>

<!-- 📊 DASHBOARD -->
<div class="dashboard">

  <!-- SIDEBAR -->
  <div class="sidebar">
    <h2>💰 Tracker</h2>
    <a href="#">Dashboard</a>
    <a href="#">Transactions</a>
    <a href="#">Reports</a>
  </div>

  <!-- MAIN -->
  <div class="main">

    <!-- TOPBAR -->
    <div class="topbar">
      <h2>Dashboard</h2>
      <button onclick="logout()">Logout</button>
    </div>

    <!-- SUMMARY CARDS -->
    <div class="cards">
      <div class="card">Balance<br>₹<span id="balance">0</span></div>
      <div class="card">Income<br>₹<span id="income">0</span></div>
      <div class="card">Expense<br>₹<span id="expense">0</span></div>
    </div>

    <!-- GRID -->
    <div class="grid">

      <!-- ADD TRANSACTION -->
      <div class="card">
        <h3>Add Transaction</h3>
        <input type="text" id="desc" placeholder="Description">
        <input type="number" id="amount" placeholder="Amount">
        <select id="type">
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <button onclick="addTransaction()">Add</button>
      </div>

      <!-- TRANSACTION TABLE -->
      <div class="card">
        <h3>Transactions</h3>
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody id="list"></tbody> <!-- 🔥 IMPORTANT -->
        </table>
      </div>

    </div>

    <!-- CHART -->
    <div class="card" style="margin-top:20px;">
      <h3>Analytics</h3>
      <canvas id="chart"></canvas>
    </div>

  </div>

</div>

<?php endif; ?>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="script.js"></script>

</body>
</html>