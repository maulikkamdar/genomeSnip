<?php

require_once "phpSesame.php";

$gene = $_GET['gene'];
$req = $_GET['dataset'];
$chromosome = $_GET['chromosome'];

$sesame = array('url' => 'http://hcls.deri.org:8080/openrdf-sesame', 'repository' => 'tcga-connectors');
$store = new phpSesame($sesame['url'], $sesame['repository']);

$resultFormat = phpSesame::SPARQL_XML; // The expected return type, will return a phpSesame_SparqlRes object (Optional)
$lang = "sparql"; // Can also choose SeRQL (Optional)
$infer = true; // Can also choose to explicitly disallow inference. (Optional)

switch($req) {
	case "geneDis" : $query = "SELECT DISTINCT * WHERE {
							?x a <http://tcga.deri.ie/schema/omimCon> .
							{
								?x <http://tcga.deri.ie/schema/gene1> \"".$gene."\"; <http://tcga.deri.ie/schema/gene2> ?gene
							} UNION {
								?x <http://tcga.deri.ie/schema/gene2> \"".$gene."\"; <http://tcga.deri.ie/schema/gene1> ?gene
							}
							GRAPH <file://C:/fakepath/disease_connectors_9606-txt.ttl> {
								?x <http://tcga.deri.ie/schema/weight> ?weight.
							}
						}";
		break;
	case "genePath" : $query = "SELECT DISTINCT * WHERE {
							?x a <http://tcga.deri.ie/schema/keggCon> .
							{
								?x <http://tcga.deri.ie/schema/gene1> \"".$gene."\"; <http://tcga.deri.ie/schema/gene2> ?gene
							} UNION {
								?x <http://tcga.deri.ie/schema/gene2> \"".$gene."\"; <http://tcga.deri.ie/schema/gene1> ?gene
							}
							GRAPH <file://C:/fakepath/path-gene.ttl> {
								?x <http://tcga.deri.ie/schema/weight> ?weight.
							}
						}";
		break;
	case "genePub" : $query = "SELECT DISTINCT * WHERE {
							?x a <http://tcga.deri.ie/schema/pubmedCon> .
							{
								?x <http://tcga.deri.ie/schema/gene1> \"".$gene."\"; <http://tcga.deri.ie/schema/gene2> ?gene
							} UNION {
								?x <http://tcga.deri.ie/schema/gene2> \"".$gene."\"; <http://tcga.deri.ie/schema/gene1> ?gene
							}
							GRAPH <file://C:/fakepath/pubmed-gene.ttl> {
								?x <http://tcga.deri.ie/schema/weight> ?weight.
							}
						}";
		break;
	case "ideo" : $query = "SELECT DISTINCT * WHERE {
						?x a <http://tcga.deri.ie/schema/ideoCon> .
						{
						   ?x <http://tcga.deri.ie/schema/chromosome1> \"".$chromosome."\"
						} UNION {
						   ?x <http://tcga.deri.ie/schema/chromosome2> \"".$chromosome."\"
						}
						?x <http://tcga.deri.ie/schema/ideogram1> ?ideo1; 
						   <http://tcga.deri.ie/schema/ideogram2> ?ideo2; 
						   <http://tcga.deri.ie/schema/cDis> ?cDis; 
						   <http://tcga.deri.ie/schema/cPath> ?cPath; 
						   <http://tcga.deri.ie/schema/cPub> ?cPub
						}";
		break;
}
$result = $store->query($query, $resultFormat, $lang, $infer);

if($result->hasRows()) {
        foreach($result->getRows() as $row) {
        	if(!strcmp($req,"geneDis"))
                echo $row['x'] . "\t" . $row['gene'] . "\t" .$row['weight'] . "<br>";
            else if(!strcmp($req,"genePath"))
                echo $row['x'] . "\t" . $row['gene'] . "\t" .$row['weight'] . "<br>";
            else if(!strcmp($req,"genePub"))
                echo $row['x'] . "\t" . $row['gene'] . "\t" .$row['weight'] . "<br>";
            else if(!strcmp($req, "ideo"))
            	echo $row['ideo1'] . "\t" .$row['ideo2'] . "\t" .$row['cDis'] . "\t" .$row['cPath'] . "\t" .$row['cPub'] . "<br>";
        }
}
?>
