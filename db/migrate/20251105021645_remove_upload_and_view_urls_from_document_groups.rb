class RemoveUploadAndViewUrlsFromDocumentGroups < ActiveRecord::Migration[7.2]
  def change
    remove_column :document_groups, :upload_url, :string
    remove_column :document_groups, :upload_url_expires_at, :datetime
    remove_column :document_groups, :view_url, :string
    remove_column :document_groups, :view_url_expires_at, :datetime
  end
end
