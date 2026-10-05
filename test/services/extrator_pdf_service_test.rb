require "test_helper"

class ExtratorPdfServiceTest < ActiveSupport::TestCase
  setup do
    # Carrega os editais que deixámos configurados no ficheiro editals.yml
    @edital_autuacao = editals(:edital_autuacao)
    @edital_penalidade = editals(:edital_penalidade)
  end

  test "deve extrair dados de autuação corretamente com Regex" do
    servico = ExtratorPdfService.new(@edital_autuacao)
    
    # Simulamos uma linha de texto lida do PDF
    texto_pdf_simulado = "INFRAÇÕES DETETADAS:\nABC1234/PE, 10/09/2026, PE999111, 7455-0(Art. 218, Inciso I)"
    
    # Usamos .send para testar o método privado diretamente
    assert_difference('Infracao.count', 1) do
      servico.send(:extrair_infracoes, texto_pdf_simulado)
    end
    
    infracao = Infracao.last
    assert_equal "ABC1234", infracao.placa
    assert_equal "PE999111", infracao.auto_infracao
    assert_equal "7455-0", infracao.codigo_infracao
    assert_equal "(Art. 218, Inciso I)", infracao.amparo_legal
    assert_nil infracao.valor # Autuação ainda não tem valor de multa
  end

  test "deve extrair dados de penalidade e formatar o valor monetário" do
    servico = ExtratorPdfService.new(@edital_penalidade)
    
    # Simulamos uma linha de texto lida do PDF de penalidade (que inclui o R$)
    texto_pdf_simulado = "DEF5678/PE, 12/09/2026, PE888222, 5000-0(Art. 257, § 8º), R$ 130,16"
    
    assert_difference('Infracao.count', 1) do
      servico.send(:extrair_infracoes, texto_pdf_simulado)
    end
    
    infracao = Infracao.last
    assert_equal "DEF5678", infracao.placa
    assert_equal "PE888222", infracao.auto_infracao
    assert_equal "(Art. 257, § 8º)", infracao.amparo_legal
    assert_equal 130.16, infracao.valor # O nosso código converte "130,16" para float corretamente
  end
end