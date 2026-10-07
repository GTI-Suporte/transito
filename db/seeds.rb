admin = Usuario.find_or_initialize_by(email: "admin@der.pe.gov.br")

admin.nome = "Administrador"
admin.password = "Admin123!@#"
admin.password_confirmation = "Admin123!@#"
admin.admin = true
admin.ativo = true

admin.save!

load Rails.root.join("db/seeds/equipamentos.rb")