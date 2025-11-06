import { Controller } from "@hotwired/stimulus"

// controller: pdf-viewer
export default class extends Controller {
  static targets = ["canvas"]
  static values = { url: String }

  // Stimulusの connect() をasync化
  async connect() {
    if (!window.pdfjsLib) {
      console.error("PDF.js が読み込まれていません。")
      return
    }

    const url = this.urlValue
    const canvas = this.canvasTarget
    const context = canvas.getContext("2d")

    try {
      // PDFを読み込み
      const pdf = await pdfjsLib.getDocument(url).promise

      // 1ページ目を取得
      const page = await pdf.getPage(1)

      // 拡大倍率を設定
      const scale = 1.2
      const viewport = page.getViewport({ scale })

      // CanvasサイズをViewportに合わせる
      canvas.height = viewport.height
      canvas.width = viewport.width

      // 描画コンテキストを作成（PDF.jsの定型）
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      }

      // 🖼️ ページを描画
      await page.render(renderContext).promise

      console.log("✅ PDF描画が完了しました")
    } catch (error) {
      console.error("❌ PDF読み込みエラー:", error)
    }
  }
}
