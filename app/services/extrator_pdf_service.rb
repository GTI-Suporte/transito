class ExtratorPdfService
  def initialize(edital)
    @edital = edital
  end

  def call
    @edital.arquivo_pdf.open do |ficheiro_local|
      reader = PDF::Reader.new(ficheiro_local.path)
      reader.pages.each { |page| extrair_infracoes(page.text) }
    end
  end

  private

  def extrair_infracoes(texto)
    if @edital.tipo == 'penalidade'
      regex_penalidade = /(?<placa>[A-Z]{3}[0-9][A-Z0-9][0-9]{2})\/[A-Z]{2},\s*(?<data>\d{2}\/\d{2}\/\d{4}),\s*(?<auto>[A-Z]{2}\d+),\s*(?<codigo>\d{4}-\d)(?<amparo>\(.*?\))(?:.*?,\s*R\$\s*(?<valor>\d{1,3}(?:\.\d{3})*,\d{2}))?/i
      texto.scan(regex_penalidade) do |match|
        salvar_registro(match[0], match[1], match[2], match[3], match[4], match[5])
      end
    else
      regex_autuacao = /(?<placa>[A-Z]{3}[0-9][A-Z0-9][0-9]{2})\/[A-Z]{2},\s*(?<data>\d{2}\/\d{2}\/\d{4}),\s*(?<auto>[A-Z]{2}\d+),\s*(?<codigo>\d{4}-\d)(?<amparo>\(.*?\))/i
      texto.scan(regex_autuacao) do |match|
        salvar_registro(match[0], match[1], match[2], match[3], match[4], nil)
      end
    end
  end

  def salvar_registro(placa, data_str, auto, codigo, amparo, valor_str)
    data_formatada = Date.strptime(data_str, '%d/%m/%Y') rescue nil
    return unless data_formatada

    valor_formatado = nil
    if valor_str.present?
      valor_formatado = valor_str.tr('.', '').tr(',', '.').to_f
    end

    Infracao.create!(
      edital: @edital,
      placa: placa,
      data_infracao: data_formatada,
      auto_infracao: auto,
      codigo_infracao: codigo,
      amparo_legal: amparo,
      valor: valor_formatado,
      ano_notificacao: data_formatada.year
    )
  end
end