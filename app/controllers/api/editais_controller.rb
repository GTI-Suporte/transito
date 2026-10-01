# app/controllers/api/editais_controller.rb
class Api::EditaisController < ApplicationController
  skip_before_action :verify_authenticity_token
  skip_before_action :authenticate_usuario!

  def upload
    if params[:file].blank?
      return render json: { erro: 'Nenhum arquivo enviado.' }, status: :bad_request
    end

    tipo_edital = params[:tipo].presence || 'autuacao'
    
    # Captura a data enviada na requisição (ou usa a data de hoje como fallback de segurança)
    data_informada = params[:data_publicacao].presence || Date.today

    hash_real_do_arquivo = Digest::SHA256.file(params[:file].tempfile).hexdigest

    edital = Edital.new(
      arquivo_nome: params[:file].original_filename,
      data_publicacao: data_informada,
      tipo: tipo_edital,
      arquivo_hash: hash_real_do_arquivo
    )
    
    edital.arquivo_pdf.attach(params[:file])

    if edital.save
      ExtratorPdfService.new(edital).call

      render json: { 
        mensagem: 'Arquivo processado com sucesso!',
        tipo_salvo: edital.tipo,
        data_salva: edital.data_publicacao,
        total_infracoes_salvas: edital.infracoes.count,
        infracoes: edital.infracoes
      }, status: :ok
    else
      render json: { erros: edital.errors.full_messages }, status: :unprocessable_entity
    end
  end
end