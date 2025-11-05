Rails.application.routes.draw do
  root "document_groups#new"
  resources :document_groups, only: [ :new, :create ] do
    # パスワード設定ページ（トークンでアクセス）
    get "password/edit/:token", to: "document_groups#edit_password", as: :edit_password
    patch "password/update/:token", to: "document_groups#update_password", as: :update_password

    # グループに紐づくPDF（アップロード・閲覧・削除）
    resources :documents, only: [ :index, :create, :destroy ]
    get "viewer", to: "documents#viewer"
  end

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/*
  get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
  get "manifest" => "rails/pwa#manifest", as: :pwa_manifest

  # Defines the root path route ("/")
  # root "posts#index"
end
