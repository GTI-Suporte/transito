Rails.application.routes.draw do
  root "dashboard#index"
  get "dashboard/index"

  # Login do administrador
  devise_for :usuarios,
             path: "admin",
             path_names: {
               sign_in: "login"
             },
             skip: [:registrations]

  # Área administrativa
  namespace :admin do
    resources :equipamentos
  end

  # API pública usada pelo dashboard e sistema de editais
  namespace :api do
    resources :equipamentos, only: [:index, :show]
    post 'editais/upload', to: 'editais#upload'
    get 'infracoes/:placa', to: 'infracoes#consulta'
  end

  # Health check do Rails
  get "up" => "rails/health#show", as: :rails_health_check
end