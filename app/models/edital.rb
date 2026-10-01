# app/models/edital.rb
class Edital < ApplicationRecord
  has_many :infracoes, class_name: 'Infracao', dependent: :destroy
  
  has_one_attached :arquivo_pdf 

  validates :arquivo_nome, :data_publicacao, :tipo, :arquivo_hash, presence: true
  validates :arquivo_hash, uniqueness: true
end