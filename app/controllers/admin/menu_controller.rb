class Admin::MenuController < ApplicationController
  before_action :authenticate_usuario!

  def index
    # Página de menu principal do admin
  end
end