require File.dirname(__FILE__) + '/../test_helper'
require 'shoulda'

class ShapeAnnotationTest < ActiveSupport::TestCase

  should validate_presence_of :thickness
  should validate_presence_of :color
  should validate_numericality_of :thickness
  should have_many(:points)
  should_not allow_value("#E67G30").for(:color)
  should_not allow_value("# 0DA12").for(:color)
  should allow_value("#000000").for(:color)
  should allow_value("#E67E30").for(:color)


  context "valid Color" do
    setup do
      @shapeAnnotation = ShapeAnnotation.make
    end
    should "be valid" do
      assert @shapeAnnotation.valid?
    end
  end

  context "Fetching all points belonging to a Shape" do
    setup do
      @shapeAnnotation = ShapeAnnotation.make
      @point1 = Point.make(:shape_annotation_id => @shapeAnnotation.id)
      @point2 = Point.make(:shape_annotation_id => @shapeAnnotation.id)
    end
    should "fetch the 2 points" do
      assert_equal Array.[](@point1, @point2), @shapeAnnotation.points
    end
  end
end
