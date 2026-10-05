admin = Usuario.find_or_initialize_by(email: "admin@der.pe.gov.br")

if admin.new_record?
  admin.password = "SenhaSegura123!"
  admin.password_confirmation = "SenhaSegura123!"
end

admin.admin = true
admin.save!

load Rails.root.join("db/seeds/equipamentos.rb")
