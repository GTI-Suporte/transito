class Api::EquipamentosController < ApplicationController
  skip_before_action :authenticate_usuario!

  def index
    equipamentos = Equipamento.order(:identificacao)
    render json: equipamentos.map { |equipamento| serialize(equipamento) }
  end

  def show
    equipamento = Equipamento.find(params[:id])
    render json: serialize(equipamento)
  end

  private

  def serialize(equipamento)
    {
  id: equipamento.identificacao,
  address: equipamento.endereco,
  lat: equipamento.latitude,
  lng: equipamento.longitude,
  type: equipamento.tipo,
  subtipo_semaforo: equipamento.subtipo_semaforo
}
  end
end
