let chart;

// 🔐 LOGIN
function login() {
  fetch('login.php', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: `username=${username.value}&password=${password.value}`
  })
  .then(res => res.text())
  .then(data => {
    if (data.trim() === "success") {
      location.reload();
    } else {
      alert(data);
    }
  });
}

// 📝 REGISTER
function register() {
  fetch('register.php', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: `username=${username.value}&password=${password.value}`
  })
  .then(res => res.text())
  .then(alert);
}

// 🚪 LOGOUT
function logout() {
  fetch('logout.php', {
    credentials: 'same-origin'
  })
  .then(() => location.reload());
}

// ➕ ADD TRANSACTION
function addTransaction() {
  fetch('add_transaction.php', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: `desc=${desc.value}&amount=${amount.value}&type=${type.value}`
  })
  .then(res => res.text())
  .then(data => {
    console.log("ADD RESPONSE:", data);

    if (data.trim() === "success") {
      loadTransactions();   // ✅ NOW THIS WILL WORK
    } else {
      alert(data);
    }
  });
}

// ❌ DELETE
function deleteTransaction(id) {
  fetch('delete_transaction.php?id=' + id, {
    credentials: 'same-origin'
  })
  .then(() => loadTransactions());
}

// 📊 LOAD TRANSACTIONS (MAIN FIX)
function loadTransactions() {
  fetch('fetch_transactions.php', {
    credentials: 'same-origin'
  })
  .then(res => res.json())
  .then(data => {

    console.log("DATA:", data);  // 🔥 debug

    let list = document.getElementById('list');
    if (!list) return;

    list.innerHTML = '';

    let income = 0, expense = 0;

    data.forEach(t => {
      let row = document.createElement('tr');

      row.innerHTML = `
        <td>${t.description}</td>
        <td>₹${t.amount}</td>
        <td>${t.type}</td>
        <td><button onclick="deleteTransaction(${t.id})">X</button></td>
      `;

      list.appendChild(row);

      if (t.type === 'income') income += parseFloat(t.amount);
      else expense += parseFloat(t.amount);
    });

    document.getElementById('income').innerText = income;
    document.getElementById('expense').innerText = expense;
    document.getElementById('balance').innerText = income - expense;

    drawChart(income, expense);
  })
  .catch(err => console.error(err));
}

// 📈 CHART
function drawChart(income, expense) {
  let ctx = document.getElementById('chart');
  if (!ctx) return;

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Income', 'Expense'],
      datasets: [{
        data: [income, expense]
      }]
    }
  });
}

// 🔄 AUTO LOAD
window.onload = function () {
  if (document.getElementById('list')) {
    loadTransactions();
  }
};