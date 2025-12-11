class AddS3FieldsToDocuments < ActiveRecord::Migration[7.2]
  def change
    add_column :documents, :filename, :string
    add_column :documents, :s3_key, :string
  end
end
