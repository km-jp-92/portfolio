class DocumentGroupMailer < ApplicationMailer
  require "rqrcode"
  require "base64"

  def password_setup(document_group)
    @document_group = document_group
    @new_url = new_document_group_password_url(token: @document_group.token)
    @upload_url = documents_url(token: @document_group.upload_token)
    @viewer_url = viewer_documents_url(token: @document_group.view_token)
    @group_code = @document_group.group_code

    # QRコード生成
    qrcode = RQRCode::QRCode.new(@viewer_url)
    svg = qrcode.as_svg(module_size: 6, standalone: true)
    @viewer_qr_base64 = Base64.strict_encode64(svg)

    mail(to: @document_group.email, subject: "PDF同期サービス：パスワード設定とPDFリンクのご案内")
  end
end
