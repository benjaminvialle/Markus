class ShapeAnnotation < Annotation


  validates_presence_of :thickness, :color
  validates_numericality_of :thickness
  #TODO add internationalization
  #Verification of Regexp
  validates_format_of :color, :with => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, :message => "Only an hexadecimal color is accepted."

end
