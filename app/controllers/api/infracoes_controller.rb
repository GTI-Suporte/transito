# app/controllers/api/infracoes_controller.rb
class Api::InfracoesController < ApplicationController
  # Como é o portal do cidadão, não exige login do Devise
  skip_before_action :authenticate_usuario!

  def consulta
    placa = params[:placa]&.upcase&.strip

    if placa.blank?
      return render json: { erro: 'Placa não informada.' }, status: :bad_request
    end

    # Busca as infrações atreladas à placa
    infracoes = Infracao.includes(:edital).where(placa: placa)

    if infracoes.any?
      # Retorna as infrações e anexa os dados do edital pai (tipo, data, etc)
      render json: infracoes.as_json(
        include: {
          edital: { only: [:tipo, :data_publicacao, :arquivo_nome] }
        }
      ), status: :ok
    else
      render json: { mensagem: 'Nada consta para a placa informada.' }, status: :not_found
    end
  end
end
