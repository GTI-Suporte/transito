class Equipamento < ApplicationRecord
  validates :identificacao, presence: true, uniqueness: true
  validates :endereco, presence: true
  validates :latitude, presence: true
  validates :longitude, presence: true
  validates :tipo, presence: true
end
