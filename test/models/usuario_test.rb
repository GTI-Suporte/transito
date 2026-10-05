require "test_helper"

class UsuarioTest < ActiveSupport::TestCase
  def setup
    @usuario = Usuario.new(
      nome: "Novo Administrador",
      email: "admin_novo@der.pe.gov.br",
      password: "senha_segura_123",
      password_confirmation: "senha_segura_123",
      ativo: true
    )
  end

  test "deve ser válido com todos os atributos preenchidos" do
    assert @usuario.valid?
  end

  test "não deve salvar sem nome" do
    @usuario.nome = nil
    assert_not @usuario.valid?
    assert_includes @usuario.errors[:nome], "can't be blank"
  end

  test "utilizador inativo não deve conseguir autenticar-se" do
    @usuario.ativo = false
    assert_not @usuario.active_for_authentication?, "Utilizador desativado conseguiu autenticar-se"
  end
end