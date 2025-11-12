class AddUploadAndViewTokenExpirationsToDocumentGroups < ActiveRecord::Migration[7.2]
  def change
    add_column :document_groups, :upload_token, :string
    add_column :document_groups, :view_token, :string
    add_column :document_groups, :upload_token_expires_at, :datetime
    add_column :document_groups, :view_token_expires_at, :datetime

    add_index :document_groups, :upload_token, unique: true
    add_index :document_groups, :view_token, unique: true
  end
end
