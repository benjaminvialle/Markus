class AddShape < ActiveRecord::Migration
  def self.up
	create_table :shape do |t| 
 		t.column :annotation_id, :int
	end

	create_table :point do |t|
	t.column :shape_id, :int
 	t.column :order, :int
 	t.column :x, :int
 	t.column :y, :int
	end 
  end

  def self.down
	 drop_table :shape if table_exists?(:shape)
	 drop_table :point if table_exists?(:point)
  end
end
