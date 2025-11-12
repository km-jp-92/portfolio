class DocumentGroup < ApplicationRecord
  # パスワード暗号化機能を有効化
  has_secure_password

  # トークン自動生成
  has_secure_token :token

  # 新規トークン生成
  before_create :generate_upload_and_view_tokens

  # 関連づけ（1対多）
  has_many :documents, dependent: :destroy

  # バリデーション
  validates :email, presence: true
  validates :token, uniqueness: true, allow_nil: true
  validates :reset_token, uniqueness: true, allow_nil: true

  # 更新時にパスワード必須
  validate :password_presence_on_update, on: :update

  # 小文字英数字8文字以上のフォーマット
  validates :password, format: {
    with: /\A(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{10,}\z/,
    message: "は大文字英字、小文字英字、数字を含む10文字以上で入力してください"
  }, on: :update

  # 作成時にトークン有効期限を設定
  after_create :set_token_expiration

  private

  def set_token_expiration
    update_column(:token_expires_at, 1.hour.from_now)
  end

  def password_presence_on_update
    if password_digest.present? && password.blank?
      errors.add(:password, "を入力してください")
    end
  end

  def generate_upload_and_view_tokens
    self.upload_token = SecureRandom.uuid
    self.view_token   = SecureRandom.uuid

    self.upload_token_expires_at ||= 14.days.from_now
    self.view_token_expires_at   ||= 14.days.from_now
  end
end
