class DashboardController < ApplicationController
  layout false

  skip_before_action :authenticate_usuario!

  def index
    redirect_to mapa_fiscalizacao_path
  end

  def fiscalizacao
  end

  def semaforo
  end
end