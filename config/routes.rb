Rails.application.routes.draw do
  devise_for :usuarios
  namespace :api do
    post 'editais/upload', to: 'editais#upload'
  end
  get "up" => "rails/health#show", as: :rails_health_check

end
