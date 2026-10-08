class AddSubtipoSemaforoToEquipamentos < ActiveRecord::Migration[8.1]
  def change
    add_column :equipamentos, :subtipo_semaforo, :string
  end
end
