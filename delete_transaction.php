<?php
include 'db.php';

if (!isset($_SESSION['user_id'])) {
  echo "Not logged in";
  exit;
}

if (!isset($_GET['id'])) {
  echo "No ID";
  exit;
}

$id = $_GET['id'];
$user_id = $_SESSION['user_id'];

$stmt = $conn->prepare("DELETE FROM transactions WHERE id=? AND user_id=?");
$stmt->bind_param("ii", $id, $user_id);

if ($stmt->execute()) {
  echo "success";
} else {
  echo "error";
}
?>