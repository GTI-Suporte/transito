class DashboardController < ApplicationController
  layout false

  skip_before_action :authenticate_usuario!

  def index
  end
end