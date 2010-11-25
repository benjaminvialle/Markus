require File.dirname(__FILE__) + '/../test_helper'
require 'shoulda'

class PointTest < ActiveSupport::TestCase

  should validate_presence_of :order
  should validate_presence_of :x
  should validate_presence_of :y
  should validate_numericality_of :order
  should validate_numericality_of :x
  should validate_numericality_of :y
  should belong_to(:shape_annotation)

end
