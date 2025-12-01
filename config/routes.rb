Rails.application.routes.draw do
  root "document_groups#new"
  resources :document_groups, only: [ :new, :create ]

  get  "/documents/:token", to: "documents#index",  as: :documents
  post "/documents/:token", to: "documents#create"
  delete "/documents/:token/:id", to: "documents#destroy", as: :destroy_document

  get  "/documents/viewer/:token", to: "documents#viewer", as: :viewer_documents
  post "/documents/viewer/:token", to: "documents#viewer"

  get  "/documents/viewer/:token/json", to: "documents#viewer_json",  as: :viewer_documents_json
  post "/documents/viewer/:token/format_memo", to: "documents#format_memo"

  # パスワード設定用
  get   "/document_groups/password/:token", to: "document_groups#new_password", as: :new_document_group_password
  patch "/document_groups/password/:token", to: "document_groups#update_password", as: :document_group_password

  # パスワード再設定リクエスト
  get  "/document_groups/password_resets", to: "document_groups#request_password_reset_form", as: :new_document_group_password_reset
  post "/document_groups/password_resets",     to: "document_groups#request_password_reset",      as: :document_group_password_resets

  # パスワード再設定
  get   "/document_groups/password_resets/:reset_token", to: "document_groups#password_reset_form", as: :edit_document_group_password_reset
  patch "/document_groups/password_resets/:reset_token",      to: "document_groups#password_reset",      as: :update_document_group_password_reset

  # 固定ページ
  get "document_groups/confirmation", to: "document_groups#confirmation", as: :document_groups_confirmation
  get "document_groups/invalid", to: "document_groups#invalid", as: :invalid
  get "document_groups/completed", to: "document_groups#completed", as: :completed

  # プライバシーポリシー・利用規約
  get "privacy", to: "pages#privacy"
  get "terms",   to: "pages#terms"

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
