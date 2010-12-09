var shape = {
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
		document.addEventListener("mousedown", function(e) {
			shape.newCurve();
			document.addEventListener("mousemove", shape.tracker, false);
		}, false);

		document.addEventListener("mouseup", function(e) {
			document.removeEventListener("mousemove", shape.tracker, false);
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
	},
	
	newCurve: function() {
		shape.counter++;	  
		var newGroup = document.createElementNS("http://www.w3.org/2000/svg", "g"),
			newPath = document.createElementNS("http://www.w3.org/2000/svg", "path");

		if(shape.counter > 1) {
			var oldGroup = document.getElementById("shape_current"),
			    oldPath = oldGroup.firstChild;

			oldGroup.setAttribute("id", "new_shape_" + shape.counter);
		}

		newGroup.setAttribute("id", "shape_current");
		newPath.setAttribute("style", "stroke: #FF0000; fill: none;");
		newPath.setAttribute("d", "");
		newGroup.appendChild(newPath);
		document.getElementById("shapes").appendChild(newGroup);

	},
	counter: 0,
	lastCoords: null, 
	lastTime: new Date().getTime()
	
};
document.addEventListener("DOMContentLoaded", shape.init, false)

