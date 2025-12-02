module ApplicationHelper
  def default_meta_tags
    {
      site: "PDFSync",
      reverse: true,
      charset: "utf-8",
      description: "PDF資料のリアルタイムページ同期、チャット、個人メモ（AI整形付き）で、会議・セミナー・勉強会・打ち合わせをスマートに。アカウント登録不要ですぐに開始可能。",
      keywords: %w[PDF 同期 リアルタイム ペーパレス コメント メモ 会議 勉強会 打ち合わせ ペーパレス会議 セミナー チャット],
      canonical: request.original_url,
      og: {
        title: "PDFSync - 会議・セミナー・勉強会・打ち合わせ効率化ツール",
        description: "PDF資料のリアルタイムページ同期、チャット、個人メモ（AI整形付き）で、会議・セミナー・勉強会・打ち合わせをスマートに。アカウント登録不要ですぐに開始可能。",
        type: "website",
        url: request.original_url,
        image: asset_url("ogp.png")
      },
      twitter: {
        card: "summary_large_image",
        site: "@pdfsyncapp",
        title: "PDFSync - 会議・セミナー・勉強会・打ち合わせ効率化ツール",
        description: "PDF資料のリアルタイムページ同期、チャット、個人メモ（AI整形付き）で、会議・セミナー・勉強会・打ち合わせをスマートに。アカウント登録不要ですぐに開始可能。",
        image: asset_url("ogp.png")
      }
    }
  end
end
