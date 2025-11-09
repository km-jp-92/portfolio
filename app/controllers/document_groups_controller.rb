class DocumentGroupsController < ApplicationController
  before_action :set_document_group_by_token, only: [ :edit_password, :update_password ]

  def new
    @document_group = DocumentGroup.new
  end

  def create
    @document_group = DocumentGroup.new(document_group_params)

    # 仮パスワードを自動生成
    dummy_password = SecureRandom.hex(12)
    @document_group.password = dummy_password
    @document_group.password_confirmation = dummy_password

    if @document_group.save
      # トークン付きURL生成
      edit_url = edit_password_document_group_url(token: @document_group.token)
      upload_url = document_group_documents_url(@document_group)
      viewer_url = document_group_viewer_url(@document_group)
      DocumentGroupMailer.password_setup(@document_group.email, edit_url, upload_url, viewer_url).deliver_now
      redirect_to document_groups_confirmation_path
    else
      flash.now[:alert] = "メールアドレスの保存に失敗しました。"
      render :new, status: :unprocessable_entity
    end
  end

  def edit_password
    if @document_group.nil? || @document_group.token_expires_at < Time.current
      redirect_to root_path, alert: "リンクが無効です"
    end
    # ビューで @document_group を使ってフォーム表示
  end

  def update_password
    if @document_group.update(password_params)
      redirect_to root_path, notice: "パスワードを設定しました"
    else
      render :edit_password, status: :unprocessable_entity
    end
  end

  def confirmation
  end

  private

  def set_document_group_by_token
    @document_group = DocumentGroup.find_by(token: params[:token])
  end

  def document_group_params
    params.require(:document_group).permit(:email)
  end

  def password_params
    params.require(:document_group).permit(:password, :password_confirmation)
  end
end
