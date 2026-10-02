Rails.application.routes.draw do
 
  get "consulta", to: "consultas#index"
  get "dashboard", to: "dashboard#index"

  # Login do administrador
  devise_for :usuarios,
             path: "admin",
             path_names: {
               sign_in: "login"
             },
             skip: [:registrations]

  # Área administrativa (Gera o admin_edital_path, admin_equipamentos_path, etc)
  namespace :admin do
    resources :equipamentos
    resources :editais, only: [:index, :create, :destroy]
  end

  # API pública usada pelo dashboard e sistema de editais
  namespace :api do
    resources :equipamentos, only: [:index, :show]
    post "editais/upload", to: "editais#upload"
    get "infracoes/:placa", to: "infracoes#consulta"
  end

  # Health check do Rails
  get "up" => "rails/health#show", as: :rails_health_check
end
