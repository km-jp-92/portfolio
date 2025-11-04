class DocumentGroup < ApplicationRecord
  # パスワード暗号化機能を有効化
  has_secure_password

  # 関連づけ（1対多）
  has_many :documents, dependent: :destroy

  # バリデーション
  validates :email, presence: true
  validates :token, uniqueness: true, allow_nil: true
  validates :reset_token, uniqueness: true, allow_nil: true

  # トークン自動生成
  before_create :generate_token

  private

  def generate_token
    self.token = SecureRandom.urlsafe_base64
    self.token_expires_at = 1.hour.from_now
  end
end
