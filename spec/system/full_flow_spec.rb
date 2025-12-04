require "rails_helper"
require "nokogiri"

RSpec.describe "PDFSync full flow", type: :system do
  before do
    driven_by(:remote_chrome)
    ActionMailer::Base.deliveries.clear
  end

  let(:email) { "test@example.com" }
  let(:password) { "Password1234" }

  # 共通ヘルパー: メール送信して最後のメールを取得
  def send_email
    visit root_path
    fill_in "document_group_email", with: email
    click_button "送信"
    ActionMailer::Base.deliveries.last
  end

  # 共通ヘルパー: メール本文からリンク抽出
  def extract_links(mail)
    # HTMLパートがあれば優先
    body = mail.html_part || mail.text_part || mail

    # デコードされた文字列を取得
    decoded_body = body.decoded

    # NokogiriでHTMLとしてパース
    doc = Nokogiri::HTML(decoded_body)
    doc.css('a').map { |a| a['href'] }.compact
  end

  # URL のホストをテスト環境に置き換えて visit 可能にする
  def normalize_url(url)
    return nil unless url
    uri = URI.parse(url)
    uri.host = URI.parse(Capybara.app_host).host
    uri.to_s
  end

  # 共通ヘルパー: パスワード設定
  def set_password(password_url)
    visit normalize_url(password_url)
    expect(page).to have_field("document_group[password]")
    fill_in "document_group[password]", with: password
    fill_in "document_group[password_confirmation]", with: password
    click_button "パスワードを設定"
  end

  describe "ユーザー登録フロー" do
    context "メール送信" do
      it "メールが送信される" do
        mail = send_email

        expect(page).to have_content("メールをお送りしましたのでご確認ください")
        expect(ActionMailer::Base.deliveries.size).to eq(1)
      end
    end

    context "メールからURL抽出" do
      let(:mail) { send_email }

      it "パスワード設定URL・アップロードURL・ビューアURLが取得できる" do
        links = extract_links(mail)

        @password_url = links.find { |u| u.include?("/document_groups/password/") }
        @upload_url   = links.find { |u| u.include?("/documents/") && !u.include?("/viewer") }
        @viewer_url   = links.find { |u| u.include?("/documents/viewer/") }

        expect(@password_url).to be_present
        expect(@upload_url).to be_present
        expect(@viewer_url).to be_present
      end
    end

    context "パスワード設定" do
      before do
        mail = send_email
        links = extract_links(mail)
        @password_url = links.find { |u| u.include?("/document_groups/password/") }
      end

      it "パスワードを設定できる" do
        set_password(@password_url)
        expect(page).to have_content("パスワードを設定しました")
      end
    end
  end

  describe "PDF アップロード フロー" do
    before do
      mail = send_email
      links = extract_links(mail)

      @password_url = links.find { |u| u.include?("/document_groups/password/") }
      @upload_url   = links.find { |u| u.include?("/documents/") && !u.include?("/viewer") }
      @viewer_url   = links.find { |u| u.include?("/documents/viewer/") }

      set_password(@password_url)
    end

    context "アップロード画面" do
      it "入室できる" do
        visit normalize_url(@upload_url)
        fill_in "password", with: password
        click_button "送信"

        expect(page).to have_content("＋")
      end
    end

    context "PDFアップロード" do
      before do
        visit normalize_url(@upload_url)
        fill_in "password", with: password
        click_button "送信"
      end

      it "PDF をアップロードできる" do
        attach_file(
          "document[files][]",
          Rails.root.join("spec/fixtures/files/test.pdf"),
          make_visible: true
        )

        find("label[for='file-upload-input']").click
        expect(page).to have_content("アップロードしました")
      end
    end

    context "PDF Viewer" do
      before do
        # PDFアップロードしてからViewerに入る
        visit normalize_url(@upload_url)
        fill_in "password", with: password
        click_button "送信"

        attach_file(
          "document[files][]",
          Rails.root.join("spec/fixtures/files/test.pdf"),
          make_visible: true
        )
        find("label[for='file-upload-input']").click
        expect(page).to have_content("アップロードしました")

        visit normalize_url(@viewer_url)
        fill_in "password", with: password
        click_button "送信"
      end

      it "ビューワーに入室できる" do
        expect(page).to have_selector("#document-group-viewer-root", visible: true)
      end
    end
  end
end
