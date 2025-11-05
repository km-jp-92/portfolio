class AddAccessExpiresAtToDocumentGroups < ActiveRecord::Migration[7.2]
  def change
    add_column :document_groups, :access_expires_at, :datetime
  end
end
