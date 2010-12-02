 # A new rake to generate ShapeAnnotations  & Points

namespace :markus do
  namespace :simulator do
    desc "Generate Shapes  & Points"
    task(:shape => :environment) do
      num_of_shapes = rand(3) + 3
      curr_shape_num=1
      while(curr_shape_num <= num_of_shapes) do
        curr_assignment_num = 1
        num_of_points = rand(6) + 10
        curr_point_num = 1
          while (curr_point_num <= num_of_points) do

            puts "Start Generating Point # " + curr_assignment_num.to_s + " of Shape # "+ curr_shape_num.to_s
	    point_order = curr_point_num+curr_shape_num
	    point_x=rand(100)
	    point_y=rand(100)

            point=Point.create(:order => point_order,:coord_x => point_x,:coord_y => point_y)
            point.save

	    puts "Finish creating Point # " + curr_assignment_num.to_s + " of Shape # "+ curr_shape_num.to_s

	    curr_assignment_num += 1
	    curr_point_num += 1

          end

          puts "Start Generating ShapeAnnotation # "+ curr_shape_num.to_s

          color = #FFFF0000
          thickness = rand(5)
          shapeAnnotation = ShapeAnnotation.create(:color => color,:thickness => thickness)
          shapeAnnotation.save
          puts "Finish creating ShapeAnnotation # "+ curr_shape_num.to_s
        curr_shape_num += 1
      end
     end
  end
end

       
