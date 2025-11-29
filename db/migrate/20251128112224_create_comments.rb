class CreateComments < ActiveRecord::Migration[7.2]
  def change
    create_table :comments do |t|
      t.references :document_group, null: false, foreign_key: { on_delete: :cascade }
      t.text    :content, null: false
      t.integer :likes_count, default: 0, null: false

      t.timestamps
    end
  end
end
