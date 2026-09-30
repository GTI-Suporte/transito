class AddAdminToUsuarios < ActiveRecord::Migration[8.1]
  def change
    add_column :usuarios, :admin, :boolean, default: false
  end
end
