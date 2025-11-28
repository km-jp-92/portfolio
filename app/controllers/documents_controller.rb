class DocumentsController < ApplicationController
  before_action :set_document_group_by_upload_token, only: [ :index, :create, :destroy ]
  before_action :set_document_group_by_view_token,   only: [ :viewer, :viewer_json ]
  before_action :authenticate_group_password, only: [ :index, :create, :destroy ]
  before_action :check_documents_present, only: [ :viewer, :viewer_json ]
  before_action :authenticate_viewer_password, only: [ :viewer, :viewer_json ]

  def index
    @documents = @document_group.documents
      .joins(file_attachment: :blob)
      .order("active_storage_blobs.filename ASC")
    @document = Document.new
  end

  def create
    uploaded_files = document_params[:files] # 複数ファイル
    @documents = []
    @failed_documents = []

    if uploaded_files.present?
      uploaded_files.each do |uploaded_file|
        doc = @document_group.documents.new(file: uploaded_file)
        if doc.save
          @documents << doc
        else
          @failed_documents << doc
        end
      end

      if @documents.any?
        flash[:notice] = "アップロードしました"
        redirect_to documents_path(token: @document_group.upload_token)
      else
        flash.now[:alert] = "アップロードに失敗しました"
        @document = @failed_documents.first || Document.new
        @documents = @document_group.documents.reload
        render :index, status: :unprocessable_entity
      end
    else
      flash.now[:alert] = "ファイルを選択してください"
      @document = Document.new
      @documents = @document_group.documents.reload
      render :index, status: :unprocessable_entity
    end
  end

  def destroy
    @document = @document_group.documents.find(params[:id])
    @document.file.purge if @document.file.attached?
    @document.destroy
    flash[:notice] = "削除しました"
    redirect_to documents_path(token: @document_group.upload_token)
  end

  def viewer
  end

  def viewer_json
    @documents = Document
      .joins(file_attachment: :blob)
      .where(document_group_id: @document_group.id)
      .order("active_storage_blobs.filename ASC")
    @document = if params[:document_id]
                  @document_group.documents.find(params[:document_id])
    else
                  @documents.first
    end

    render json: {
    documentGroupId: @document_group.id,
    viewToken: @document_group.view_token,
    currentDocumentId: @document.id,
    documents: @documents.map { |doc|
      {
        id: doc.id,
        name: doc.file.filename.to_s,
        url: url_for(doc.file)
      }
    }
  }
  end

  private

  def set_document_group_by_upload_token
    @document_group = DocumentGroup.find_by!(upload_token: params[:token])
    if @document_group.upload_token_expires_at&.< Time.current
      redirect_to invalid_path
    end
  end

  def set_document_group_by_view_token
    @document_group = DocumentGroup.find_by!(view_token: params[:token])
    if @document_group.view_token_expires_at&.< Time.current
      redirect_to invalid_path
    end
  end

  def check_documents_present
    if @document_group.documents.empty?
      render :no_documents
    end
  end

  # パスワード認証
  def authenticate_group_password
    if session[:authenticated_document_group_id] == @document_group.id
      # すでに認証済み
      return true
    end

    if params[:password] && @document_group.authenticate(params[:password])
      # 認証成功
      session[:authenticated_document_group_id] = @document_group.id
      redirect_to documents_path(token: @document_group.upload_token)
    else
      # 認証フォーム表示
      if params.key?(:password)
        if params[:password].blank?
          @error = "パスワードを入力してください"
        elsif !@document_group.authenticate(params[:password])
          @error = "パスワードが違います"
        end
      end

      render :password_form, status: :unprocessable_entity
    end
  end

  def authenticate_viewer_password
    if session[:authenticated_viewer_group_id] == @document_group.id
      return true
    end

    if params[:password] && @document_group.authenticate(params[:password])
      session[:authenticated_viewer_group_id] = @document_group.id
      redirect_to viewer_documents_path(token: @document_group.view_token)
    else
      if params.key?(:password)
        if params[:password].blank?
          @error = "パスワードを入力してください"
        elsif !@document_group.authenticate(params[:password])
          @error = "パスワードが違います"
        end
      end

      render :viewer_password_form, status: :unprocessable_entity
    end
  end

  def document_params
    params.require(:document).permit(files: [])
  end
end
