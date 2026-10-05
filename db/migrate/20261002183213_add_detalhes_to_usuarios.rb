class AddDetalhesToUsuarios < ActiveRecord::Migration[8.1]
  def change
    add_column :usuarios, :nome, :string
    add_column :usuarios, :ativo, :boolean
  end
end
