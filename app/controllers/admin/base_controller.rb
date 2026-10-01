class Admin::BaseController < ApplicationController
  before_action :authenticate_usuario!
  before_action :require_admin!

  private

  def require_admin!
    return if current_usuario.admin?

    redirect_to root_path, alert: "Acesso não autorizado."
  end
end