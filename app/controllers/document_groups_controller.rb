class DocumentGroupsController < ApplicationController
  before_action :set_document_group_by_token, only: [ :create_password, :update_password ]

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
      create_url = create_password_document_group_url(token: @document_group.token)
      upload_url = documents_url(token: @document_group.upload_token)
      viewer_url = viewer_documents_url(token: @document_group.view_token)
      DocumentGroupMailer.password_setup(@document_group.email, create_url, upload_url, viewer_url).deliver_now
      redirect_to document_groups_confirmation_path
    else
      render :new, status: :unprocessable_entity
    end
  end

  def create_password
  end

  def update_password
    if @document_group.update(password_params)
      @document_group.update(token_used: true)
      redirect_to completed_path
    else
      render :create_password, status: :unprocessable_entity
    end
  end

  def confirmation
  end

  def invalid
  end

  def completed
  end

  private

  def set_document_group_by_token
    @document_group = DocumentGroup.find_by(token: params[:token])

    if @document_group.nil? || @document_group.token_expires_at < Time.current || @document_group.token_used
      redirect_to invalid_path
    end
  end

  def document_group_params
    params.require(:document_group).permit(:email)
  end

  def password_params
    params.require(:document_group).permit(:password, :password_confirmation)
  end
end
