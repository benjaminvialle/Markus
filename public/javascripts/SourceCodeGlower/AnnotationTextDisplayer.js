/** Annotation Text Displayer Class

This class is in charge of displaying collections of Annotation Texts.  It puts them
in a G with a class called "annotation_text_display" and is in charge of displaying
that G at given coordinates, and hiding that G.

Multiple texts are displayed at once, and each one is contained with a <p> tag.

Rules:
- This class requires/assumes the Prototype javascript library
- Assumes existence of AnnotationText class
**/

var TEXT_DISPLAY_X_OFFSET = 5;
var TEXT_DISPLAY_Y_OFFSET = 5;

var AnnotationTextDisplayer = Class.create({

  initialize: function(parent_node) {
    //Create the G that we will display in
    this.display_node = new Element('g', {'class': 'annotation_text_display', 'onmousemove': 'hide_image_annotations()'});
    $(parent_node).appendChild(this.display_node);
    this.hide();
  },
  
  //Assumes collection is subclass of Prototype Enumerable class
  //x and y is the location on the screen where this collection will display
  displayCollection: function(collection, x, y) {
    //Are we already showing some Annotations?  Hide them then
    this.hideShowing();
    //Return if the collection is empty
    if(collection.length == 0){ return;}
    //Now, compile all the annotations in this collection into a single
    //string to display.  Each text will be contained in a new paragraph
    var final_string = '';
    collection.each(function(annotation_text) {
      final_string += annotation_text.getContent() + "/n/n";
    });
    
    //Update the Display node (a g, in this case) to be in the right
    //position, and to have the right contents
    //final_string = final_string.replace(/\n/g, '<br/>');
    this.updateDisplayNode(final_string, x, y);
    
    //Show the Displayer
    this.show();
  },
  
  
  //Hide all showing annotations.
  hideShowing: function() {
    if(this.getShowing()) {
      this.hide();
    }
  },
  
  
  updateDisplayNode: function(text, x, y) {
    var display_node = $(this.getDisplayNode());
    display_node.update(text);
    //display_node.setStyle({
    //  left: (x + TEXT_DISPLAY_X_OFFSET) + 'px',
    //  top: (y + TEXT_DISPLAY_Y_OFFSET) + 'px'
    //});
    display_node.setAttribute("transform","translate(" + (x + TEXT_DISPLAY_X_OFFSET) + "," + (y + TEXT_DISPLAY_Y_OFFSET) + ")");
  },
  
  
  //Hide the displayer
  hide: function() {
    console.debug(this.display_node);
    this.display_node.setAttribute('style','display:none');
  },
  
  
  //Show the displayer
  show: function() {
    this.display_node.setAttribute('style','display:block');
  },

  //Returns whether or not the Displayer is showing
  getShowing: function() {
    return this.getDisplayNode().visible;
  },
  
  
  //Returns the G that we're displaying in
  getDisplayNode: function() {
    return $(this.display_node);
  }
  
});
