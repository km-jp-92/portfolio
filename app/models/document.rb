class Document < ApplicationRecord
  belongs_to :document_group
  has_one_attached :file

  validate :file_presence_and_type

  private

  def file_presence_and_type
    if file.attached?
      unless file.content_type.in?(%w[application/pdf])
        errors.add(:file, "はPDFのみアップロード可能です")
      end
    else
      errors.add(:file, "を選択してください")
    end
  end
end
