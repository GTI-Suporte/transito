require "test_helper"

class EditalTest < ActiveSupport::TestCase
  def setup
    @edital = Edital.new(
      arquivo_nome: "diario_oficial_123.pdf",
      data_publicacao: Date.today,
      tipo: "autuacao",
      arquivo_hash: "hash_unico_abc123"
    )
  end

  test "deve ser válido com todos os atributos preenchidos corretamente" do
    assert @edital.valid?
  end

  test "não deve salvar sem arquivo_nome" do
    @edital.arquivo_nome = nil
    assert_not @edital.valid?, "Salvou o edital sem nome de ficheiro"
  end

  test "não deve salvar sem data_publicacao" do
    @edital.data_publicacao = nil
    assert_not @edital.valid?, "Salvou o edital sem data de publicação"
  end

  test "não deve salvar sem tipo" do
    @edital.tipo = nil
    assert_not @edital.valid?, "Salvou o edital sem especificar o tipo"
  end

  test "não deve salvar com um arquivo_hash já existente (uniqueness)" do
    @edital.save!
    edital_duplicado = @edital.dup
    
    assert_not edital_duplicado.valid?
    assert_includes edital_duplicado.errors[:arquivo_hash], "has already been taken"
  end

  test "deve apagar as infrações em cascata quando o edital for apagado" do
    @edital.save!
    
    @edital.infracoes.create!(
      placa: "ABC1234",
      data_infracao: Date.today,
      auto_infracao: "PE99999",
      codigo_infracao: "7455-0",
      ano_notificacao: Date.today.year
    )

    assert_difference('Infracao.count', -1) do
      @edital.destroy
    end
  end
end