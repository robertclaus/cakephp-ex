<?php
$ds          = DIRECTORY_SEPARATOR;  //1
 
$storeFolder = 'uploads';   //2
 
if (!empty($_FILES)) {
     
    $tempFile = $_FILES['file']['tmp_name'];          //3             
      
    $targetPathFull = dirname( __FILE__ ) . $ds. $storeFolder . $ds . 'Full' . $ds . $_POST['folderName'] . $ds;  //4
    $targetPathSmall = dirname( __FILE__ ) . $ds. $storeFolder . $ds . 'Small' . $ds . $_POST['folderName'] . $ds;  //4
    
	$targetFileFull =  $targetPathFull. $_POST['renameFile'];  //5
	$targetFileSmall =  $targetPathSmall. $_POST['renameFile'];  //5
 
	if (!file_exists($targetPathFull)) {
		mkdir($targetPathFull, 0777, true);
	}
	
	if (!file_exists($targetPathSmall)) {
		mkdir($targetPathSmall, 0777, true);
	}
 
    move_uploaded_file($tempFile,$targetFileFull); //6
    move_uploaded_file($tempFile,$targetFileSmall); //6
}
?>