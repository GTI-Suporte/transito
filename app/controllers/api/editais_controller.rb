# app/controllers/api/editais_controller.rb
class Api::EditaisController < ApplicationController
  # Desabilita a proteção CSRF e a autenticação do Devise para o teste via API
  skip_before_action :verify_authenticity_token
  skip_before_action :authenticate_usuario!

  def upload
    if params[:file].blank?
      return render json: { erro: 'Nenhum arquivo enviado.' }, status: :bad_request
    end

    # Cria o edital com os dados básicos
    edital = Edital.new(
      arquivo_nome: params[:file].original_filename,
      data_publicacao: Date.today,
      tipo: 'autuacao',
      arquivo_hash: Digest::SHA256.hexdigest(Time.now.to_s)
    )
    
    # Anexa o PDF vindo do Postman
    edital.arquivo_pdf.attach(params[:file])

    if edital.save
      # Chama o Service que criamos na Etapa 3
      ExtratorPdfService.new(edital).call

      render json: { 
        mensagem: 'Arquivo processado com sucesso!',
        total_infracoes_salvas: edital.infracoes.count,
        infracoes: edital.infracoes
      }, status: :ok
    else
      render json: { erros: edital.errors.full_messages }, status: :unprocessable_entity
    end
  end
end