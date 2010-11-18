class AddPointTable < ActiveRecord::Migration
  def self.up
    create_table :points do |t|
      t.column :shape_id, :int
      t.column :order, :int
      t.column :x, :int
      t.column :y, :int
    end 
  end

  def self.down
    drop_table :points if table_exists?(:points)
  end
end
