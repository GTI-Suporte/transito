class DashboardController < ApplicationController
  skip_before_action :authenticate_usuario!
  def index
  end
end
