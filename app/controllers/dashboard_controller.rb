class DashboardController < ApplicationController
  layout false

  def index
    @equipamentos = Equipamento.where.not(latitude: nil, longitude: nil)
  end
end
