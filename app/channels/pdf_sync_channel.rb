class PdfSyncChannel < ApplicationCable::Channel
  def subscribed
    # PDFごとにストリームを分ける
    pdf_id = params[:pdf_id]
    stream_from "pdf_sync_#{pdf_id}"
  end

  # 発表者がページ番号を変更したとき
  def page_changed(data)
    # data = { page: 2 }
    pdf_id = params[:pdf_id]
    ActionCable.server.broadcast("pdf_sync_#{pdf_id}", data)
  end

  # 発表者がPDFを切り替えたとき（通知用）
  def pdf_changed_notification(data)
    # data = { url: "新しいPDFのURL" }
    pdf_id = params[:pdf_id]
    ActionCable.server.broadcast("pdf_sync_#{pdf_id}", { pdf_changed: data })
  end
end
