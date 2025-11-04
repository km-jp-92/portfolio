class CreateDocumentGroups < ActiveRecord::Migration[7.2]
  def change
    create_table :document_groups do |t|
      t.string :email, null: false
      t.string :password_digest, null: false
      t.string :token
      t.datetime :token_expires_at
      t.string :reset_token
      t.datetime :reset_token_expires_at
      t.string :upload_url
      t.datetime :upload_url_expires_at
      t.string :view_url
      t.datetime :view_url_expires_at

      t.timestamps
    end

    add_index :document_groups, :email
    add_index :document_groups, :token, unique: true
    add_index :document_groups, :reset_token, unique: true
  end
end
