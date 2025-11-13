class AddGroupCodeToDocumentGroups < ActiveRecord::Migration[7.2]
  def change
    add_column :document_groups, :group_code, :string
    add_index :document_groups, :group_code, unique: true
  end
end
