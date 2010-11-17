require File.dirname(__FILE__) + '/../test_helper'
require 'shoulda'

class ShapeAnnotationTest < ActiveSupport::TestCase

  should validate_presence_of :thickness
  should validate_presence_of :color
  should validate_numericality_of :thickness

  context "valid Color" do
    setup do
      @shapeAnnotation = ShapeAnnotation.make
    end
    should "be valid" do
      assert @shapeAnnotation.valid?
    end
  end


  context "invalid Color" do
    setup do
    end
      should "Raise an error" do
        assert_raise ActiveRecord::RecordInvalid do
          # "#E67G30" is not a valid RegExp
          @shapeAnnotation = ShapeAnnotation.make(:color =>'#E67G30')
        end
      end
  end
end
