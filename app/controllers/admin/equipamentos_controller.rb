class Admin::EquipamentosController < Admin::BaseController
  before_action :set_equipamento, only: [:edit, :update, :destroy]

  def index
    @equipamentos = Equipamento.order(:identificacao)
  end

  def new
    @equipamento = Equipamento.new
  end

  def create
    @equipamento = Equipamento.new(equipamento_params)

    if @equipamento.save
      redirect_to admin_equipamentos_path,
                  notice: "Equipamento criado com sucesso."
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
  end

  def update
    if @equipamento.update(equipamento_params)
      redirect_to admin_equipamentos_path,
                  notice: "Equipamento atualizado com sucesso."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @equipamento.destroy

    redirect_to admin_equipamentos_path,
                notice: "Equipamento excluído com sucesso."
  end

  private

  def set_equipamento
    @equipamento = Equipamento.find(params[:id])
  end

  def equipamento_params
    params.require(:equipamento).permit(
      :identificacao,
      :endereco,
      :latitude,
      :longitude,
      :tipo
    )
  end
end
