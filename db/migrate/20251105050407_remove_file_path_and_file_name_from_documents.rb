class RemoveFilePathAndFileNameFromDocuments < ActiveRecord::Migration[7.2]
  def change
    remove_column :documents, :file_path, :string
    remove_column :documents, :file_name, :string
  end
end
