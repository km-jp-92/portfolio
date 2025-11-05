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
      DocumentGroupMailer.password_setup(@document_group.email, edit_url).deliver_now
      flash[:notice] = "メールをご確認ください。"
      redirect_to root_path
    else
      flash.now[:alert] = "メールアドレスの保存に失敗しました。"
      render :new
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
      render :edit_password
    end
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
