class DocumentGroupMailer < ApplicationMailer
  def password_setup(email, create_url, upload_url, viewer_url)
    @create_url = create_url
    @upload_url = upload_url
    @viewer_url = viewer_url
    mail(to: email, subject: "資料グループURLのご案内")
  end
end
