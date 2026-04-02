<?php
include 'db.php';

if (!isset($_POST['username']) || !isset($_POST['password'])) {
  echo "Invalid request";
  exit;
}

$username = trim($_POST['username']);
$password = trim($_POST['password']);

if ($username == "" || $password == "") {
  echo "Fill all fields";
  exit;
}

// check existing user
$stmt = $conn->prepare("SELECT id FROM users WHERE username=?");
$stmt->bind_param("s", $username);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows > 0) {
  echo "Username already exists";
  exit;
}

// insert user
$hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $conn->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
$stmt->bind_param("ss", $username, $hash);

if ($stmt->execute()) {
  echo "success";
} else {
  echo "error";
}
?>