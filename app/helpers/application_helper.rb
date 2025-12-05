module ApplicationHelper
  def default_meta_tags
    {
      site: "PDFSync",
      reverse: true,
      charset: "utf-8",
      description: "資料をめくるだけで全員が追従。匿名チャットで質問も活性化。メモはAIが整理。登録不要、メールアドレスだけですぐに開始",
      keywords: %w[PDF 同期 リアルタイム ペーパレス コメント メモ 会議 勉強会 打ち合わせ ペーパレス会議 セミナー チャット],
      canonical: request.original_url,
      og: {
        title: "PDFSync - リアル会議効率化ツール",
        description: "資料をめくるだけで全員が追従。匿名チャットで質問も活性化。メモはAIが整理。登録不要、メールアドレスだけですぐに開始",
        type: "website",
        url: request.original_url,
        image: asset_url("ogp.png")
      },
      twitter: {
        card: "summary_large_image",
        site: "@pdfsyncapp",
        title: "PDFSync - リアル会議効率化ツール",
        description: "資料をめくるだけで全員が追従。匿名チャットで質問も活性化。メモはAIが整理。登録不要、メールアドレスだけですぐに開始",
        image: asset_url("ogp.png")
      }
    }
  end
end
