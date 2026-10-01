class CreateEquipamentos < ActiveRecord::Migration[8.1]
  def change
    create_table :equipamentos do |t|
      t.string :identificacao
      t.text :endereco
      t.float :latitude
      t.float :longitude
      t.string :tipo

      t.timestamps
    end
  end
end
