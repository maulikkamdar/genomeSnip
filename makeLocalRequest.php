<?php
	$row = 0;
	$pubmedLocator = [];
	$pubmedConnector = [];
	
	if (($handle = fopen("data/gene2pubmed_96062.csv", "r")) !== FALSE) {
	    while (($data = fgetcsv($handle, 1000, "\t")) !== FALSE) {
	    	if($row++ == 0)
	    		continue;
	        if (array_key_exists($data[1], $pubmedLocator)) {
	        	foreach ($pubmedLocator[$data[1]]["genes"] as &$value) {
    				if (array_key_exists($value . "_" . $data[3], $pubmedConnector)) {
    					$pubmedConnector[$value . "_" . $data[3]]["count"]++;
    					$pubmedConnector[$value . "_" . $data[3]]["publications"].array_push($data[1]);
    				} else if (array_key_exists($data[3] . "_" . $value, $pubmedConnector)) {
    					$pubmedConnector[$data[3] . "_" . $value]["count"]++;
    					$pubmedConnector[$data[3] . "_" . $value]["publications"].array_push($data[1]);
    				} else {
    					$pubmedConnector[$data[3] . "_" . $value] = array("count" => 1, "publications" => array($data[1]));
    				}
				}
    			$pubmedLocator[$data[1]]["genes"].array_push($data[3]);
			} else {
				$pubmedLocator[$data[1]] = array("id" => $data[1], "genes" => array($data[3]));
			}
	    }
	    fclose($handle);
	}
	
/*	echo "connectionId\tcount\tpublicationIds<br/>";
	foreach($pubmedConnector as $key => $value)
	{
		$string =  $key."\t". $value["count"]."<br/>";
		echo $string;
	}*/
	print_r($pubmedConnector);
?>