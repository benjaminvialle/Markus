class ShapeAnnotation < Annotation

  validates_presence_of :thickness, :color
  validates_numericality_of :thickness
  #TODO add internationalization
  validates_format_of :color, :with => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, :message => "Only an hexadecimal color is accepted."

  has_many :points

  # Return an array containing all points related to a shape
  def points
    points = Point.find_all_by_shape_annotation_id(self.id)
  end
end
