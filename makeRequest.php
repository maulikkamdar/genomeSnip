<?php 

function constructQuery($query, $url)
{
   $format = 'json';
 
   $searchUrl = $url . '?'
      .'query='.urlencode($query)
      .'&format='.$format;
	  
   return $searchUrl;
}

function request($url)
{
   if (!function_exists('curl_init')){ 
      die('CURL is not installed!');
   }
   $ch= curl_init();
   curl_setopt($ch, CURLOPT_URL, $url);
   curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
   $response = curl_exec($ch);
   curl_close($ch);
   return $response;
}

$term = "http://tcga.deri.ie/graph/" . $_GET['graph'];
$endpoint = $_GET['endpoint'];
$req = $_GET['dataset'];
$chromosome = $_GET['chromosomeNo'];
$patient = $_GET['patientNo'];

switch($req) {
	case "patientList" : $query = "SELECT DISTINCT * WHERE {
						GRAPH <" . $term . "> {
							?patient <http://tcga.deri.ie/schema/bcr_patient_barcode> ?s
						}}";
		break;
	case "methData" : $query = "SELECT DISTINCT * WHERE {
						<".$patient."> <http://tcga.deri.ie/schema/result> ?result.
						?result <http://tcga.deri.ie/schema/chromosome> \"".$chromosome."\"; 
								<http://tcga.deri.ie/schema/position> ?pos; 
								<http://tcga.deri.ie/schema/beta_value> ?value
					}";
		break;
	case "exonData" : $query = "SELECT DISTINCT * WHERE {
						<".$patient."> <http://tcga.deri.ie/schema/result> ?result.
						?result <http://tcga.deri.ie/schema/chromosome> \"".$chromosome."\";  
								<http://tcga.deri.ie/schema/start> ?start; 
								<http://tcga.deri.ie/schema/stop> ?stop;
								<http://tcga.deri.ie/schema/RPKM> ?value
					}";
		break;
}

$responseArray = request(constructQuery($query,$endpoint));
?>
 
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
      "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
 
<html xmlns="http://www.w3.org/1999/xhtml">
 
<head>
 
<title>SPARQL Proxy Executor</title>
<meta http-equiv="content-type" content="text/html; charset=utf-8" />
</head>
 
<body><?php echo $responseArray; ?>
</body>
</html>
