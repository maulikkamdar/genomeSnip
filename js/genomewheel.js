var ui = {
    stage: null,
    scale: 1,
    zoomFactor: 1.1,
    origin: {
        x: 0,
        y: 0
    },
    zoom: function(event) {
        event.preventDefault();
        var evt = event.originalEvent,
            mx = evt.clientX /* - canvas.offsetLeft */,
            my = evt.clientY /* - canvas.offsetTop */,
            wheel = evt.wheelDelta / 120;
        var zoom = (ui.zoomFactor - (evt.wheelDelta < 0 ? 0.2 : 0));
        var newscale = ui.scale * zoom;
        ui.origin.x = mx / ui.scale + ui.origin.x - mx / newscale;
        ui.origin.y = my / ui.scale + ui.origin.y - my / newscale;

        ui.stage.setOffset(ui.origin.x, ui.origin.y);
        ui.stage.setScale(newscale);
        ui.stage.draw();

        ui.scale *= zoom;
    }
};

var stage = ui.stage = new Kinetic.Stage({
	container: 'offsetDiv',
	width: window.innerWidth - 100,
	height: window.innerWidth - 100, // window.innerHeight - 200
	draggable: true
});

var genomeLayer = new Kinetic.Layer();

var chromosomeGroup = new Kinetic.Group({
    x: 0,
    y: 0
});

var ideogramGroup = new Kinetic.Group({
    x: 0,
    y: 0
});	

var geneGroup = new Kinetic.Group({
    x: 0,
    y: 0
});

var width = window.innerWidth - 100;
var height = window.innerWidth - 100;  // window.innerHeight - 200
var center = {"x": width/2, "y" : height/2};
// var minDimension = ((window.innerWidth - 100) > (window.innerHeight - 200)) ? (window.innerHeight - 200) : (window.innerWidth - 100);
var minDimension = width;

var genomeOuterRadius = (minDimension*0.95)/2;
var genomeInnerRadius = (minDimension*0.75)/2;
var ideoGramOuterRadius = (minDimension*0.93)/2
var geneOuterRadius = (minDimension*0.80)/2

var lookUpTable = [];
lookUpTable["acen"] = {"color" : "#0000ff", "opacity": 1};
lookUpTable["gneg"] = {"color" : "#ffffff", "opacity": 1};
lookUpTable["gpos25"] = {"color" : "#000000", "opacity": 0.25};
lookUpTable["gpos50"] = {"color" : "#000000", "opacity": 0.5};
lookUpTable["gpos75"] = {"color" : "#000000", "opacity": 0.75};
lookUpTable["gpos100"] = {"color" : "#000000", "opacity": 1};
lookUpTable["gvar"] = {"color": "#cccccc", "opacity": 1};
var sliceAngle = Math.PI/90;

function drawChromosomeLayer() {
	var baseAngle = (2*Math.PI - totalChromosomes*sliceAngle)/genomeLength;
	var markerAngle = 10000000*baseAngle;
	var count = 0;
	var endAngle = 0;
	var onAngle = sliceAngle/2 - Math.PI/2;
	for(i in chromosomes) {
		( function() {
			var currentAngle = onAngle;
			var endAngle = currentAngle + chromosomes[i].length*baseAngle;
			var totalMarkerCount = Math.floor(chromosomes[i].length/10000000);
			onAngle = endAngle + sliceAngle;
			var chromosomeName = i;
			var chromosomeElem = new Kinetic.Shape({
				drawFunc: function(context) {
					context.beginPath();
					context.arc(center.x, center.y, genomeInnerRadius, endAngle, currentAngle, true);
					context.lineTo(center.x + genomeOuterRadius*Math.cos(currentAngle), center.y + genomeOuterRadius*Math.sin(currentAngle));
					var markerCount = 0;
					var currentMarkerAngle = currentAngle;
					var endMarkerAngle = currentAngle;
					while(markerCount < totalMarkerCount) {
						currentMarkerAngle = currentAngle + markerCount*markerAngle;
						endMarkerAngle = currentAngle + (markerCount+1)*markerAngle;
						context.arc(center.x, center.y, genomeOuterRadius, currentMarkerAngle, endMarkerAngle);
						
						// ----- All the effort for markers 
						if((markerCount+1)%5 == 0){
							context.save();
							context.translate(center.x + genomeOuterRadius*1.022*Math.cos(endMarkerAngle), center.y + genomeOuterRadius*1.022*Math.sin(endMarkerAngle));
							context.font="10px Georgia";
							if(endMarkerAngle < Math.PI/2) {
								context.rotate(endMarkerAngle);
								context.fillText(markerCount+1,0,4);
							} else {
								context.rotate(endMarkerAngle + Math.PI);
								context.fillText(markerCount+1,-9,4);
							}		
							context.restore();
							context.lineTo(center.x + genomeOuterRadius*1.02*Math.cos(endMarkerAngle), center.y + genomeOuterRadius*1.02*Math.sin(endMarkerAngle));
						} else
							context.lineTo(center.x + genomeOuterRadius*1.012*Math.cos(endMarkerAngle), center.y + genomeOuterRadius*1.012*Math.sin(endMarkerAngle));
						// -----
						
						markerCount++;
					}
				//	context.arc(center.x, center.y, genomeOuterRadius, currentAngle, endAngle);
					context.arc(center.x, center.y, genomeOuterRadius, endMarkerAngle, endAngle);
					context.lineTo(center.x + genomeInnerRadius*Math.cos(endAngle), center.y + genomeInnerRadius*Math.sin(endAngle));
					context.closePath();
					context.fillStrokeShape(this);
					
					// ----- Print Chromosome names
					var textAngle = (currentAngle+endAngle)/2;
					context.save();
					context.translate(center.x + genomeOuterRadius*1.1*Math.cos(textAngle), center.y + genomeOuterRadius*1.1*Math.sin(textAngle));
					context.font="bold 64px sans-serif";
					if(textAngle < Math.PI/2) {
						context.rotate(textAngle);
						context.fillText(chromosomeName,0,0);
					} else {
						context.rotate(textAngle+Math.PI);
						context.fillText(chromosomeName,-18,0);
					}		
					context.restore();
					// -------
				},
				fill: '#ffffff',
				stroke: 'black',
				fillEnabled: false,
				strokeWidth: 1
			});
			
			chromosomeElem.on('mouseover', function() {
				console.log("here");
		/*		this.setDrawFunc(function(context){
	            	context.beginPath();
					context.arc(center.x, center.y, genomeInnerRadius, Math.PI, -Math.PI/2, true);
					context.lineTo(center.x + genomeOuterRadius*Math.cos(-Math.PI/2), center.y + genomeOuterRadius*Math.sin(-Math.PI/2));
					context.arc(center.x, center.y, genomeOuterRadius, -Math.PI/2, Math.PI);
					context.lineTo(center.x + genomeInnerRadius*Math.cos(Math.PI), center.y + genomeInnerRadius*Math.sin(Math.PI));
					context.closePath();
					context.fillStrokeShape(this);
	            });*/
	            
	            genomeLayer.draw();
	        });

			chromosomeElem.on('mouseout', function() {
	        //    this.setFill('#ffffff');
	            genomeLayer.draw();
	        });
			chromosomeGroup.add(chromosomeElem);
		}());
	}	
	genomeLayer.draw();
}

function drawIdeogramLayer() {
	var baseAngle = (2*Math.PI - totalChromosomes*sliceAngle)/genomeLength;
	var count = 0;
	var endAngle = 0;
	var onAngle = sliceAngle/2 - Math.PI/2;
	for(i in chromosomes) {
		var ideograms = chromosomes[i].ideograms;
		for(j in ideograms) {
			( function() {
				var currentAngle = onAngle;
				var endAngle = currentAngle + (ideograms[j].stop-ideograms[j].start)*baseAngle;
				var color = lookUpTable[ideograms[j].gieStain];
				if(color == null)
					color = {"color": "#ffffff", "opacity": 1};
				if(j == ideograms.length-1)
					onAngle = endAngle + sliceAngle;
				else
					onAngle = endAngle;
				var ideogramElem = new Kinetic.Shape({
					drawFunc: function(context) {
						context.beginPath();
						context.arc(center.x, center.y, genomeInnerRadius, currentAngle, endAngle);
						context.lineTo(center.x + ideoGramOuterRadius*Math.cos(endAngle), center.y + ideoGramOuterRadius*Math.sin(endAngle));
						context.arc(center.x, center.y, ideoGramOuterRadius, endAngle, currentAngle, true);
						context.lineTo(center.x + genomeInnerRadius*Math.cos(currentAngle), center.y + genomeInnerRadius*Math.sin(currentAngle));
						context.closePath();
						context.fillStrokeShape(this);
					},
					fill: color.color,
					stroke: 'black',
					opacity: color.opacity,
					strokeWidth: 1,
					strokeEnabled: false,
					draggable: true
				});
				
			//	ideogramElem.strokeEnabled(false);
				ideogramElem.on('mouseover', function() {
		           // this.setFill('#cccccc');
		            genomeLayer.draw();
		        });

				ideogramElem.on('mouseout', function() {
		           // this.setFill('#ffffff');
		            genomeLayer.draw();
		        });
				ideogramGroup.add(ideogramElem);
			}());
		}
	}
	genomeLayer.draw();
//	genomeParsed = true; // Remove this line of code later
}

function drawGeneLayer() {
	var baseAngle = (2*Math.PI - totalChromosomes*sliceAngle)/genomeLength;
	var count = 0;
	var endAngle = 0;
	var lengthCovered = 0;
	var onAngle = sliceAngle/2 - Math.PI/2;
	for(i in chromosomes) {
		var genes = chromosomes[i].genes;
		
		for(j in genes) {
			( function() {
				var staticAngle = onAngle + lengthCovered*baseAngle + count*sliceAngle;
				var currentAngle = staticAngle + genes[j].start*baseAngle;
				var endAngle = staticAngle + genes[j].stop*baseAngle;
			
				var geneElem = new Kinetic.Shape({
					drawFunc: function(context) {
						context.beginPath();
						context.arc(center.x, center.y, genomeInnerRadius, currentAngle, endAngle);
						context.lineTo(center.x + geneOuterRadius*Math.cos(endAngle), center.y + geneOuterRadius*Math.sin(endAngle));
						context.arc(center.x, center.y, geneOuterRadius, endAngle, currentAngle, true);
						context.lineTo(center.x + genomeInnerRadius*Math.cos(currentAngle), center.y + genomeInnerRadius*Math.sin(currentAngle));
						context.closePath();
						context.fillStrokeShape(this);
					},
					fill: "#ff0000",
					stroke: 'black',
					strokeWidth: 1,
					strokeEnabled: false,
					draggable: true
				});
				
				geneGroup.add(geneElem);
			}());
		}
		lengthCovered += chromosomes[i].length;
		count++;
	}
	genomeLayer.draw();
	genomeParsed = true;
}


genomeLayer.add(ideogramGroup);
genomeLayer.add(geneGroup);
genomeLayer.add(chromosomeGroup);
stage.add(genomeLayer);

jQuery(stage.content).on('mousewheel', ui.zoom);
