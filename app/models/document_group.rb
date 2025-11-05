class DocumentGroup < ApplicationRecord
  # パスワード暗号化機能を有効化
  has_secure_password

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
    with: /\A(?=.*[a-z])(?=.*\d)[a-z\d]{8,}\z/, 
    message: "は小文字英字と数字を含む8文字以上で入力してください" 
  }, on: :update

  # トークン自動生成
  before_create :generate_token

  private

  def generate_token
    self.token = SecureRandom.urlsafe_base64
    self.token_expires_at = 1.hour.from_now
  end

  def password_presence_on_update
    if password_digest.present? && password.blank?
      errors.add(:password, "を入力してください")
    end
  end
end
