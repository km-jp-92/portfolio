class PdfSyncChannel < ApplicationCable::Channel
  def subscribed
    document_group_id = params[:document_group_id]
    stream_from "pdf_sync_#{document_group_id}"
  end

  # 発表者がページ番号を変更したとき
  def page_changed(data)
    document_group_id = params[:document_group_id]
    ActionCable.server.broadcast("pdf_sync_#{document_group_id}", data)
  end

  # 聴講者が現在ページをリクエスト
  def request_current_page
    document_group_id = params[:document_group_id]
    ActionCable.server.broadcast("pdf_sync_#{document_group_id}", { request_page_for: true })
  end
end
