class CreateInfracoes < ActiveRecord::Migration[8.1]
  def change
    create_table :infracoes do |t|
      t.references :edital, null: false, foreign_key: true
      t.string :placa
      t.date :data_infracao
      t.decimal :valor, precision: 10, scale: 2
      t.string :auto_infracao
      t.string :codigo_infracao
      t.integer :ano_notificacao

      t.timestamps
    end
    add_index :infracoes, :placa
  end
end
