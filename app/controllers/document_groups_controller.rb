class DocumentGroupsController < ApplicationController
  before_action :set_document_group_by_token, only: [ :new_password, :update_password ]
  before_action :set_document_group_by_reset_token, only: [ :password_reset_form, :password_reset ]

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
      DocumentGroupMailer.password_setup(@document_group).deliver_now
      redirect_to document_groups_confirmation_path
    else
      render :new, status: :unprocessable_entity
    end
  end

  def new_password
  end

  def update_password
    if @document_group.update(password_params)
      @document_group.update(token: nil)
      redirect_to completed_path
    else
      render :new_password, status: :unprocessable_entity
    end
  end

  def password_reset_form
  end

  def password_reset
    if @document_group.update(password_params)
      @document_group.update(reset_token: nil, reset_token_expires_at: nil)
      redirect_to completed_path
    else
      render :password_reset_form, status: :unprocessable_entity
    end
  end

  def confirmation
  end

  def invalid
  end

  def completed
  end

  def request_password_reset_form
  end

  def request_password_reset
    @document_group = DocumentGroup.find_by(email: params[:email], group_code: params[:group_code])

    if @document_group
      PasswordResetMailer.send_reset_email(@document_group).deliver_now
      redirect_to document_groups_confirmation_path
    else
      flash.now[:alert] = "入力内容が正しくありません"
      render :request_password_reset_form, status: :unprocessable_entity
    end
  end

  private

  def set_document_group_by_token
    @document_group = DocumentGroup.find_by(token: params[:token])

    if @document_group.nil? || @document_group.token_expires_at < Time.current
      redirect_to invalid_path
    end
  end

  def set_document_group_by_reset_token
    @document_group = DocumentGroup.find_by(reset_token: params[:reset_token])

    if @document_group.nil? || @document_group.reset_token_expired?
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
