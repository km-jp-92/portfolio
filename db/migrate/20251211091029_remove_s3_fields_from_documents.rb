class RemoveS3FieldsFromDocuments < ActiveRecord::Migration[7.2]
  def change
    remove_column :documents, :filename, :string
    remove_column :documents, :s3_key, :string
  end
end
