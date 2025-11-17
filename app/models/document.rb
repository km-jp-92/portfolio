class Document < ApplicationRecord
  belongs_to :document_group
  has_one_attached :file

  validate :file_presence_type_and_size

  validate :safe_filename

  private

  def file_presence_type_and_size
    if file.attached?
      unless file.content_type.in?(%w[application/pdf])
        errors.add(:file, "はPDFのみアップロード可能です")
      end

      if file.blob.byte_size > 20.megabytes
        errors.add(:file, "は20MB以下にしてください")
      end
    else
      errors.add(:file, "を選択してください")
    end
  end

  def safe_filename
    if file.attached?
      filename = file.filename.to_s
      if filename =~ /[<>\/\\]/
        errors.add(:file, "ファイル名に不正な文字が含まれています")
      end
    end
  end
end
