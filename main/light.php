<?php

$temp = $_GET["t"];
$bright = $_GET["b"];
//$query = "SELECT isOn FROM LightOn";
echo $query;
echo "<br />";
$db_host = '127.13.106.2';
$db_user = 'adminAvyYBav';
$db_pass = 'MT1_ZPawpCfF';
$db_name = 'mysql';
//$query = 'SELECT * FROM Ships';

 mysql_connect($db_host,$db_user,$db_pass) or die(mysql_error());
//$query = $_GET["query"]; 
//$server = $dburl;
//$user = 'adminAvyYBav';
//$pass = 'MT1_ZPawpCfF';
//$dbname = 'php';
$arr = array();
//$con = mysql_connect($server, $user, $pass) 
$query = 'UPDATE LightOn SET actedOn=1;';
mysql_select_db($db_name);

$result = mysql_query($query) or die('Query failed');
$query = "SELECT isOn FROM LightOn";
$result = mysql_query($query) or die('Query failed');
//echo "test";
//echo $result;
//echo mysql_get_server_info();
//echo "<table>\n";
//mysql_query("INSERT INTO Test VALUES(2,'Angela','D');");
while ($row = mysql_fetch_assoc($result)) {
//	echo "\t<tr>\n";
//	echo $row['id'] . "  " . $row['FirstName'];
	foreach($row as $col_value) {
//		echo "\t\t<td>$col_value</td>\n";
		array_push($arr,$col_value);
	}
//	echo "\t</tr>\n";
}
//echo "</table>\n";
echo "--";
echo json_encode($arr);
echo "--";
mysql_free_result($result);
mysql_close($link);
?>
