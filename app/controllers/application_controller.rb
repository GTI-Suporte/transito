class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  # Changes to the importmap will invalidate the etag for HTML responses
  stale_when_importmap_changes

  def require_admin
    unless usuario_signed_in? && current_usuario.admin?
      redirect_to root_path, alert: "Acesso restrito para administradores."
    end
  end
end
