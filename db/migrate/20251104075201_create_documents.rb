class CreateDocuments < ActiveRecord::Migration[7.2]
  def change
    create_table :documents do |t|
      t.references :document_group, null: false, foreign_key: { on_delete: :cascade }
      t.string :file_path, null: false
      t.string :file_name, null: false

      t.timestamps
    end
  end
end
