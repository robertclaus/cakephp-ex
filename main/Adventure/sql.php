<?php

$query = $_GET["query"];
//echo $query;
//echo "<br />";
$db_host = '172.30.225.108';
$db_user = 'cakephp';
$db_pass = 'hbwFKi4nhTcSMhb3';
$db_name = 'default';
//$query = 'SELECT * FROM Ships';

 mysql_connect($db_host,$db_user,$db_pass) or die(mysql_error());
//$query = $_GET["query"]; 
//$server = $dburl;
//$user = 'cakephp';
//$pass = 'MT1_ZPawpCfF';
//$dbname = 'php';
$arr = array();
//$con = mysql_connect($server, $user, $pass) 
	
mysql_select_db($db_name);

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
echo json_encode($arr);
mysql_free_result($result);
mysql_close($link);
?>
