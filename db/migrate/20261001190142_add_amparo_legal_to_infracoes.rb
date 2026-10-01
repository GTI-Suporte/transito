class AddAmparoLegalToInfracoes < ActiveRecord::Migration[8.1]
  def change
    add_column :infracoes, :amparo_legal, :string
  end
end
