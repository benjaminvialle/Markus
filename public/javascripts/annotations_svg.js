var shapeAnnotation = {
    tracker: function(e) {
        if(shape.lastCoords == null ||
            Math.max(Math.abs(e.pageX - shape.lastCoords.x),
            Math.abs(e.pageY - shape.lastCoords.y)) > 5) {
            var now = new Date().getTime();
            if(now - shape.lastTime > 50) {    
                shape.addPoint(e.pageX, e.pageY);
                shape.lastCoords = {x: e.pageX, y:e.pageY};
                shape.lastTime = now;
            }
        }
    },
    init: function() {
        this.shapeCounter = 0;
        document.addEventListener("mousedown", function(e) {
            // Disable the drag'n'drop feature for images in
            // firefox. As the annotated image *is* the background,
            // this was quite annoying
            if(e.preventDefault)
                e.preventDefault();
            shape.newCurve();
            document.addEventListener("mousemove", shape.tracker, false);
        }, false);

        document.addEventListener("mouseup", function(e) {
            document.removeEventListener("mousemove", shape.tracker, false);
            shape.finalizeCurve();
        }, false);

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
        shape.points++;
    },
    
    newCurve: function() {
        var newGroup = document.createElementNS("http://www.w3.org/2000/svg", "g"),
            newPath = document.createElementNS("http://www.w3.org/2000/svg", "path");

        newGroup.setAttribute("id", "shape_current");
        newPath.setAttribute("d", "");
        newPath.setAttribute("style", "stroke: #FF0000; fill: none;");
        newGroup.appendChild(newPath);
        document.getElementById("shapes").appendChild(newGroup);

    },

    finalizeCurve: function() {
        console.debug("Finalize");
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
                    currentPath.setAttribute("style", "stroke: #FF0000; fill: none;");
                    currentPath.setAttribute("d", "M" + point.x + "," + point.y);
                    oldGroup.appendChild(currentPath);
                } else {
                    currentPath.setAttribute("d", currentPath.getAttribute("d")+ " L"+point.x+","+point.y);
                }
            }
            oldGroup.removeChild(oldPath);

        }

        oldGroup.setAttribute("id", "new_shape_" + shape.counter);
        shape.counter++;        
    },

    counter: 0,
    lastCoords: null, 
    lastTime: new Date().getTime(),
    points: 0
    
};


var areaAnnotation = {

};

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
                shapeAnnotation.newCurve();
            } else if(Handler.mode = "area") {
                areaAnnotation.newCurve();
            }
            document.addEventListener("mousemove", Handler.trackMove, false);
        }, false);

        document.addEventListener("mouseup", function(e) {
            document.removeEventListener("mousemove", shape.tracker, false);
            shape.finalizeCurve();
        }, false);
    },

    setMode: function(mode) {
        if(mode == "shape") {
            this.mode = "shape";

        } else if(mode == "area") {
            this.mode = "area";

        } else if(mode == "delete") {
            this.mode = "delete";

        } else if(mode == "view") {
            this.mode = "view";
        
        }
    }

};

document.addEventListener("DOMContentLoaded", shape.init, false)

