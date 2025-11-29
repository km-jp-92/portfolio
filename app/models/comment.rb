class Comment < ApplicationRecord
  belongs_to :document_group

  validates :content, presence: true
end
