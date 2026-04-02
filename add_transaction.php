<?php
include 'db.php';

if (!isset($_SESSION['user_id'])) {
  echo "Not logged in";
  exit;
}

$desc = $_POST['desc'];
$amount = $_POST['amount'];
$type = $_POST['type'];
$user_id = $_SESSION['user_id'];

$stmt = $conn->prepare("INSERT INTO transactions (user_id, description, amount, type) VALUES (?, ?, ?, ?)");
$stmt->bind_param("isis", $user_id, $desc, $amount, $type);

if ($stmt->execute()) {
  echo "success";
} else {
  echo "error";
}
?>