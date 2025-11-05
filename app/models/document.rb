class Document < ApplicationRecord
  belongs_to :document_group
  has_one_attached :file

  validate :file_type_validation

  private

  def file_type_validation
    if file.attached? && !file.content_type.in?(%w(application/pdf))
      errors.add(:file, "はPDFのみアップロード可能です")
    elsif !file.attached?
      errors.add(:file, "を選択してください")
    end
  end
end
