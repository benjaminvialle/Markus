require File.dirname(__FILE__) + '/../test_helper'
require 'shoulda'

class ShapeAnnotationTest < ActiveSupport::TestCase

  should validate_presence_of :thickness
  should validate_presence_of :color
  should validate_numericality_of :thickness

end
