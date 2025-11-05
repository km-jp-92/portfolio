class DocumentGroupMailer < ApplicationMailer
  def password_setup(email, edit_url)
    @edit_url = edit_url
    mail(to: email, subject: "パスワード設定のご案内")
  end
end
