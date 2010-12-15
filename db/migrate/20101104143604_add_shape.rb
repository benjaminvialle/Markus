class AddShape < ActiveRecord::Migration
  def self.up
    add_column :annotations, :thickness, :int
    add_column :annotations, :color, :string
  end

  def self.down
    remove_column :annotations, :thickness
    remove_column :annotations, :color
  end
end
