<?php
        define('DB_HOST', getenv('OPENSHIFT_MYSQL_DB_HOST'));
        define('DB_USER',getenv('OPENSHIFT_MYSQL_DB_USERNAME'));
        define('DB_PASS',getenv('OPENSHIFT_MYSQL_DB_PASSWORD'));
        define('DB_BASE','gitspot');
        define('DB_PORT',getenv('OPENSHIFT_MYSQL_DB_PORT')); 
echo DB_HOST;
function mysqlConnector(){
    $dsn = 'mysql:dbname='.DB_BASE.';host='.DB_HOST.';port='.DB_PORT;
    $dbh = new PDO($dsn, DB_USER, DB_PASS);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    return $dbh;
}
echo 'test';
 try {
                require_once 'conf.php';
                $conn = mysqlConnector();
                $stmt = $conn->prepare('SELECT * FROM demo');
                $stmt->execute();

                while($row = $stmt->fetch()) {
                        print_r($row);          
                }


        } catch(PDOException $e) {
                echo 'ERROR: ' . $e->getMessage();
        }


?>