class Point < ActiveRecord::Base

  validates_presence_of :order, :coord_x, :coord_y
  validates_numericality_of :order, :coord_x, :coord_y

  belongs_to :shape_annotation
end
