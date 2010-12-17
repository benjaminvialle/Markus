/** Annotation Text Displayer Class

This class is in charge of displaying collections of Annotation Texts. It puts them
in a G with a class called "annotation_rect_display" and is in charge of displaying
that G at given coordinates, and hiding that G.

Multiple texts are displayed at once.

Rules:
- This class requires/assumes the Prototype javascript library
- Assumes existence of AnnotationText class
**/

var TEXT_DISPLAY_X_OFFSET = 10;
var TEXT_DISPLAY_Y_OFFSET = 10;

var AnnotationTextDisplayer = Class.create({

    annotationPaths: $A(),

    initialize: function(parent_node) {
        //Create the G that we will display in
        this.display_node = document.createElementNS("http://www.w3.org/2000/svg", "g");
        this.display_node.setAttribute('id', 'display_node');
        
        var area = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        area.setAttribute('id', 'annotation_rect_display');
        
        var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute('id', 'annotation_text_display');
        
        this.display_node.appendChild(area);
        this.display_node.appendChild(text);
        
        $(parent_node).appendChild(this.display_node);
        this.hide();
    },
    
    
    // Display all the annotations below
    // The variable 'e' is the Mouse Event 'mousemove' managed by the class Handler
    displayAnnotations: function(e){
        // For all annotations drawn by the user
        var svg_areas = $("areas").getElementsByTagName("rect");
        
        var annotationVector = $A(); // To store the annotations we will display         
        var shape_annot; // To save each annotation we will treat
        
        // For each 'area' in the DOM
        for (var i = 0; i < svg_areas.length; i++) {
            area = svg_areas.item(i); 
            // Are we over a rectangle area ?
            // Mouse Capture (mouse events do not accept multiple events for superimposed shapes) 
            if (e.pageX > area.getAttribute('x') &&
                (e.pageX < (parseInt(area.getAttribute('x')) + parseInt(area.getAttribute('width')))) &&
                e.pageY > area.getAttribute('y') &&
                (e.pageY < (parseInt(area.getAttribute('y')) + parseInt(area.getAttribute('height'))))

                ) {
                
                // Look for the annotation which in linked to the 
                // Store the annotation
                if(area.getAttribute("id").indexOf("new") != -1) {
                    annotationVector.push(new AnnotationText(1,1,"This is a area annotation: let's wrap this text... "
                    + "Duis dignissim turpis a metus hendrerit nec porttitor elit accumsan. Aenean pharetra vestibulum nisi, "
                    + "eu ultrices sem aliquam at. "
                )); 
                } else {
                    console.debug(area.getAttribute("id").split("_"));
                    annotationVector.push(
                        new AnnotationText(
                            area.getAttribute("id").split("_")[1], 1,
                            $("annotation_"+area.getAttribute("id").split("_")[1]).textContent));
                }
            }
        }
        
        // For each 'path' in the annotationPaths
        this.annotationPaths.each(function(path) {
            // Look for the annotation which in linked to the 
                // Store the annotation
                if(path.parentNode.getAttribute("id").indexOf("new") != -1) {
                    annotationVector.push(new AnnotationText(1,1,"This is a shape annotation"));
                } else {
                    console.debug($("annotation_"+path.parentNode.getAttribute("id")));
                    annotationVector.push(
                        new AnnotationText(
                            path.parentNode.getAttribute("id").split("_")[1], 1,
                            $("annotation_"+path.parentNode.getAttribute("id").split("_")[1]).textContent));
                }
        });
        
        // Is the mouse over a shape? If not, hide the displayer.
        if (annotationVector.length == 0) {
            this.hideShowing();
        }else{
            this.displayCollection(
                 annotationVector,
                 e.pageX, 
                 e.pageY
            );
        }
    },
    
    // Adds an annotation to the displayer path list
    addAnnotationPath: function(e) {
        this.annotationPaths.push(e.currentTarget);
    },
 
    // Clears displayer path list
    clearAnnotationPath: function(e) {
        this.annotationPaths.clear();
    },
    
    
    // Assumes collection is subclass of Prototype Enumerable class
    // x and y is the location on the screen where this collection will be displayed
    displayCollection: function(collection, x, y) {
        // Return if the collection is empty
        if(collection.length == 0){ return;}
        
        // Update the Display node (a g, in this case) to be in the right
        // position, and to have the right contents
        this.updateDisplayNode(collection, x, y);
        
        //Show the Displayer
        this.show();
    },
    
    
    // Hide all showing annotations.
    hideShowing: function() {
        if(this.getShowing()) {
            this.hide();
        }
    },
    
    // Defines a function to add a tspan in $('annotation_text_display')
    appendTspan: function(text,x) {
        // Add a child node tspan to the annotation text displayer 
        var tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
        tspan.setAttribute("x", x + TEXT_DISPLAY_X_OFFSET);
        tspan.setAttribute('dy', '1em');
        tspan.textContent = text;
        $('annotation_text_display').appendChild(tspan);
    },
    
    // Wraps the text of each annotation. Displays all the annotation in the Displayer rectangle, and sets its position near the mouse.
    updateDisplayNode: function(collection, x, y) {
    
        $('annotation_rect_display').setAttribute("x", x + TEXT_DISPLAY_X_OFFSET);
        $('annotation_rect_display').setAttribute("y", y + TEXT_DISPLAY_Y_OFFSET);
        
        $('annotation_text_display').setAttribute("y", y + TEXT_DISPLAY_Y_OFFSET);
        
        // Delete all the annotations
        while ($('annotation_text_display').firstChild) {
            $('annotation_text_display').removeChild($('annotation_text_display').firstChild);
        }
        
        // Maximum number of characters in a line
        var CharMaxNb=40;
        // Counts the number of lines we will write
        var lineCounter=0;
        
        // Now, compile all the annotations of the collection in the text node
        for (var k=0; k<collection.length; k++){
            // We will work with each annotation text
            var annotation_text = collection[k];
            
            // Then let's adapt text size of the annotation
            var wordList = annotation_text.getContent().split(' ');
            var wrapText='';
            
            for (var i=0; i<wordList.length; i++) {
                // Count the numbers of characters
                if (parseInt(wrapText.length) + parseInt(wordList[i].length) < CharMaxNb
                && wordList[i].indexOf('\n') == -1) {
                    wrapText.length = parseInt(wrapText.length) + parseInt(wordList[i].length);
                    wrapText = wrapText + ' ' + wordList[i];
                } else {    // There is not enough place to put the word
                    // First we add the tspan node with the function we defined
                    this.appendTspan(wrapText,x);
                    lineCounter = lineCounter + 1;
                    
                    // Let's put the final word which is to big in the next line
                    
                    // If the word is bigger than the max number of characters
                    // We have to cut it and just append a little part of it to the next line
                    if (wordList[i].length > CharMaxNb) {
                        var longWord = wordList[i];
                        while (longWord.length > CharMaxNb) {
                            this.appendTspan(longWord.substring(0,CharMaxNb-3) + '-',x);
                            lineCounter = lineCounter + 1;
                            longWord = '-' + longWord.substring(CharMaxNb-3,longWord.length);
                        }
                        wordList[i] = longWord;
                    }
                    // Append the word to the next line
                    wrapText= wordList[i];
                }
            }
            // Finish by adding the last line the text node
            this.appendTspan(wrapText,x);
            this.appendTspan(" ",x);
            lineCounter = lineCounter + 2;
        } 
        $('annotation_rect_display').setAttribute("width", parseInt(5*CharMaxNb/8) + 'em');
        $('annotation_rect_display').setAttribute("height", lineCounter + 'em');
    },
    
    //Hide the displayer
    hide: function() {
        this.display_node.style.display ='none';
    },
    
    
    //Show the displayer
    show: function() {
        this.display_node.style.display ='block';
    },

    //Returns whether or not the Displayer is showing
    getShowing: function() {
        return this.getDisplayNode().style.display == 'block';
    },
    
    
    //Returns the G that we're displaying in
    getDisplayNode: function() {
        return $(this.display_node);
    }
    
});
