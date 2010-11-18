 # A new rake to generate ShapeAnnotations  & Points

namespace :markus do
  namespace :simulator do
    desc "Generate Shapes  & Points"
    task(:shape => :environment) do

 puts "Start generating Points ..."
	a = Point.new
	a.id=1
	a.shape_id=1
	a.order=1
	a.x=2
	a.y=4
	a.save

	b = Point.new
	b.id=2
	b.shape_id=1
	b.order=2
	b.x=4
	b.y=6
	b.save

	c = Point.new
	c.id=3
	c.shape_id=1
	c.order=3
	c.x=1
	c.y=1.5
	c.save

	d = Point.new
	d.id=4
	d.shape_id=1
	d.order=4
	d.x=12
	d.y=7
	d.save

	e = Point.new
	e.id=5
	e.shape_id=1
	e.order=5
	e.x=9.5
	e.y=4
	e.save

 puts "Start generating ShapeAnnotations ..."

	x=ShapeAnnotation.new
x.save
	y=ShapeAnnotation.new
y.save
	z=ShapeAnnotation.new
z.save

     end
  end
end

