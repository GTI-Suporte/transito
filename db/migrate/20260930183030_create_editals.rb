class CreateEditals < ActiveRecord::Migration[8.1]
  def change
    create_table :editals do |t|
      t.string :arquivo_nome
      t.date :data_publicacao
      t.string :tipo
      t.string :arquivo_hash

      t.timestamps
    end
    add_index :editals, :arquivo_hash, unique: true
  end
end
