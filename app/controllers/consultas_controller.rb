# app/controllers/consultas_controller.rb
class ConsultasController < ApplicationController
  skip_before_action :authenticate_usuario!

  def index
    if params[:placa].present?
      @placa = params[:placa].upcase.strip
      # A lógica que estava na API passa para aqui:
      @infracoes = Infracao.includes(:edital).where(placa: @placa)
      @busca_realizada = true
    else
      @busca_realizada = false
    end
  end
end