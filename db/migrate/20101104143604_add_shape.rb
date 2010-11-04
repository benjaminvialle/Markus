class AddShape < ActiveRecord::Migration
  def self.up
	create_table :shape do |t| 
 		t.column :annotation_id, :int
		t.column :color, :string
		t.column :thickness, :int
	end

	create_table :point do |t|
	t.column :shape_id, :int
 	t.column :order, :int
 	t.column :x, :int
 	t.column :y, :int
	end 

	create_table :area do |t| 
 		t.column :annotation_id, :int
		t.column :top, :int
		t.column :bottom, :int
		t.column :left, :int
		t.column :right, :int
	end


	change_table :annotation do |t|
		t.remove :annotation_id, :int
		t.remove :x1, :int
		t.remove :y1, :int
		t.remove :x2, :int
		t.remove :y2, :int
		
	end 


  end

  def self.down
	drop_table :shape if table_exists?(:shape)
	drop_table :point if table_exists?(:point)
	drop_table :area if table_exists?(:area)
	change_table :annotation do |t|
		t.column :annotation_id, :int
		t.column :x1, :int
		t.column :y1, :int
		t.column :x2, :int
		t.column :y2, :int
	end

  end
end
