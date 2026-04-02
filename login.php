<?php
include 'db.php';

if (!isset($_POST['username']) || !isset($_POST['password'])) {
  echo "Invalid request";
  exit;
}

$username = $_POST['username'];
$password = $_POST['password'];

$stmt = $conn->prepare("SELECT * FROM users WHERE username=?");
$stmt->bind_param("s", $username);
$stmt->execute();

$res = $stmt->get_result();
$user = $res->fetch_assoc();

if ($user && password_verify($password, $user['password'])) {
  $_SESSION['user_id'] = $user['id'];
  $_SESSION['username'] = $user['username'];
  echo "success";
} else {
  echo "Invalid login";
}
?>