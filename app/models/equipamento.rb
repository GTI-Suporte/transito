class Equipamento < ApplicationRecord
  TIPOS = [
    "Lombada Eletrônica",
    "Equipamento Misto",
    "Câmera Dome",
    "Rede Semafórica"
  ].freeze

  validates :identificacao, presence: true, uniqueness: true
  validates :endereco, presence: true
  validates :latitude, numericality: { in: -90.0..90.0 }, allow_nil: true
  validates :longitude, numericality: { in: -180.0..180.0 }, allow_nil: true
  validates :tipo, presence: true, inclusion: { in: TIPOS }
end
