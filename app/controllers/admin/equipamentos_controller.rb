class Admin::EquipamentosController < Admin::BaseController
  before_action :set_equipamento, only: [:edit, :update, :destroy]

  def index
    @equipamentos = Equipamento.order(:identificacao)

    if params[:q].present?
      termos = params[:q].to_s.strip.split(/\s+/).reject(&:blank?)

      termos.each do |termo|
        termo_like = "%#{ActiveRecord::Base.sanitize_sql_like(termo)}%"

        @equipamentos = @equipamentos.where(
          <<~SQL.squish,
            identificacao ILIKE :termo
            OR endereco ILIKE :termo
            OR tipo ILIKE :termo
            OR CASE tipo
                 WHEN 'Câmera Dome' THEN 'Vídeo Monitoramento'
                 WHEN 'Equipamento Misto' THEN 'Semáforo com Fiscalização Integrada'
                 WHEN 'Rede Semafórica' THEN 'Semáforo'
                 ELSE tipo
               END ILIKE :termo
          SQL
          termo: termo_like
        )
      end
    end

    tipos = Array(params[:tipos]).reject(&:blank?)
    tipos = tipos & Equipamento::TIPOS

    @equipamentos =
      @equipamentos.where(tipo: tipos) if tipos.any?
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
      :tipo,
      :subtipo_semaforo
    )
  end
end