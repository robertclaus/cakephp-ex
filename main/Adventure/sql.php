<?php

$query = $_GET["query"];
//echo $query;
//echo "<br />";
$db_host = '127.0.0.1';
$db_user = 'cakephp';
$db_pass = 'hbwFKi4nhTcSMhb3';
$db_name = 'default';
//$query = 'SELECT * FROM Ships';

 $mysqli=new mysqli($db_host,$db_user,$db_pass,$db_name) or die(mysql_error());

 // Oh no! A connect_errno exists so the connection attempt failed!
if ($mysqli->connect_errno) {
    // The connection failed. What do you want to do? 
    // You could contact yourself (email?), log the error, show a nice page, etc.
    // You do not want to reveal sensitive information

    // Let's try this:
    echo "Sorry, this website is experiencing problems.";

    // Something you should not do on a public site, but this example will show you
    // anyways, is print out MySQL error related information -- you might log this
    echo "Error: Failed to make a MySQL connection, here is why: \n";
    echo "Errno: " . $mysqli->connect_errno . "\n";
    echo "Error: " . $mysqli->connect_error . "\n";
    
    // You might want to show them something nice, but we will simply exit
    exit;
}

if (!$result = $mysqli->query($query)) {
    // Oh no! The query failed. 
    echo "Sorry, the website is experiencing problems.";

    // Again, do not do this on a public site, but we'll show you how
    // to get the error information
    echo "Error: Our query failed to execute and here is why: \n";
    echo "Query: " . $sql . "\n";
    echo "Errno: " . $mysqli->errno . "\n";
    echo "Error: " . $mysqli->error . "\n";
    exit;
}

// Phew, we made it. We know our MySQL connection and query 
// succeeded, but do we have a result?
if ($result->num_rows === 0) {
    // Oh, no rows! Sometimes that's expected and okay, sometimes
    // it is not. You decide. In this case, maybe actor_id was too
    // large? 
    echo [];
    exit;
}

 $arr = array();
while ($row = $result->fetch_assoc()) {
//	echo "\t<tr>\n";
//	echo $row['id'] . "  " . $row['FirstName'];
	foreach($row as $col_value) {
//		echo "\t\t<td>$col_value</td>\n";
		array_push($arr,$col_value);
	}
//	echo "\t</tr>\n";
}
//echo "</table>\n";
echo json_encode($arr);
$result->free();
$mysqli->close();
?>
