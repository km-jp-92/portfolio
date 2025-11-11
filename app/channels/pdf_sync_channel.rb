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

  # 聴講者が現在ページをリクエスト
  def request_current_page
    pdf_id = params[:pdf_id]
    ActionCable.server.broadcast("pdf_sync_#{pdf_id}", { "request_page_for" => true })
  end
end
