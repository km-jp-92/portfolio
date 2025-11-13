class PasswordResetMailer < ApplicationMailer
  def send_reset_email(document_group)
    @document_group = document_group
    @token = @document_group.generate_reset_token!
    @reset_url = edit_document_group_password_reset_url(reset_token: @token)

    mail(
      to: @document_group.email,
      subject: "パスワード再設定のご案内"
    )
  end
end
