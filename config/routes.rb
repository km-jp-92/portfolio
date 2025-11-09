Rails.application.routes.draw do
  root "document_groups#new"
  resources :document_groups, only: [ :new, :create ] do
    # グループに紐づくPDF（アップロード・閲覧・削除）
    resources :documents, only: [ :index, :create, :destroy ]
    get  "viewer", to: "documents#viewer", as: :viewer
    post "viewer", to: "documents#viewer"
  end

  # パスワード設定用
  get "/document_groups/password/edit/:token",   to: "document_groups#edit_password",   as: "edit_password_document_group"
  patch "/document_groups/password/update/:token", to: "document_groups#update_password", as: "update_password_document_group"

  # 固定ページ
  get "document_groups/confirmation", to: "document_groups#confirmation", as: :document_groups_confirmation
  

  mount LetterOpenerWeb::Engine, at: "/letter_opener" if Rails.env.development?

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
