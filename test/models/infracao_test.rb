require "test_helper"

class InfracaoTest < ActiveSupport::TestCase
  def setup
    # Usa um edital que já configurámos no ficheiro test/fixtures/editals.yml
    @edital = editals(:edital_autuacao)

    # Cria uma infração válida em memória para usar nos testes
    @infracao = Infracao.new(
      edital: @edital,
      placa: "ABC1234",
      data_infracao: "2026-09-15",
      auto_infracao: "PE000123",
      codigo_infracao: "7455-0",
      amparo_legal: "(Art. 218, Inciso I)",
      ano_notificacao: 2026,
      valor: nil # Pode ser nulo nas autuações, pois ainda não viraram penalidade
    )
  end

  test "deve ser válida com todos os atributos preenchidos corretamente" do
    assert @infracao.valid?
  end

  test "não deve salvar sem estar vinculada a um edital" do
    @infracao.edital = nil
    assert_not @infracao.valid?, "Salvou a infração solta, sem um edital associado"
    assert_includes @infracao.errors[:edital], "must exist"
  end

  test "não deve salvar sem a placa do veículo" do
    @infracao.placa = nil
    assert_not @infracao.valid?, "Salvou a infração sem informar a placa"
  end

  test "não deve salvar sem o número do auto de infração" do
    @infracao.auto_infracao = nil
    assert_not @infracao.valid?, "Salvou a infração sem o número do auto"
  end

  test "não deve salvar sem a data da infração" do
    @infracao.data_infracao = nil
    assert_not @infracao.valid?, "Salvou a infração sem a data"
  end
end