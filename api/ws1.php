<?php
	if ( isset( $_GET['numero'] )) {
		$numero_cnv  = (int)$_GET['numero'];
		echo file_get_contents('http://esdeporvida.com/projects/minsa/api/wsByNumero.php?numero='.$numero_cnv);
}
?>