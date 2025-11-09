class DocumentGroupMailer < ApplicationMailer
  def password_setup(email, edit_url, upload_url, viewer_url)
    @edit_url = edit_url
    @upload_url = upload_url
    @viewer_url = viewer_url
    mail(to: email, subject: "資料グループURLのご案内")
  end
end
