var width = window.innerWidth - 150;
var height = 660 // window.innerHeight - 320 // window.innerHeight - 200
var baseLength = 1/100000;

var genomeTrackCanvas = new Kinetic.Stage({
	container: 'genomeTrackCanvas',
	width: width,
	height: height, 
});

var staticTrackLayer = new Kinetic.Layer({
	width: 100
});

var dynamicTrackLayer = new Kinetic.Layer({
	width: width - 100,
	x: 100,
	draggable: true,
    dragBoundFunc: function(pos) {
      return {
        x: 100 + pos.x,
        y: this.getAbsolutePosition().y
      }
    }
});

var currentTracks = []; // Keep an array of tracks on the interface to determine the height of the next track.

var markerGroup = new Kinetic.Group();
var linearIdeogramGroup = new Kinetic.Group();
var linearGeneGroup = new Kinetic.Group();

var circularDatasets = new Kinetic.Group();
var barDatasets = new Kinetic.Group();
var linearDatasets = new Kinetic.Group();

var yAxis = new Kinetic.Line({
  points: [0, 0, 0, height],
  stroke: 'black',
  strokeWidth: 2,
  lineJoin: 'round',
  opacity: 0.1
});

var karyoTypeAxis = new Kinetic.Line({
  points: [0, 20, width - 100, 20],
  stroke: 'black',
  strokeWidth: 2,
  lineJoin: 'round',
  opacity: 0.1
});

dynamicTrackLayer.add(yAxis);
dynamicTrackLayer.add(karyoTypeAxis);

genomeTrackCanvas.add(staticTrackLayer);
genomeTrackCanvas.add(dynamicTrackLayer);

function drawGenomeTrack(chromosomeId) {
	linearIdeogramGroup.destroy();
	linearGeneGroup.destroy();
	markerGroup.destroy();
	
	var ideograms = chromosomes[chromosomeId].ideograms;
	var currentGenomeLength = chromosomes[chromosomeId].length;
	
//	var baseLength = (width-100)/currentGenomeLength;
	var acenFrags = 0;
	for(i in ideograms) {
		var color = lookUpTable[ideograms[i].gieStain];
		if(color == null)
			color = {"color": "#ffffff", "opacity": 1};
		if(ideograms[i].gieStain == "acen") {
			if(acenFrags%2 == 0) {
				var point1x = ideograms[i].start*baseLength;
				var point2x = ideograms[i].stop*baseLength;
				var point3x = ideograms[i].start*baseLength;
			} else {
				var point1x = ideograms[i].stop*baseLength;
				var point2x = ideograms[i].start*baseLength;
				var point3x = ideograms[i].stop*baseLength;
			}
			var ideogramElem = new Kinetic.Polygon({
		        points: [point1x, 0, point2x, 10, point3x, 20],
		        fill: color.color,
		        stroke: 'black'
		    });
			acenFrags++;
			linearIdeogramGroup.add(ideogramElem);
		} else {
			var ideogramElem = new Kinetic.Rect({
		        x: ideograms[i].start*baseLength,
		        y: 0,
		        width: (ideograms[i].stop - ideograms[i].start)*baseLength,
		        height: 20,
		        fill: color.color,
		        stroke: 'black',
		        opacity: color.opacity,
		      //  strokeEnabled: false
		    });
			linearIdeogramGroup.add(ideogramElem);
		}
	}
	
	dynamicTrackLayer.add(linearIdeogramGroup);
	
	var genes = chromosomes[chromosomeId].genes;
	for(i in genes){
		var geneElem = new Kinetic.Rect({
	        x: genes[i].start*baseLength,
	        y: 100,
	        width: (genes[i].stop - genes[i].start)*baseLength,
	        height: 5,
	        fill: 'blue',
	        stroke: 'black',
	        opacity: 0.6,
	        //strokeEnabled: false
	    });
		linearGeneGroup.add(geneElem);
		
		geneElem.on('mouseover', function() {
			console.log(this.getX());
	/*		this.setDrawFunc(function(context){
            	context.beginPath();
				context.arc(center.x, center.y, genomeInnerRadius, Math.PI, -Math.PI/2, true);
				context.lineTo(center.x + genomeOuterRadius*Math.cos(-Math.PI/2), center.y + genomeOuterRadius*Math.sin(-Math.PI/2));
				context.arc(center.x, center.y, genomeOuterRadius, -Math.PI/2, Math.PI);
				context.lineTo(center.x + genomeInnerRadius*Math.cos(Math.PI), center.y + genomeInnerRadius*Math.sin(Math.PI));
				context.closePath();
				context.fillStrokeShape(this);
            });*/
            
            
        });
	}
	dynamicTrackLayer.add(linearGeneGroup);
	console.log(linearGeneGroup);
	
	var totalMarkerCount = Math.floor(currentGenomeLength/1000000);
	var markerCount = 1;
	while(markerCount < (totalMarkerCount + 1) ){
		if(markerCount%5 == 0)
			markerHeight = 15;
		else
			markerHeight = 8;
		var markerX = markerCount*1000000*baseLength;
		var marker = new Kinetic.Line({
			points: [markerX, height - 30, markerX, height - 30 +markerHeight],
			stroke: 'black',
			strokeWidth: 2,
			lineJoin: 'round',
			opacity: 0.4
		});
		markerGroup.add(marker);
		if(markerCount%5 == 0){
			var markerText = new Kinetic.Text({
		        x: markerX - 3,
		        y: height - 30 + markerHeight,
		        text: markerCount,
		        fontSize: 10,
		        fontFamily: 'Calibri',
		        fill: 'green'
		     });
			markerGroup.add(markerText);
		}
		markerCount++;
	}
	
	dynamicTrackLayer.add(markerGroup);
	dynamicTrackLayer.draw();
}

// ------------------------------------ Dataset Plotting Functions --------------------------------
function plotCircularData(data, chromosomeId){
	circularDatasets.destroy();
	var currentGenomeLength = chromosomes[chromosomeId].length;
	var height = 150 + 20*(currentTracks.length-1);
	for(i in currentTracks){
		height += currentTracks[i].height;
	}
//	var baseLength = (width-100)/currentGenomeLength;
	for(i in data) {
		var posX = parseInt(data[i].position)*baseLength;
		var rad = data[i].normalizedValue/2;
		var circle = new Kinetic.Circle({
	        x: posX,
	        y: height-rad,
	        radius: rad,
	        fill: 'red',
	        stroke: 'red',
	        strokeWidth: 1,
	        opacity: 0.4
		});
		circularDatasets.add(circle);
	}
	dynamicTrackLayer.add(circularDatasets);
	dynamicTrackLayer.draw();
}

function plotLinearData(data, chromosomeId){
//	linearDatasets.destroy();
	var currentGenomeLength = chromosomes[chromosomeId].length;
	var height = 150 + 20*(currentTracks.length-1);
	for(i in currentTracks){
		height += currentTracks[i].height;
	}
//	var baseLength = (width-100)/currentGenomeLength;
	for(i in data) {
		var posX = parseInt(data[i].position)*baseLength;
		var rad = data[i].normalizedValue;
		var line = new Kinetic.Line({
			points: [posX, height - rad, posX, height],
			stroke: 'red',
			strokeWidth: 1,
			lineJoin: 'round',
			opacity: 1
	    });
		linearDatasets.add(line);
	}
	dynamicTrackLayer.add(linearDatasets);
	dynamicTrackLayer.draw();
}

function plotBarData(data, chromosomeId){
//	barDatasets.destroy();
	var currentGenomeLength = chromosomes[chromosomeId].length;
	var height = 150 + 20*(currentTracks.length-1);
	for(i in currentTracks){
		height += currentTracks[i].height;
	}
//	var baseLength = (width-100)/currentGenomeLength;
	for(i in data) {
		var startX = parseInt(data[i].start)*baseLength;
		var stopX = parseInt(data[i].stop)*baseLength;
		var rad = data[i].normalizedValue;
		var rect = new Kinetic.Rect({
	        x: startX,
	        y: height - rad,
	        width: stopX - startX,
	        height: rad,
	        fill: 'green',
	        stroke: 'green',
	        opacity: 0.4,
	        strokeWidth: 1
	    });

		barDatasets.add(rect);
	}
	dynamicTrackLayer.add(barDatasets);
	dynamicTrackLayer.draw();
}

//--------------------------------------------------------------------------------

function populateTracks(){
	var chromosomalData = [];
	for(i in chromosomes) {
		var chromosomeTag = {"id": i, "name": "Chromosome " + i.substring(3, i.length)};
		chromosomalData.push(chromosomeTag);
	}
	d3.select("#chromosomeIds").selectAll("option").data(chromosomalData).enter().append("option").text(function(d) {return d.name; }).attr("value", function(d){ return d.id;});
	drawGenomeTrack(chromosomalData[0].id);
	
	jQuery('#chromosomeIds').multiselect({
		onChange:function(element, checked){
			drawGenomeTrack(element.val());
		}
	});
}

var populateTracksTrigger = setInterval(function(){
	if(genomeParsed == true) {
		populateTracks();
		jQuery(".splashScreenExplorer").hide();
		clearInterval(populateTracksTrigger);
	}
}, 10);

jQuery('#trackSlider').slider({
	'tooltip': 'hide',
	'value' : 1
}).on('slide', function(ev){
    baseLength = baseLength*ev.value;
    dynamicTrackLayer.draw();
});