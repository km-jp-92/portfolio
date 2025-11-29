class CommentChannel < ApplicationCable::Channel
  def subscribed
    if params[:document_group_id].present?
      @document_group_id = params[:document_group_id]
      group = DocumentGroup.find(@document_group_id)
      stream_for group
    else
      reject # IDがなければ接続を拒否
    end
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end

  def create(data)
    group = DocumentGroup.find(@document_group_id)
    comment = group.comments.create!(
      content: data["content"],
      likes_count: 0
    )
    # 作成されたコメントを全員に送信
    CommentChannel.broadcast_to(group, {
      action: "create",
      comment: {
        id: comment.id,
        content: comment.content,
        likes_count: comment.likes_count,
        created_at: comment.created_at.strftime("%Y-%m-%d %H:%M:%S")
      }
    })
  end

  # いいね更新
  def like(data)
    comment = Comment.find(data["id"])
    comment.increment!(:likes_count)
    CommentChannel.broadcast_to(comment.document_group, {
      action: "update_like",
      comment_id: comment.id,
      likes_count: comment.likes_count
    })
  end
end
