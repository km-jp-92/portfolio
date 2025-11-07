import { Controller } from "@hotwired/stimulus"
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist"

GlobalWorkerOptions.workerSrc = "/assets/pdf.worker.min.mjs";

// controller: pdf-viewer
export default class extends Controller {
  static targets = ["canvas", "pageNumber", "totalPages"]
  static values = { url: String }

  async connect() {
    this.scale = 1.2
    this.currentPage = 1

    try {
      const loadingTask = getDocument({
        url: this.urlValue,
        // ✅ 日本語PDF対応: CMap設定を追加
        cMapUrl: "/assets/cmaps/",  // public/assets/cmaps/ に配置
        cMapPacked: true
      })

      this.pdf = await loadingTask.promise
      this.totalPagesTarget.textContent = this.pdf.numPages
      this.renderPage(this.currentPage)
    } catch (error) {
      console.error("PDF読み込みエラー:", error)
    }
  }

  async renderPage(num) {
    const page = await this.pdf.getPage(num)
    const viewport = page.getViewport({ scale: this.scale })
    const canvas = this.canvasTarget
    const context = canvas.getContext("2d")

    canvas.height = viewport.height
    canvas.width = viewport.width

    // 見た目のサイズも合わせる（ここが重要）
    canvas.style.width = `${viewport.width}px`
    canvas.style.height = `${viewport.height}px`

    await page.render({ canvasContext: context, viewport }).promise

    this.pageNumberTarget.textContent = num
  }

  async nextPage() {
    if (this.currentPage < this.pdf.numPages) {
      this.currentPage++
      await this.renderPage(this.currentPage)
    }
  }

  async prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--
      await this.renderPage(this.currentPage)
    }
  }

  async zoomIn() {
    this.scale *= 1.2
    await this.renderPage(this.currentPage)
  }

  async zoomOut() {
    this.scale /= 1.2
    await this.renderPage(this.currentPage)
  }
}