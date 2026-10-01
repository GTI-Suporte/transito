# app/models/infracao.rb
class Infracao < ApplicationRecord
  self.table_name = 'infracoes'
  
  belongs_to :edital

  validates :placa, presence: true
  
  before_validation :formatar_placa

  private

  def formatar_placa
    self.placa = placa.upcase.strip if placa.present?
  end
end