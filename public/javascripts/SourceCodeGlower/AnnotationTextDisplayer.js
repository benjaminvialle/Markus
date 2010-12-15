/** Annotation Text Displayer Class

This class is in charge of displaying collections of Annotation Texts.  It puts them
in a G with a class called "annotation_rect_display" and is in charge of displaying
that G at given coordinates, and hiding that G.

Multiple texts are displayed at once.

Rules:
- This class requires/assumes the Prototype javascript library
- Assumes existence of AnnotationText class
**/

var TEXT_DISPLAY_X_OFFSET = 5;
var TEXT_DISPLAY_Y_OFFSET = 5;

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
      final_string += annotation_text.getContent() + "/n---/n";
    });
    
    //Update the Display node (a g, in this case) to be in the right
    //position, and to have the right contents
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
    var CharMaxNb=80;
    
    $('annotation_rect_display').setAttribute("x", x + TEXT_DISPLAY_X_OFFSET);
    $('annotation_rect_display').setAttribute("y", y + TEXT_DISPLAY_Y_OFFSET);
    
    $('annotation_text_display').setAttribute("x", x + TEXT_DISPLAY_X_OFFSET);
    $('annotation_text_display').setAttribute("y", y + TEXT_DISPLAY_Y_OFFSET);
    
    // Adapt size to text
    var LineCharNb=0;
    var wordList = text.split(' ');
    var wrapText;
    for (var i=0; i<wordList.length; i++) {
      // Count the numbers of characters
      if (parseInt(LineCharNb) + parseInt(wordList[i].length) < CharMaxNb){
          if (wordList[i].indexOf('\n') != -1){
              LineCharNb = parseInt(LineCharNb) + parseInt(wordList[i].length);
              wrapText = wrapText + wordList[i];
          }else{
              LineCharNb=0;
              wrapText = wrapText + wordList[i];
          }
      

      }else{
          wrapText = wrapText + "\n";
          LineCharNb=0;
      }
      
    }

    $('annotation_text_display').textContent = wrapText ;
    //var textNode = document.createTextNode(wrapText);
    //$('annotation_text_display').appendChild(textNode);
    
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
