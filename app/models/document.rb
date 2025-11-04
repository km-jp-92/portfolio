class Document < ApplicationRecord
  belongs_to :document_group

  validates :file_path, presence: true
  validates :file_name, presence: true
end
