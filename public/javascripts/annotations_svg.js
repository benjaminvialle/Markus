var shapeAnnotation = {
    trackMove: function(e) {
        if(shapeAnnotation.lastCoords == null ||
            Math.max(Math.abs(e.pageX - shapeAnnotation.lastCoords.x),
            Math.abs(e.pageY - shapeAnnotation.lastCoords.y)) > 5) {
            var now = new Date().getTime();
            if(now - shapeAnnotation.lastTime > 50) {    
                shapeAnnotation.addPoint(e.pageX, e.pageY);
                shapeAnnotation.lastCoords = {x: e.pageX, y:e.pageY};
                shapeAnnotation.lastTime = now;
            }
        }
    },

    addPoint: function(x, y) {
        var path = document.getElementById("shape_current").firstChild,
            points = path.getAttribute("d");
        if(points == "") {
            points = "M" + x + "," + y;
        } else {    
            points += " L" + x + "," + y; 
        }

        path.setAttribute("d", points);
        shapeAnnotation.points++;
    },
    
    create: function(e) {
        var newGroup = document.createElementNS("http://www.w3.org/2000/svg", "g"),
            newPath = document.createElementNS("http://www.w3.org/2000/svg", "path");

        newGroup.setAttribute("id", "shape_current");
        newPath.setAttribute("d", "");
        newGroup.appendChild(newPath);
        document.getElementById("shapes").appendChild(newGroup);

        shapeAnnotation.addPoint(e.pageX, e.pageY);
    },

    finalize: function(e) {
        // Moves the old shape
        var oldGroup = document.getElementById("shape_current"),
            oldPath = oldGroup.firstChild,
            points = [];

        points = oldPath.getAttribute("d").split(" ");
        // Chops the path in 10-node long paths. This is because the
        // mouseover event is fired when the mouse is over the area
        // outlined by the path, not the stroke itself.
        if(points.length > 10) {
            var currentPath,
                point;
            for(var i=0; i<points.length; i++) {
                // Get the coordinates from the "d" attribute
                point =  {
                    x: points[i].split(",")[0].substring(1),
                    y: points[i].split(",")[1]
                };
                if(currentPath == null || currentPath.getAttribute("d").split(" ").length > 10) {
                    if(currentPath != null) {
                        // The last point is duplicated
                        currentPath.setAttribute("d", currentPath.getAttribute("d")+ " L"+point.x+","+point.y);
                    }

                    currentPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    //currentPath.setAttribute("style", "stroke: #FF0000; fill: none;");
                    currentPath.setAttribute("d", "M" + point.x + "," + point.y);
                    oldGroup.appendChild(currentPath);
                } else {
                    currentPath.setAttribute("d", currentPath.getAttribute("d")+ " L"+point.x+","+point.y);
                }
            }
            oldGroup.removeChild(oldPath);

        }

        oldGroup.setAttribute("id", "new_shape_" + shapeAnnotation.counter);
        shapeAnnotation.counter++;        
    },

    counter: 0,
    lastCoords: null, 
    lastTime: new Date().getTime(),
    points: 0
    
};


var areaAnnotation = {
    startCoords: {"x": 0, "y": 0},
    create: function(e) {
        var selectBox = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        
        this.startCoords = {"x": e.pageX, "y": e.pageY};
        selectBox.setAttribute("id", "select_box");
        selectBox.setAttribute("class", "area_annotation");
        selectBox.setAttribute("x", e.pageX);
        selectBox.setAttribute("y", e.pageY);
        selectBox.setAttribute("width", "0");
        selectBox.setAttribute("height", "0");

        document.getElementById("annotations").appendChild(selectBox);
    },

    finalize: function(e) {
        var selectBox = document.getElementById("select_box");

        selectBox.setAttribute("id", "test");
    },

    trackMove: function(e) {
        var selectBox = document.getElementById("select_box");

        selectBox.setAttribute("x", Math.min(e.pageX, areaAnnotation.startCoords.x));
        selectBox.setAttribute("y", Math.min(e.pageY, areaAnnotation.startCoords.y));
        selectBox.setAttribute("width", Math.abs(e.pageX - areaAnnotation.startCoords.x));
        selectBox.setAttribute("height", Math.abs(e.pageY - areaAnnotation.startCoords.y));
    }

};

var annotation_text_displayer = {

}

var Handler = {
    mode: "view",
    init: function() {
        document.addEventListener("mousedown", function(e) {
            // Disable the drag'n'drop feature for images in
            // firefox. As the annotated image *is* the background,
            // this was quite annoying
            if(e.preventDefault)
                e.preventDefault();
            if(Handler.mode == "shape") {
                shapeAnnotation.create(e);
            } else if(Handler.mode == "area") {
                areaAnnotation.create(e);
            }
            document.addEventListener("mousemove", Handler.trackMove, false);
        }, false);

        document.addEventListener("mouseup", function(e) {
            document.removeEventListener("mousemove", Handler.trackMove, false);
            if(Handler.mode == "shape") {
                shapeAnnotation.finalize(e);
            } else if(Handler.mode == "area") {
                areaAnnotation.finalize(e);
            }
        }, false);
		
		["shape", "area", "save", "delete", "view"].each(function(item) {
				$("button_" + item).addEventListener("click", function(e) {
					Handler.setMode(item);			
				}, false);
		});
        
        document.addEventListener("mousemove", Handler.mouseMove, false);
        
        annotation_text_displayer = new AnnotationTextDisplayer($('annotations'));
            
    },

    setMode: function(mode) {
        if(mode == "shape") {
            this.mode = "shape";
			document.documentElement.style.cursor = "crosshair";

        } else if(mode == "area") {
            this.mode = "area";
			document.documentElement.style.cursor = "crosshair";

        } else if(mode == "delete") {
            this.mode = "delete";
			document.documentElement.style.cursor = "crosshair";

        } else if(mode == "view") {
            this.mode = "view";
			document.documentElement.style.cursor = "auto";
        
        }
    },

    trackMove: function(e) {
        if(Handler.mode == "shape") {
            shapeAnnotation.trackMove(e);
        } else if(Handler.mode == "area") {
            areaAnnotation.trackMove(e);
        }
    },

    mouseMove: function(e) {
    	if(Handler.mode == "view") {
    	    // For all annotations drawn by the user
            var svg_annotations = $("annotations").getElementsByTagName("rect");
            for (var i = 0; i < svg_annotations.length; i++) {
                var rect_annot = svg_annotations.item(i); 
                // Mouse Capture (mouse events do not accept multiple events for superimposed shapes) 
                if (e.pageX > rect_annot.getAttribute('x') &&
					(e.pageX < (parseInt(rect_annot.getAttribute('x')) + parseInt(rect_annot.getAttribute('width')))) &&
                    e.pageY > rect_annot.getAttribute('y') &&
					(e.pageY < (parseInt(rect_annot.getAttribute('y')) + parseInt(rect_annot.getAttribute('height'))))
                    ) {
                    // Display the annotation
                    
                    // TODO
                    // For the tests now
                    var annot_1 = new AnnotationText(1,1,"Je m'appelle Markus PIGROU");
                    var annot_2 = new AnnotationText(1,1,"et j'aime les toupoutous");
     
                    annotation_text_displayer.displayCollection( [annot_1,annot_2], e.pageX, e.pageY);
                } else {
                   annotation_text_displayer.hideShowing();
                }
            }
        }
    },
    
    save: function(e) {
        // Save the shapes drawn
    }
	

};

document.addEventListener("DOMContentLoaded", Handler.init, false);

