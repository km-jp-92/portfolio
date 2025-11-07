import { Controller } from "@hotwired/stimulus"
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist"

GlobalWorkerOptions.workerSrc = "/assets/pdf.worker.min.mjs";

import consumer from "../channels/consumer"

// controller: pdf-viewer
export default class extends Controller {
  static targets = ["canvas", "pageNumber", "totalPages", "nextButton", "prevButton", "presenterBtn", "audienceBtn"]
  static values = { url: String, pdfId: Number  }

  async connect() {
    this.scale = 1.4
    this.currentPage = 1
    this.role = null // "presenter", "audience", null

    this.setupActionCable()
    this.setupRoleButtons()

    try {
      const loadingTask = getDocument({
        url: this.urlValue,
        // 日本語PDF対応: CMap設定を追加
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

  // --- ページ同期用 ActionCable ---
  setupActionCable() {
    if (!this.pdfIdValue) return
    this.pdfChannel = consumer.subscriptions.create(
      { channel: "PdfSyncChannel", pdf_id: this.pdfIdValue },
      {
        received: (data) => {
          if (this.role === "audience") {
            this.changePage(data.page)
          }
        }
      }
    )
  }

  // --- トグルボタン ---
  setupRoleButtons() {
    if (!this.hasPresenterBtnTarget || !this.hasAudienceBtnTarget) return

    this.presenterBtnTarget.addEventListener("click", () => {
      if (this.role === "presenter") {
        // すでに発表者なら解除
        this.role = null
      } else {
        // 確認ダイアログ
        const ok = confirm("本当に発表者になりますか？")
        if (!ok) return
        this.role = "presenter"
      }
      this.updatePageButtons()
      this.updateRoleButtonStyles()
    })

    this.audienceBtnTarget.addEventListener("click", () => {
      this.role = this.role === "audience" ? null : "audience"
      this.updatePageButtons()
      this.updateRoleButtonStyles()
    })

    this.updatePageButtons()
    this.updateRoleButtonStyles()
  }

  updatePageButtons() {
    const disable = this.role === "audience"
    if (this.hasNextButtonTarget) this.nextButtonTarget.disabled = disable
    if (this.hasPrevButtonTarget) this.prevButtonTarget.disabled = disable
  }

  // ボタン色更新
  updateRoleButtonStyles() {
    // 発表者ボタン
    if (this.role === "presenter") {
      this.presenterBtnTarget.classList.add("bg-blue-500", "text-white")
      this.presenterBtnTarget.classList.remove("bg-gray-200", "text-black")
    } else {
      this.presenterBtnTarget.classList.remove("bg-blue-500", "text-white")
      this.presenterBtnTarget.classList.add("bg-gray-200", "text-black")
    }

    // 聴講者ボタン
    if (this.role === "audience") {
      this.audienceBtnTarget.classList.add("bg-green-500", "text-white")
      this.audienceBtnTarget.classList.remove("bg-gray-200", "text-black")
    } else {
      this.audienceBtnTarget.classList.remove("bg-green-500", "text-white")
      this.audienceBtnTarget.classList.add("bg-gray-200", "text-black")
    }
  }

  // --- ページ切替 ---
  async changePage(num) {
    if (num < 1 || num > this.pdf.numPages) return
    this.currentPage = num
    await this.renderPage(num)

    if (this.role === "presenter" && this.pdfChannel) {
      this.pdfChannel.perform("page_changed", { page: num })
    }
  }

  async nextPage() {
    if (this.currentPage < this.pdf.numPages) {
      await this.changePage(this.currentPage + 1)
    }
  }

  async prevPage() {
    if (this.currentPage > 1) {
      await this.changePage(this.currentPage - 1)
    }
  }

  async renderPage(num) {
    const page = await this.pdf.getPage(num)
    const viewport = page.getViewport({ scale: this.scale })
    const canvas = this.canvasTarget
    const context = canvas.getContext("2d")

    canvas.height = viewport.height
    canvas.width = viewport.width

    // 見た目のサイズも合わせる
    canvas.style.width = `${viewport.width}px`
    canvas.style.height = `${viewport.height}px`

    await page.render({ canvasContext: context, viewport }).promise

    this.pageNumberTarget.textContent = num
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