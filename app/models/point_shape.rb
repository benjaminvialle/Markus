class PointAnnotation < ShapeAnnotation

  validates_presence_of :order, :x, :y
  validates_numericality_of :order, :x, :y

end
