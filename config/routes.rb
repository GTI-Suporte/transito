Rails.application.routes.draw do
  root "dashboard#fiscalizacao"

  get "consulta", to: "consultas#index"

  get "dashboard", to: "dashboard#fiscalizacao"

  get "mapa-fiscalizacao",
      to: "dashboard#fiscalizacao",
      as: :mapa_fiscalizacao

  get "mapa-semaforo",
      to: "dashboard#semaforo",
      as: :mapa_semaforo

  # Login do administrador
  devise_for :usuarios,
             path: "admin",
             path_names: {
               sign_in: "login"
             },
             skip: [:registrations]

  namespace :admin do
    resources :menu, only: [:index]
    resources :equipamentos
    resources :editais, only: [:index, :create, :destroy]
  end

  namespace :api do
    resources :equipamentos, only: [:index, :show]
    resources :infracoes, only: [:index, :show]
  end

  get "up" => "rails/health#show", as: :rails_health_check
end