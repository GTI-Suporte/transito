# app/models/edital.rb
class Edital < ApplicationRecord
  has_many :infracoes, dependent: :destroy
  
  # Permite o upload e download do ficheiro PDF
  has_one_attached :arquivo_pdf

  validates :arquivo_nome, :data_publicacao, :tipo, :arquivo_hash, presence: true
  validates :arquivo_hash, uniqueness: true
end