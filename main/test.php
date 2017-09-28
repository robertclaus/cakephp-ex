<?php
$server-'localhost';
$user = 'root';
$pass = 'holger';
$dbname = 'test';
$con = mysql_connect($server, $user, $pass) 
	or die("Can't connect");
echo 'Connected successfully';
mysql_select_db($dbname);
$query = 'SELECT * FROM Test';
$result = mysql_query($query) or die('Query failed');
echo "test";
echo $result;
echo mysql_get_server_info();
echo "<table>\n";
//mysql_query("INSERT INTO Test VALUES(2,'Angela','D');");
while ($row = mysql_fetch_assoc($result)) {
	echo "\t<tr>\n";
//	echo $row['id'] . "  " . $row['FirstName'];
	foreach($row as $col_value) {
		echo "\t\t<td>$col_value</td>\n";
	}
	echo "\t</tr>\n";
}
echo "</table>\n";

mysql_free_result($result);
mysql_close($link);
?>
