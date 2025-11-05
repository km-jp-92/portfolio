class DocumentGroupsController < ApplicationController
  def new
    @document_group = DocumentGroup.new
  end

  def create
    @document_group = DocumentGroup.new(document_group_params)
    
    if @document_group.save
      # ここで後でメール送信処理を追加できます
      flash[:notice] = "メールアドレスを保存しました。"
      redirect_to root_path
    else
      flash.now[:alert] = "メールアドレスの保存に失敗しました。"
      render :new
    end
  end

  private

  def document_group_params
    params.require(:document_group).permit(:email)
  end
end
