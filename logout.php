<?php
include 'db.php';

session_unset();
session_destroy();

echo "success";
?>