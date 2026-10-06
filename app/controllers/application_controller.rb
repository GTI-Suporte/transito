class ApplicationController < ActionController::Base
  before_action :authenticate_usuario!
  protected

  # Diz ao Devise para onde ir após o login
  def after_sign_in_path_for(resource)
    if resource.is_a?(Usuario) && resource.admin?
      admin_menu_index_path # Redireciona para o Menu Admin
    else
      root_path # Redireciona para o dashboard público se não for admin
    end
  end

end