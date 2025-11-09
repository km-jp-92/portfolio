class AddTokenUsedToDocumentGroups < ActiveRecord::Migration[7.2]
  def change
    add_column :document_groups, :token_used, :boolean, default: false, null: false
  end
end
