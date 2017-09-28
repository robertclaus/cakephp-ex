<?php
//echo "START";
$query = "SELECT *,TIMEDIFF(NOW(),detonateAt)>0 FROM Ships";
$server = '127.13.106.2';
$user = 'adminAvyYBav';
$pass = 'MT1_ZPawpCfF';
$dbname = 'mysql';
$arr = array();
$dt=.04;
$counter=10000;//100=10 seconds,1000=2 min, 10,000 = 20 min, 100,000 = 3.5 hours
//echo "Start";
$con = mysql_connect($server, $user, $pass) 
	or die("Can't connect");
mysql_select_db($dbname);
//echo "Connected";
$nextTime=microtime(1);
echo microtime(1).'<br>';
$result=mysql_query("SELECT number FROM Data WHERE id=1");
$idRow = mysql_fetch_assoc($result);
$PhysID= $idRow['number']+1;
echo 'id:'.$PhysID.'<br>'.'before:'.$idRow['number'].'<br>';
mysql_query("UPDATE Data SET number=".$PhysID." WHERE id=1");
$continue=true;

while (($counter>0) AND ($continue)) {
$result = mysql_query("SELECT *,TIMEDIFF(NOW(),detonateAt)>0 as 'td' FROM Ships") or die('Query failed');
mysql_query("DELETE FROM Ships WHERE hp<=0");
while ($row = mysql_fetch_assoc($result)) {

		$vx=$row['vx']+$row['thrustStrength']*$dt*cos(deg2rad($row['thrustDirection']));
		$vy=$row['vy']+$row['thrustStrength']*$dt*sin(deg2rad($row['thrustDirection']));
		$vx=$vx-$vx*$dt;
		$vy=$vy-$vy*$dt;
		if($row['thrustDirection']>90 AND $row['thrustDirection']<270)
		{
		//$vx=-1*$vx;
		}
		$x=$row['x']+$vx*$dt;
		$y=$row['y']+$vy*$dt;
		
		if(sqrt($x*$x+$y*$y)>2150)
		{
			$direction=atan2($y,$x);
			$x=2145*cos($direction);
			$y=2145*sin($direction);
		}
		
		if($row['td']==1)
		{	
			$pointcounter=0;
			mysql_query("DELETE FROM Ships WHERE id=".$row['id']);
			$newResult=mysql_query("SELECT * FROM Ships WHERE SQRT(POW(x-".$x.",2)+POW(y-".$y.",2))<".$row['explosionRadius']);
			while($ships = mysql_fetch_assoc($newResult))
			{
				$pointcounter=$pointcounter+1;
				mysql_query("UPDATE Ships SET hp=".($ships['hp']-1)." WHERE id=".$ships['id']);
			}
			mysql_query("UPDATE Ships SET score=score+".$pointcounter." , spendingPoints=spendingPoints+".$pointcounter." WHERE id=".$row['spawnedBy']);
			
		}
		mysql_query("UPDATE Ships SET x=".$x.",y=".$y.",vx=".$vx.",vy=".$vy." WHERE id=".$row['id']);
		
}
//mysql_free_result($result);
while(microtime(1)<$nextTime)
{
usleep(10000); //sleep 10ms
}
$nextTime=microtime(1)+.1;//microtime is float in seconds to microsecond accuracy
//echo 'test';
//echo '<br>'.$nextTime;
$counter=$counter-1;
//mysql_close($link);

$result=mysql_query("SELECT number FROM Data WHERE id=1");
$idRow = mysql_fetch_assoc($result);
if($PhysID != $idRow['number'])
{
$continue=false;
echo 'CONTINUE FALSE<br>';
}

}
echo 'Done<br>';
echo microtime(1);
?>
