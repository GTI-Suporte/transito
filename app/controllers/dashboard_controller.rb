class DashboardController < ApplicationController
    skip_before_action :authenticate_usuario!
    layout :false, only: [:dashboard]
  def index
  end
end
