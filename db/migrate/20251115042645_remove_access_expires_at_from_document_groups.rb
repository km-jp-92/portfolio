class RemoveAccessExpiresAtFromDocumentGroups < ActiveRecord::Migration[7.2]
  def change
    remove_column :document_groups, :access_expires_at, :datetime
  end
end
