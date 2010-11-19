class Point < ActiveRecord::Base

  validates_presence_of :order, :x, :y
  validates_numericality_of :order, :x, :y

  belongs_to :shape_annotation
end
