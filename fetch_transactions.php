<?php
include 'db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
  echo json_encode([]);
  exit;
}

$user_id = $_SESSION['user_id'];

$stmt = $conn->prepare("SELECT * FROM transactions WHERE user_id=? ORDER BY id DESC");
$stmt->bind_param("i", $user_id);
$stmt->execute();

$result = $stmt->get_result();

$data = [];

while ($row = $result->fetch_assoc()) {
  $data[] = $row;
}

echo json_encode($data);
?>