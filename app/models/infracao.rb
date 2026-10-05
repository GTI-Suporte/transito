class Infracao < ApplicationRecord
  self.table_name = 'infracoes'
  
  belongs_to :edital

  # Adicionámos a data e o auto aqui na regra de presença
  validates :placa, :data_infracao, :auto_infracao, presence: true
  
  before_validation :formatar_placa

  private

  def formatar_placa
    self.placa = placa.upcase.strip if placa.present?
  end
end