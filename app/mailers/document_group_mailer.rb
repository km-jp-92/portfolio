class DocumentGroupMailer < ApplicationMailer
  def password_setup(document_group)
    @document_group = document_group
    @new_url = new_document_group_password_url(token: @document_group.token)
    @upload_url = documents_url(token: @document_group.upload_token)
    @viewer_url = viewer_documents_url(token: @document_group.view_token)
    @group_code = @document_group.group_code

    mail(to: @document_group.email, subject: "資料グループURLのご案内")
  end
end
