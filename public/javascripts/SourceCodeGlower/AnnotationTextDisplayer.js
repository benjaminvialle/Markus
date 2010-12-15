/** Annotation Text Displayer Class

This class is in charge of displaying collections of Annotation Texts.    It puts them
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
    
    //Assumes collection is subclass of Prototype Enumerable class
    //x and y is the location on the screen where this collection will be displayed
    displayCollection: function(collection, x, y) {
        //Return if the collection is empty
        if(collection.length == 0){ return;}
        
        //Update the Display node (a g, in this case) to be in the right
        //position, and to have the right contents
        this.updateDisplayNode(collection, x, y);
        
        //Show the Displayer
        this.show();
    },
    
    
    //Hide all showing annotations.
    hideShowing: function() {
        if(this.getShowing()) {
            this.hide();
        }
    },
    
    
    updateDisplayNode: function(collection, x, y) {
    
        $('annotation_rect_display').setAttribute("x", x + TEXT_DISPLAY_X_OFFSET);
        $('annotation_rect_display').setAttribute("y", y + TEXT_DISPLAY_Y_OFFSET);
        
        $('annotation_text_display').setAttribute("y", y + TEXT_DISPLAY_Y_OFFSET);
        
        // Delete all the annotations
        while ($('annotation_text_display').firstChild) {
            $('annotation_text_display').removeChild($('annotation_text_display').firstChild);
        }
        
        // Now, compile all the annotations of the collection in the text node
        
        // Maximum number of characters in a line
        var CharMaxNb=10;
    
        collection.each(function(annotation_text) {
        
            // First let's define a function to add a tspan in the DOM
            appendTspan = function(text) {
                // Add a child node tspan to the annotation text displayer 
                var tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
                tspan.setAttribute("x", x + TEXT_DISPLAY_X_OFFSET);
                tspan.setAttribute('dy', '1em');
                tspan.textContent = text;
                $('annotation_text_display').appendChild(tspan);
            };
            
              
            // Then let's adapt text size of the annotation
            var wordList = annotation_text.getContent().split(' ');
            var wrapText='';
            for (var i=0; i<wordList.length; i++) {
                // Count the numbers of characters
                if (parseInt(wrapText.length) + parseInt(wordList[i].length) < CharMaxNb
                && wordList[i].indexOf('\n') == -1) {
                    wrapText.length = parseInt(wrapText.length) + parseInt(wordList[i].length);
                    wrapText = wrapText + ' ' + wordList[i];
                } else {
                    wrapText = wrapText + ' ' + wordList[i];
                    // Then we add the tspan node with the function we defined
                    this.appendTspan(wrapText);
                    wrapText="";
                }
            }
            // Finish by adding the last line the text node
            this.appendTspan(wrapText);
            
                
        }); 
        
        $('annotation_rect_display').setAttribute("width", 500);
        $('annotation_rect_display').setAttribute("height", 100);
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
