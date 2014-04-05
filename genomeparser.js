var chromosomes = [];
var geneLocator = [];
var cancerGenes = [];
/*var diseaseLocator = [];
var pubmedLocator = [];
var pubmedConnectors = [];*/
var mutSequences = [];
var snpSequences = [];

var chromConnectors = [], midValues = [], ideoConnectors = [], totalConnectors = [];
var genomeLength = 0;
var totalChromosomes = 0;
var totalGenes = 0;

var chordCounter = 0;
var genomeParsed = false, geneConReceived = false, 
	mutReceived = false, snpReceived = false, chromConParsed = false, ideoReceived = false;
var disConLevel = 10, pathConLevel = 4; pubConLevel = 1;
var species = "hsa";
//jQuery(".splashScreenExplorer").hide();

d3.tsv('data/hgTables.txt', function (data){
	var currentChromosomeLength = 0;
	for(i in data) {
		var ideStart = parseInt(data[i].chromStart);
		var ideEnd = parseInt(data[i].chromEnd);
		var newIdeogram = {"start" : ideStart, "stop" : ideEnd, "name": data[i].name, "gieStain": data[i].gieStain, "chromosome": data[i].chrom, "genes": []};
		if(chromosomes[data[i].chrom] == null) {
			genomeLength += currentChromosomeLength;
			var newChromosome = {"chromosome":data[i].chrom, "ideograms" : [], "genes" : [], "length": ideEnd};
			newChromosome.ideograms.push(newIdeogram);
			chromosomes[data[i].chrom] = newChromosome;
			currentChromosomeLength = ideEnd;
			totalChromosomes++;
		} else {
			chromosomes[data[i].chrom].ideograms.push(newIdeogram);
			chromosomes[data[i].chrom].length = ideEnd;
			currentChromosomeLength = ideEnd;
		}
	}
	genomeLength += currentChromosomeLength;   //EOF exception
	
	getAllGenes(species);
//	drawChromosomeLayer();
//	genomeParsed = true;
});

function getAllGenes(species) {
//	var geneList = "http://ws.bioinfo.cipf.es/cellbase/rest/latest/" + species + "/feature/gene/list?biotype=protein_coding"; //CellBase GeneList
	var geneList = "data/list.txt";
	d3.tsv(geneList, function (data){
		totalGenes = data.length;
		for(i in data) {
			var chromosomeId = "chr" + data[i].chromosome;
			var geneStart = parseInt(data[i].start);
			var geneEnd = parseInt(data[i].end);
			var gene = {"chromosome":chromosomeId,"start": geneStart, "stop": geneEnd, "ensemblId": data[i]['#Ensembl gene'], "description": data[i].description, "externalName": data[i]['external name'], "externalNameSrc": data[i]['external name source'], "source": data[i].source};
			if(chromosomes[chromosomeId] != null) {
				chromosomes[chromosomeId].genes.push(gene);
				var currentGeneCounter = 0;
				for(k in chromosomes[chromosomeId].ideograms){
					var ideogram = chromosomes[chromosomeId].ideograms[k];
					if(geneEnd > ideogram.start && geneStart < ideogram.stop)
						ideogram.genes.push(data[i]['external name']);
				}
			}
		}
		for(i in chromosomes){
			chromosomes[i].genes.sort(function(a,b){return parseFloat(a.start - b.start);})
			var geneCount = 0;
			for(j in chromosomes[i].genes){
				geneLocator[chromosomes[i].genes[j].externalName] = i + "_gene" + geneCount;
				geneCount++;
			}
		}
		drawChromosomeLayer();
		genomeParsed = true;
		getCancerGenes(); // Cancer Gene Census Data
	//	getLocalGenPubmedMap(); // Pubmed
	//	getOmimGeneMap(); // OMIM
		getChromConMap(); // Chromosome Similarity Files
	}, function (error, rows){
		console.log(rows); // do something here when internet out
		drawChromosomeLayer();
		genomeParsed = true;
	});
}

function getChromConMap() {
	d3.csv('data/chromRelsAll.csv', function (data){
		var dataSize = data.length;
		for(var i = 0; i < dataSize; i++) {	
			var chrom1 = "chr" + (i == 22 ? "X" : (i == 23 ? "Y" : i+1));
			
			var maxValue = 100000*((disConLevel*data[i]["TotalDis"])/(data[i]["AllDis"]) + 
							(pathConLevel*data[i]["TotalPath"])/(data[i]["AllPath"]) + 
							(pubConLevel*data[i]["TotalPub"])/(data[i]["AllPub"]));
			
			var midValue = {"start": 0, "stop": 0};
			var midSim = 100000*((disConLevel*data[i][chrom1+"_Dis"])/(data[i]["AllDis"]) + 
					(pathConLevel*data[i][chrom1+"_Path"])/(data[i]["AllPath"]) + 
					(pubConLevel*data[i][chrom1+"_Pub"])/(data[i]["AllPub"]))/maxValue;
			
			for(var j = 0; j < dataSize; j++){
				var chrom2 = "chr" + (j == 22 ? "X" : (j == 23 ? "Y" : j+1));
				
				var calcSim = 100000*((disConLevel*data[i][chrom2+"_Dis"])/(data[i]["AllDis"]) + 
								(pathConLevel*data[i][chrom2+"_Path"])/(data[i]["AllPath"]) + 
								(pubConLevel*data[i][chrom2+"_Pub"])/(data[i]["AllPub"]))/maxValue;
				
				var maxValueRev = 100000*((disConLevel*data[j]["TotalDis"])/(data[j]["AllDis"]) + 
									(pathConLevel*data[j]["TotalPath"])/(data[j]["AllPath"]) + 
									(pubConLevel*data[j]["TotalPub"])/(data[j]["AllPub"]));
				
				var calcSimRev = 100000*((disConLevel*data[j][chrom1+"_Dis"])/(data[j]["AllDis"]) + 
									(pathConLevel*data[j][chrom1+"_Path"])/(data[j]["AllPath"]) + 
									(pubConLevel*data[j][chrom1+"_Pub"])/(data[j]["AllPub"]))/maxValueRev;
				
				if(midValue.stop == 0){
					if((midValue.start+calcSim) < 0.5)
						midValue.start += calcSim;
					else {
						midValue.stop = midValue.start+midSim;
					}
				}
				if(j >= i)
					chromConnectors[chrom1+"_"+chrom2] = {"connector": chrom1+"_"+chrom2, "value": calcSim, "valueRev": calcSimRev, 
						"disease": data[i][chrom2+"_Dis"] + " :: " + data[i]["TotalDis"] + " :: " + data[j]["TotalDis"],
						"pathway": data[i][chrom2+"_Path"] + " :: " + data[i]["TotalPath"] + " :: " + data[j]["TotalPath"],
						"pubmed": data[i][chrom2+"_Pub"] + " :: " + data[i]["TotalPub"] + " :: " + data[j]["TotalPub"],
						"name": "Chromosome " + chrom1.substring(3) + " :: Chromosome " + chrom2.substring(3)};
			}
			
			midValues[chrom1] = midValue;
		}
	//	console.log(chromConnectors);
		chromConParsed = true;
	});
}

function getGeneConMap(containedGenes, ideoArcCenter, conIdeogram, midPoints, chromoMidPoints, ideoInnerLayerRadius, repOuterRadius, repInnerRadius, newOuterRadius, newInnerRadius) {
	chordCounter = 0;
	console.log(midPoints);
	for(i in containedGenes) {
		var gene = containedGenes[i];
		queryWorkbench(gene, ideoArcCenter, conIdeogram, midPoints, chromoMidPoints, ideoInnerLayerRadius, repOuterRadius, repInnerRadius, newOuterRadius, newInnerRadius);
	}
	var cancerGeneTrigger = setInterval(function(){
		if(chordCounter == 3*containedGenes.length){
			
		//	genomeLayer.add(pubConLayer);
			genomeLayer.add(pathwayConLayer);
			genomeLayer.add(diseaseConLayer);
			genomeLayer.draw();
			clearInterval(cancerGeneTrigger);
		}
	}, 1000);
}

function queryWorkbench(gene, ideoArcCenter, conIdeogram, midPoints, chromoMidPoints, ideoInnerLayerRadius, repOuterRadius, repInnerRadius, newOuterRadius, newInnerRadius){
	d3.text("makeSesameRequest.php?dataset=geneDis&gene="+gene, function(data){
		parseRows(data, gene, "disease", ideoArcCenter, conIdeogram, midPoints, chromoMidPoints, ideoInnerLayerRadius, repOuterRadius, repInnerRadius, newOuterRadius, newInnerRadius);
	});
	d3.text("makeSesameRequest.php?dataset=genePath&gene="+gene, function(data){
		parseRows(data, gene, "pathway", ideoArcCenter, conIdeogram, midPoints, chromoMidPoints, ideoInnerLayerRadius, repOuterRadius, repInnerRadius, newOuterRadius, newInnerRadius);
	});
	d3.text("makeSesameRequest.php?dataset=genePub&gene="+gene, function(data){
		parseRows(data, gene, "publication", ideoArcCenter, conIdeogram, midPoints, chromoMidPoints, ideoInnerLayerRadius, repOuterRadius, repInnerRadius, newOuterRadius, newInnerRadius);
	});
}

function parseRows(data, gene, type, ideoArcCenter, conIdeogram, midPoints, chromoMidPoints, ideoInnerLayerRadius, repOuterRadius, repInnerRadius, newOuterRadius, newInnerRadius) {
	var rows = data.split("<br>");
	var gene1id = geneLocator[gene];
	var gene1 = chromosomes[gene1id.split("_")[0]].genes[gene1id.split("_")[1].substring(4)];
	var gene1StartAngle = ideoArcCenter - Math.PI/2 + Math.PI*(gene1.start-conIdeogram.start)/(conIdeogram.stop-conIdeogram.start);
	var gene1EndAngle = ideoArcCenter - Math.PI/2 + Math.PI*(gene1.stop-conIdeogram.start)/(conIdeogram.stop-conIdeogram.start);	
	var gene1Mid = (gene1StartAngle+gene1EndAngle)/2;
	var conIdeogramStartAngle = ideoArcCenter - Math.PI/2 + Math.PI*conIdeogram.start/chromosomes[gene1id.split("_")[0]].length;
	var conIdeogramEndAngle = ideoArcCenter - Math.PI/2 + Math.PI*conIdeogram.stop/chromosomes[gene1id.split("_")[0]].length;
	var conIdeogramMid = (conIdeogramStartAngle+conIdeogramEndAngle)/2;
	
	var midPointsSec = [];
	var chromoMidPointsSec = [];
	for(i in midPoints){
		if(gene1Mid < conIdeogramMid) {
			if(gene1Mid < midPoints[i].angle && midPoints[i].angle < conIdeogramMid)
				midPointsSec.push(midPoints[i]);
		} else {
			if(gene1Mid > midPoints[i].angle && midPoints[i].angle > conIdeogramMid)
				midPointsSec.push(midPoints[i]);
		}
	}
	if(gene1Mid > conIdeogramMid)
		midPointsSec.reverse();
	
	for(i in chromoMidPoints){
		if(conIdeogramMid < ideoArcCenter) {
			if(conIdeogramMid < chromoMidPoints[i].angle && chromoMidPoints[i].angle < ideoArcCenter)
				chromoMidPointsSec.push(chromoMidPoints[i]);
		} else {
			if(conIdeogramMid > chromoMidPoints[i].angle && chromoMidPoints[i].angle > ideoArcCenter)
				chromoMidPointsSec.push(chromoMidPoints[i]);
		}
	}
	if(conIdeogramMid > ideoArcCenter)
		chromoMidPointsSec.reverse();
	
	var ideoCenterRadius = (ideoInnerLayerRadius + repOuterRadius)/2;
	var chromoCenterRadius = (repInnerRadius + newOuterRadius)/2;
	
	
	for(i in rows){
		var relation = rows[i].split("\t");
		if(relation.length > 2) {		
			var gene2id = geneLocator[relation[1]];
			if(typeof gene2id != "undefined") {
				var gene2 = chromosomes[gene2id.split("_")[0]].genes[gene2id.split("_")[1].substring(4)];
				var gene2Mid = (gene2.startAngle+gene2.endAngle)/2;
				var weight = parseInt(relation[2]);
				var id = relation[0];
				
				var chordPoints = [];
				chordPoints.push({"x": center.x + ideoInnerLayerRadius*Math.cos(gene1Mid), "y": center.y + ideoInnerLayerRadius*Math.sin(gene1Mid)});
				chordPoints.push({"x": center.x + ideoCenterRadius*Math.cos(gene1Mid), "y": center.y + ideoCenterRadius*Math.sin(gene1Mid)});
				for (i in midPointsSec){
					chordPoints.push({"x": midPointsSec[i].x, "y": midPointsSec[i].y});
				}
				chordPoints.push({"x": center.x + ideoCenterRadius*Math.cos(conIdeogramMid), "y": center.y + ideoCenterRadius*Math.sin(conIdeogramMid)});
			//	chordPoints.push({"x": center.x + repOuterRadius*Math.cos(conIdeogramMid), "y": center.y + repOuterRadius*Math.sin(conIdeogramMid)});
			//	chordPoints.push({"x": center.x + repInnerRadius*Math.cos(conIdeogramMid), "y": center.y + repInnerRadius*Math.sin(conIdeogramMid)});
				chordPoints.push({"x": center.x + chromoCenterRadius*Math.cos(conIdeogramMid), "y": center.y + chromoCenterRadius*Math.sin(conIdeogramMid)});
				for (i in chromoMidPointsSec){
					chordPoints.push({"x": chromoMidPointsSec[i].x, "y": chromoMidPointsSec[i].y});
				}
				chordPoints.push({"x": center.x + chromoCenterRadius*Math.cos(ideoArcCenter), "y": center.y + chromoCenterRadius*Math.sin(ideoArcCenter)});
				chordPoints.push({"x": center.x + newInnerRadius*Math.cos(ideoArcCenter), "y": center.y + newInnerRadius*Math.sin(ideoArcCenter)});
				chordPoints.push({"x": center.x, "y": center.y});
				chordPoints.push({"x": center.x + newInnerRadius*Math.cos(gene2Mid), "y": center.y + newInnerRadius*Math.sin(gene2Mid)});
				switch(type){
					case "pathway" : color = "#00ff00"; layer = pathwayConLayer; weight = weight*pathConLevel/10; break;
					case "publication" : color = "#0000ff"; layer = pubConLayer; weight = weight*pubConLevel/10; break;
					case "disease" : color = "#ff0000"; layer = diseaseConLayer; weight = weight*disConLevel/10; break;
				}
				var chord = getSpline(chordPoints, color, id, weight); 
				layer.add(chord);
			}
			// Calls back to GenomeWheel.js need to somehow make it independent but without timers
		}
	}
	chordCounter++;
}

function getIdeoConMap(chromosomeId){
	ideoReceived = false;
	ideoConnectors = [], totalConnectors = [];
	d3.text("makeSesameRequest.php?dataset=ideo&chromosome="+chromosomeId.substring(3), function(data){
		var rows = data.split("<br>");
	//	console.log(rows);
		for(i in rows){
			var relation = rows[i].split("\t");
			if(relation.length > 4) {		
				var calcSim = disConLevel*parseInt(relation[2]) + pathConLevel*parseInt(relation[3]) + pubConLevel*parseInt(relation[4]);
				if(relation[0].split("_")[0] == chromosomeId) {
					var newConnector = relation[0].split("_")[1]+"_"+relation[1].split("_")[0];
					var connectedIde = relation[1].split("_")[1];
				} else {
					var newConnector = relation[1].split("_")[1]+"_"+relation[0].split("_")[0];
					var connectedIde = relation[0].split("_")[1];
				}
				
				// For calculating relativity within ideogram identifiers
				if(totalConnectors[newConnector.split("_")[0]] != null){
					totalConnectors[newConnector.split("_")[0]].dis += parseInt(relation[2]);
					totalConnectors[newConnector.split("_")[0]].path += parseInt(relation[3]);
					totalConnectors[newConnector.split("_")[0]].pub += parseInt(relation[4]);
					totalConnectors[newConnector.split("_")[0]].value += calcSim;
				} else 
					totalConnectors[newConnector.split("_")[0]] = {"dis" : parseInt(relation[2]), "path": parseInt(relation[3]), 
						"pub": parseInt(relation[4]), "value": calcSim};
				
				// For calculating relativity within chromosome identifiers
				if(totalConnectors[newConnector.split("_")[1]] != null){
					totalConnectors[newConnector.split("_")[1]].dis += parseInt(relation[2]);
					totalConnectors[newConnector.split("_")[1]].path += parseInt(relation[3]);
					totalConnectors[newConnector.split("_")[1]].pub += parseInt(relation[4]);
					totalConnectors[newConnector.split("_")[1]].value += calcSim;
				} else 
					totalConnectors[newConnector.split("_")[1]] = {"dis" : parseInt(relation[2]), "path": parseInt(relation[3]), 
						"pub": parseInt(relation[4]), "value": calcSim};
				
				//Save information
				if(ideoConnectors[newConnector] != null) {
					ideoConnectors[newConnector].connectedIdes.push(connectedIde);
					ideoConnectors[newConnector].dis += parseInt(relation[2]);
					ideoConnectors[newConnector].path += parseInt(relation[3]);
					ideoConnectors[newConnector].pub += parseInt(relation[4]);
					ideoConnectors[newConnector].value += calcSim;
				} else {
					ideoConnectors[newConnector] = {"totalC": 0, "connectedIdes": [], "dis" : parseInt(relation[2]), 
							"path": parseInt(relation[3]), "pub": parseInt(relation[4]), "value": calcSim};
					ideoConnectors[newConnector].connectedIdes.push(connectedIde);
				}
				
			}
		}
		ideoReceived = true;
	//	console.log(ideoConnectors);
	//	console.log(totalConnectors);
	});
}
/**
 * Retrieves all the cancer genes from Cancer Gene Census
 * 
 */
function getCancerGenes(){
	d3.tsv('data/cancer_gene_census.tsv', function (data){
		for(i in data){
			var geneId = geneLocator[data[i].Symbol];
			if(typeof geneId != "undefined"){
				var cancerGene = chromosomes[geneId.split("_")[0]].genes[geneId.split("_")[1].substring(4)];
				if(data[i]["Cancer Somatic Mut"] == "yes")
					cancerGene.somaticMut = true;
				if(data[i]["Cancer Germline Mut"] == "yes")
					cancerGene.germlineMut = true;
				cancerGenes.push(geneId);
			}
		}
	});
}

/**
 * 
 * @param species
 * @param geneName
 */
function getGeneMutation(species, geneName) {
	mutReceived = false;
	var geneMutUrl = "http://ws.bioinfo.cipf.es/cellbase/rest/latest/"+species+"/feature/gene/"+geneName+"/mutation"; //CellBase GeneMut
	d3.tsv(geneMutUrl, function(data){
	//	console.log(data);
		mutSequences = data;
		mutReceived = true;
	}, function (error, rows) {
		console.log(rows);
	});
}

function getGeneSNP(species, geneName) {
	snpReceived = false;
	var geneMutUrl = "http://ws.bioinfo.cipf.es/cellbase/rest/latest/"+species+"/feature/gene/"+geneName+"/snp"; //CellBase GeneSNP
	d3.tsv(geneMutUrl, function(data){
	//	console.log(data);
		snpSequences = data;
		snpReceived = true;
	}, function (error, rows) {
		console.log(rows);
	});
}

//// --------------------- Unused Functions


function getLocalGenPubmedMap(){
	d3.tsv('data/gene2pubmed_connectors_9606_min.txt', function (data){
		console.log(data);
		for(i in data){
			pubmedConnectors[data[i].connector] = data[i].count; 
		}
		pubmedParsed = true;
	});
}

/**
 * 
 * Retrieves Pubmed-Gene Mappings
 * Originally downloaded from http://pubmed2ensembl56.smith.man.ac.uk/ Pubmed2Ensembl
 * Stored Locally as the mamppings are to EntrezIDs and I had no local Entrez-HGNC Mapping
 * Plus the file size is very large as it contains all organisms (here we only have 9606 humans)
 * 
 */
function getPubmedMap () {
	d3.tsv('data/gene2pubmed_9606.txt', function(data){
		for(i in data){
			if(pubmedLocator[data[i].pubId] == null) {
				var pubmedNode = {"id": data[i].pubId, "genes": [], "geneLocs": [], "connectors": []};
				pubmedNode.genes.push(data[i].hgncId);
				var geneId = geneLocator[data[i].hgncId];
				if(typeof geneId != "undefined")
					pubmedNode.geneLocs.push(geneId);
				else
					pubmedNode.geneLocs.push("");
				pubmedLocator[data[i].pubId] = pubmedNode;
			} else {
				pubmedLocator[data[i].pubId].genes.push(data[i].hgncId);
				var geneId = geneLocator[data[i].hgncId];
				if(typeof geneId != "undefined") {
				/*	for(prevId = 0; prevId < pubmedLocator[data[i].pubId].geneLocs.length; prevId++){
						if(pubmedLocator[data[i].pubId].geneLocs[prevId] == "")
							continue;
						
						var connector1 = pubmedLocator[data[i].pubId].geneLocs[prevId] + "_" + geneId;
						var connector2 = geneId + "_" + pubmedLocator[data[i].pubId].geneLocs[prevId];  
						if(pubmedConnectors[connector1] == null && pubmedConnectors[connector1] == null)
							pubmedConnectors[connector1] = 1;
						else if (pubmedConnectors[connector2] == null)
							pubmedConnectors[connector1]++;
						else
							pubmedConnectors[connector2]++;
					}*/
					console.log(geneId);
					pubmedLocator[data[i].pubId].geneLocs.push(geneId);
				}	
				else
					pubmedLocator[data[i].pubId].geneLocs.push("");
			}
		}
		
		
		console.log(pubmedConnectors);
		console.log(pubmedLocator);
		pubmedParsed = true;
	});
}

/**
 * 
 * Retrieves Omim Gene Map from local dataset (CSV)
 * The dataset was retrieved as a SPARQL Query against Uniprot Endpoint
 * The retrieval is performed against a local dataset as the endpoint is usually down
 * 
 */
function getOmimGeneMap(){
	d3.csv('data/omim.csv', function (data){
		for(i in data){
			if(diseaseLocator[data[i].mnemonic] == null) {
				var diseaseNode = {"url": data[i].disease, "mnemonic": data[i].mnemonic, "genes": [], "geneLocs": [], "description": data[i].diseaseName};
				diseaseNode.genes.push(data[i].name);
				var geneId = geneLocator[data[i].name];
				if(typeof geneId != "undefined")
					diseaseNode.geneLocs.push(geneId);
				else
					diseaseNode.geneLocs.push("");
				diseaseLocator[data[i].mnemonic] = diseaseNode;
			} else {
				diseaseLocator[data[i].mnemonic].genes.push(data[i].name);
				var geneId = geneLocator[data[i].name];
				if(typeof geneId != "undefined")
					diseaseLocator[data[i].mnemonic].geneLocs.push(geneId);
				else
					diseaseLocator[data[i].mnemonic].geneLocs.push("");
			}
		}
//	/	console.log(diseaseLocator);
		omimParsed = true;
		// -- for sorting associative arrays if need be
		/*var tuples = [];
		for (var key in diseaseLocator) tuples.push([key, diseaseLocator[key]]);
		tuples.sort(function(b, a) {
		    a = a[1].genes.length;
		    b = b[1].genes.length;
		    return a < b ? -1 : (a > b ? 1 : 0);
		});
		for(i in tuples){
			console.log(tuples[i][1].description + ":" + tuples[i][1].genes.length);
		}*/
	});
}

/**
 * Retrieves genomic sequence for specified chromosomal sequence
 * @param species
 * @param chromosome
 * @param start
 * @param end
 */
function getGeneSequence(species, chromosome, start, end, name) {
	var sequence = "";
	var geneSeq = "http://ws.bioinfo.cipf.es/cellbase/rest/latest/"+species+"/genomic/region/"+chromosome+":"+start+"-"+end+"/sequence"; //CellBase GeneSeq
	
	d3.tsv(geneSeq, function(data){
		for(i in data) {
			sequence += data[i][">"+chromosome+"_"+start+"_"+end+"_1"];
		}
		storage.setItem("reqSeq_"+name, sequence);
	}, function (error, rows){
		console.log(rows); // do something here when internet out
	});
//	return sequence;
}