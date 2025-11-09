class DocumentsController < ApplicationController
  before_action :set_document_group
  before_action :authenticate_group_password, only: [ :index, :create, :destroy ]
  before_action :check_documents_present, only: [:viewer]
  before_action :authenticate_viewer_password, only: [:viewer]

  def index
    @documents = @document_group.documents
    @document = Document.new
  end

  def create
    uploaded_files = document_params[:files] # 複数ファイル
    @documents = []

    if uploaded_files.present?
      uploaded_files.each do |uploaded_file|
        doc = @document_group.documents.new(file: uploaded_file)
        @documents << doc if doc.save
      end

      if @documents.any?
        flash[:notice] = "PDFをアップロードしました"
        redirect_to document_group_documents_path(@document_group)
      else
        flash.now[:alert] = "アップロードに失敗しました"
        @document = Document.new
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
    @document.destroy
    flash[:notice] = "PDFを削除しました"
    redirect_to document_group_documents_path(@document_group)
  end

  def viewer
    @documents = Document
      .joins(file_attachment: :blob)
      .where(document_group_id: @document_group.id)
      .order("active_storage_blobs.filename ASC")
    @document = if params[:document_id]
                  @document_group.documents.find(params[:document_id])
    else
                  @documents.first
    end
  end

  private

  def set_document_group
    @document_group = DocumentGroup.find(params[:document_group_id])
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
      redirect_to document_group_documents_path(@document_group)
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
      redirect_to document_group_viewer_path(@document_group)
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
