class Usuario < ApplicationRecord
  devise :database_authenticatable, :recoverable, :rememberable, :validatable

  validates :nome, presence: true

  # Impede utilizadores desativados de fazerem login
  def active_for_authentication?
    super && ativo?
  end
end