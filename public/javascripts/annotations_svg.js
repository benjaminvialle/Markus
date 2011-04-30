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
        var path = $("shape_current").firstChild,
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
        newPath.setAttribute("style", "stroke: " + Handler.color + "; stroke-width: " + Handler.thickness);
        newGroup.appendChild(newPath);
        $("shapes").appendChild(newGroup);

        shapeAnnotation.addPoint(e.pageX, e.pageY);
    },

    finalize: function(e) {
        // Moves the old shape
        var oldGroup = $("shape_current"),
            oldPath = oldGroup.firstChild,
            points = [];

        points = oldPath.getAttribute("d").split(" ");

        if(points.length < 2) {
            // If there is only one point, don't save it
            oldGroup.parentNode.removeChild(oldGroup);
            return;
        }
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
                    currentPath.setAttribute("style", oldPath.getAttribute("style"));
                    currentPath.setAttribute("d", "M" + point.x + "," + point.y);
                    oldGroup.appendChild(currentPath);
                } else {
                    currentPath.setAttribute("d", currentPath.getAttribute("d")+ " L"+point.x+","+point.y);
                }
            }
            oldGroup.removeChild(oldPath);

        }

        oldGroup.setAttribute("id", "new_shape_" + shapeAnnotation.counter);
        $A(oldGroup.childNodes).each(function(path) {
            Event.observe(path, "click", function(e) {
                // Remove the g element containing all the paths
                this.parentNode.parentNode.removeChild(this.parentNode);
            });

        });
        shapeAnnotation.counter++;
        Handler.displaySaveButton();
    },

    processShapes: function() {
        var shapes = [];
        // Get the shapes and the areas drawn
        $A($("shapes").childNodes).each(function(item) {
            if(item.localName == null) return;
            if(item.getAttribute("id").split("_")[0] == "new") {
                if(item.localName == "g") {
                    shapes.push(shapeAnnotation.processShape(item));
                }
            }
        });
        return shapes;
    },

    processShape: function(node) {
        var shape = {
                localId: node.getAttribute("id").split("_")[2],
                color: Handler.color,
                thickness: Handler.thickness,
                points: []
            },
            point;

        $A(node.childNodes).each(function(path) {
            path = path.getAttribute("d");
                // The path syntax is "Mx,y Lx,y Lx,y"
                path.split(' ').each(function(point) {
                    // Remove the first letter (it's not part of the
                    // coordinates)
                    point = point.substr(1);

                    shape.points.push({
                        x: point.split(',')[0],
                        y: point.split(',')[1]
                    });

                });
        });

        return shape;
    },

    counter: 0,
    lastCoords: null,
    lastTime: new Date().getTime(),
    points: 0
};


var areaAnnotation = {
    create: function(e) {
        var selectBox = document.createElementNS("http://www.w3.org/2000/svg", "rect");

        this.startCoords = {"x": e.pageX, "y": e.pageY};
        selectBox.setAttribute("id", "select_box");
        selectBox.setAttribute("class", "area_annotation");
        selectBox.setAttribute("x", e.pageX);
        selectBox.setAttribute("y", e.pageY);
        selectBox.setAttribute("width", "0");
        selectBox.setAttribute("height", "0");

        $("areas").appendChild(selectBox);
    },

    finalize: function(e) {
        var selectBox = $("select_box");

        // If the area is just a point, there is nothing to do
        if(selectBox.getAttribute("width") == "0" ||
                    selectBox.getAttribute("height") == "0") {
            selectBox.parentNode.removeChild(selectBox);
            return;
        }

        Event.observe(selectBox, "click", function(e) {
            if(Handler.mode == "delete") {
                this.parentNode.removeChild(this);
            }
        });

        selectBox.setAttribute("id", "new_area_" + areaAnnotation.counter);
        areaAnnotation.counter++;
        Handler.displaySaveButton();
    },

    processAreas: function() {
        var areas = [];
        // Get the shapes and the areas drawn
        $A($("areas").childNodes).each(function(item) {
            if(item.localName == null) return;
            if(item.getAttribute("id").split("_")[0] == "new") {
                if(item.localName == "rect") {
                    areas.push(areaAnnotation.processArea(item));
                }
            }
        });
        return areas;
    },

    processArea: function(node) {
         return {
            localId: node.getAttribute("id").split("_")[2],
            color: Handler.color,
            thickness: Handler.thickness,
            points: {
                "top": parseInt(node.getAttribute("y")),
                "left": parseInt(node.getAttribute("x")),
                "bottom": (parseInt(node.getAttribute("height")) + parseInt(node.getAttribute("y"))),
                "right": (parseInt(node.getAttribute("width")) + parseInt(node.getAttribute("x")))
            }
        };
    },

    trackMove: function(e) {
        var selectBox = $("select_box");

        selectBox.setAttribute("x", Math.min(e.pageX, areaAnnotation.startCoords.x));
        selectBox.setAttribute("y", Math.min(e.pageY, areaAnnotation.startCoords.y));
        selectBox.setAttribute("width", Math.abs(e.pageX - areaAnnotation.startCoords.x));
        selectBox.setAttribute("height", Math.abs(e.pageY - areaAnnotation.startCoords.y));
    },

    startCoords: {"x": 0, "y": 0},
    counter: 0
};


var Handler = {
    mode: "view",
    color: "#333",
    thickness: "2",
    annotation_text_displayer: {},
    init: function() {
        annotation_text_displayer = new AnnotationTextDisplayer($('annotations'));
        document.observe("mousedown", function(e) {
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
            document.observe("mousemove", Handler.trackMove);
        });

        document.observe("mouseup", function(e) {
            document.stopObserving("mousemove", Handler.trackMove);
            if(Handler.mode == "shape") {
                shapeAnnotation.finalize(e);
            } else if(Handler.mode == "area") {
                areaAnnotation.finalize(e);
            }
        });


        // Attach controls in the toolbar
        ["shape", "area", "save", "delete", "view"].each(function(item) {
                Event.observe($("button_" + item), "click", function(e) {
                    if(item == "save") {
                        Handler.setMode("save");
                        Handler.displaySavePopUp();
                    } else {
                        Handler.setMode(item);
                    }
                });
        });

        // Attach controls in the modal window
        Event.observe($("modal_save"), "click", Handler.save);
        Event.observe($("modal_close"), "click", Handler.closeSavePopUp);


        // Looks for path already in the svg and links to the annotation displayer
        $$('#shapes g').each(function(shape) {
            // Checks the user did not create a rect during init!
            if (! ~shape.id.indexOf('current')) {
                Event.observe(shape, 'mouseout', Handler.mouseOutPath);
                Event.observe(shape, 'mouseover', Handler.mouseOverPath);
            }
        });

        // Calls Handler.mouseMove when the mouse moves
        document.observe("mousemove", Handler.mouseMove);
    },

    /* Fired when the save button (in the toolbar) is clicked */
    displaySavePopUp: function() {
        $("modal").style.display='block';
    },

    /* Fired when the cancel button (in the modal window) is clicked */
    closeSavePopUp: function() {
        $("modal").style.display='none';
        $("new_annotation_text").clear();
        Handler.setMode("view");
    },

    /* Called when a new shape / area is drawn */
    displaySaveButton: function() {
        $("button_save").style.display = "inline";
    },

    /* Called when the shapes / areas are saved in the db*/
    hideSaveButton: function() {
        $("button_save").style.display = "none";
    },

    /* Change mode */
    setMode: function(mode) {
        if(mode == "shape") {
            this.mode = "shape";
            document.documentElement.style.cursor = "crosshair";

        } else if(mode == "area") {
            this.mode = "area";
            document.documentElement.style.cursor = "crosshair";

        } else if(mode == "delete") {
            this.mode = "delete";
            document.documentElement.style.cursor = "auto";

        } else if(mode == "view") {
            this.mode = "view";
            document.documentElement.style.cursor = "auto";

        } else if(mode == "save") {
            this.mode = "save";
            document.documentElement.style.cursor = "auto";
        }
    },

    // Is called when the mouse moves *while drawing*
    trackMove: function(e) {
        if(Handler.mode == "shape") {
            shapeAnnotation.trackMove(e);
        } else if(Handler.mode == "area") {
            areaAnnotation.trackMove(e);
        }
    },

    // Is called when the mouse moves
    mouseMove: function(e) {
        if(Handler.mode == "view") {
            annotation_text_displayer.displayAnnotations(e);
        }
    },

    // Is called when the mouse is over a path
    mouseOverPath: function(e) {
        if(Handler.mode == "view") {
            annotation_text_displayer.addAnnotationPath(e);
        }
    },

    // Is called when the mouse leaves a path
    mouseOutPath: function(e) {
        if(Handler.mode == "view") {
            annotation_text_displayer.clearAnnotationPath(e);
        }
    },

    save: function(e) {
        // Get the shapes properties
        var color, annotations = Handler.processNewAnnotations();

        // Get the annotation text
        annotations.annotation_text = $F("new_annotation_text");

        // Actually saves the shapes
        new Ajax.Request(Handler.queryURI, {
            method: 'post',
            parameters: { annotations: Object.toJSON(annotations) },
            onSuccess: function(transport) {
                var response = transport.responseText;
                Handler.processSavedAnnotations(annotations.annotation_text, response.evalJSON())
                Handler.hideSaveButton();
                $("new_annotation_text").clear();
                Handler.closeSavePopUp();
            },
            onFailure: function() {
                // TODO Inform the user that something happened.
                alert("Could not save the annotations. Please try again later");
            }
        });
    },

    deleteAnnotation: function(annotation) {
        // TODO make an AJAX call to remove the annotation from DB
        // TODO then remove it from the page.
    },

    // Generates a JSON object containing shapes and areas drawn by the user
    processNewAnnotations: function() {
        var toSave = {
                "shapes": [],
                "areas": []
        };

        toSave.shapes = shapeAnnotation.processShapes();
        toSave.areas = areaAnnotation.processAreas();

        return toSave;
    },

    // Processes the saved annotations so that they can be used like the ones
    // included in the SVG
    processSavedAnnotations: function(text, db_ids) {
        $H(db_ids.shapes).each(function(shape) {
            // Change the shape id to make it look like an old one
            $('new_shape_' + shape.key).setAttribute("id", "shape_" + shape.value);
            //Create a text node containing the text
            var textBox = document.createElementNS("http://www.w3.org/2000/svg", "text");
            textBox.setAttribute("id", "annotation_" + shape.value);
            textBox.textContent = text;
            $('annotations').appendChild(textBox);
            // Add a listener to the newly created shape
            Event.observe('shape_'+ shape.value, 'mouseout', Handler.mouseOutPath);
            Event.observe('shape_'+ shape.value, 'mouseover', Handler.mouseOverPath);
        });

        $H(db_ids.areas).each(function(area) {
            var textBox = document.createElementNS("http://www.w3.org/2000/svg", "text");
            textBox.setAttribute("id", "annotation_" + area.value);
            textBox.textContent = text;
            $('annotations').appendChild(textBox);
            $('new_area_' + area.key).setAttribute("id", "area_" + area.value);
        });

    }
};

document.observe("DOMContentLoaded", Handler.init);

