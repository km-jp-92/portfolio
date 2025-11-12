import { Controller } from "@hotwired/stimulus"
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist"

GlobalWorkerOptions.workerSrc = "/assets/pdf.worker.min.mjs";

import consumer from "../channels/consumer"

import Hammer from "hammerjs"

// controller: pdf-viewer
export default class extends Controller {
  static targets = ["canvas", "pageNumber", "totalPages", "nextButton", "prevButton", "presenterBtn", "audienceBtn"]
  static values = { url: String, pdfId: Number  }

  async connect() {
    this.scale = 1
    this.currentPage = 1
    this.role = null // "presenter", "audience", null
    this.hammer = null

    document.addEventListener("fullscreenchange", this.handleFullscreenChange)

    document.addEventListener("keydown", this.handleKeydown)

    

    this.setupActionCable()

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

  disconnect() {
    document.removeEventListener("fullscreenchange", this.handleFullscreenChange)
    document.removeEventListener("keydown", this.handleKeydown)
  }

  // --- ページ同期用 ActionCable ---
  setupActionCable() {
    if (!this.pdfIdValue) return
    this.pdfChannel = consumer.subscriptions.create(
      { channel: "PdfSyncChannel", pdf_id: this.pdfIdValue },
      {
        received: (data) => {
          // 発表者が現在ページを返した場合（聴講者側）
          if (this.role === "audience") {
            this.changePage(data.page)
          }

          // 聴講者が現在ページをリクエストした場合（発表者側）
          if (data.request_page_for && this.role === "presenter") {
            this.pdfChannel.perform("page_changed", { page: this.currentPage })
          }
        }
      }
    )
  }

  // --- トグルボタン ---
    selectPresenter() {
      if (this.role === "presenter") {
        // すでに発表者なら解除
        this.role = null
      } else {
        // 確認ダイアログ
        const ok = confirm("本当に発表者になりますか？")
        if (!ok) return
        this.role = "presenter"
      }
      this.updateRoleButtonStyles()
    }

    selectAudience() {
      const becomingAudience = this.role !== "audience"
      this.role = becomingAudience ? "audience" : null
      this.updateRoleButtonStyles()

      // 聴講者になった瞬間に発表者にページリクエストを送る
      if (becomingAudience && this.pdfChannel) {
        this.pdfChannel.perform("request_current_page")
      }
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
    const canvas = this.canvasTarget
    const context = canvas.getContext("2d")

    const parentWidth = window.innerWidth
    const parentHeight = window.innerHeight

    // PDFの元サイズを取得（scale=1）
    const unscaledViewport = page.getViewport({ scale: 1 })
    const pageWidth = unscaledViewport.width
    const pageHeight = unscaledViewport.height

    // 上部コントロールの高さ
    const viewer = canvas.closest('[data-controller="pdf-viewer"]')
    const controls = viewer.querySelector('.flex.items-center.space-x-3')
    const controlsHeight = controls?.offsetHeight || 0

    // PDF選択セクションの高さ
    const selector = document.querySelector('[data-controller="pdf-selector"]')
    const selectorHeight = selector?.offsetHeight || 0

    // 実際に描画可能な縦方向の高さ
    const availableHeight = parentHeight - controlsHeight - selectorHeight

    // canvasサイズに合わせるスケールを計算（縦横比維持）
    const fitScale = Math.min(parentWidth / pageWidth, availableHeight / pageHeight)
    const viewport = page.getViewport({ scale: fitScale * this.scale })

    // canvasのピクセルサイズを調整
    const scaleFactor = 2.0

    canvas.height = viewport.height * scaleFactor
    canvas.width = viewport.width * scaleFactor

    // 見た目のサイズも合わせる（CSSで表示サイズを設定）
    canvas.style.width = `${viewport.width}px`
    canvas.style.height = `${viewport.height}px`

    context.scale(scaleFactor, scaleFactor)

    // 描画
    await page.render({ canvasContext: context, viewport }).promise

    this.pageNumberTarget.textContent = num
  }

  async zoomIn() {
    this.scale *= 1.05
    await this.renderPage(this.currentPage)
  }

  async zoomOut() {
    this.scale /= 1.05
    await this.renderPage(this.currentPage)
  }

  toggleFullScreen() {
    const wrapper = document.getElementById("pdf-fullscreen-wrapper")

    if (!document.fullscreenElement) {
      wrapper.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  handleFullscreenChange = () => {
    const wrapper = document.getElementById("pdf-fullscreen-wrapper")
    const selector = document.getElementById("pdf-selector-area")
    const controls = document.getElementById("pdf-controls-area")

    if (document.fullscreenElement === wrapper) {
      selector.style.display = 'none'
      controls.style.display = 'none'

      this.enableHammer()
    } else {
      selector.style.display = ''
      controls.style.display = ''

      this.disableHammer()
    }

    // フルスクリーン切替後にPDFを再描画
    setTimeout(() => this.renderPage(this.currentPage), 200)
  }

  handleKeydown = (event) => {
    switch(event.key) {
      case "ArrowRight":
      case "Enter":
        this.nextPage()
        break
      case "ArrowLeft":
        this.prevPage()
        break
      case "ArrowUp":
        this.prevPage()
      break
      case "ArrowDown":
        this.nextPage()
      break
      case "Escape":
        if (document.fullscreenElement) {
          document.exitFullscreen()
        }
        break
    }
  }

  enableHammer() {
    if (this.hammer) return

    const canvas = this.canvasTarget
    canvas.style.touchAction = "none" // 標準ブラウザのタッチ操作を無効化

    this.hammer = new Hammer(canvas)
    this.hammer.get("pan").set({ direction: Hammer.DIRECTION_HORIZONTAL })
    this.hammer.get("pinch").set({ enable: true })

    // 横スワイプ
    this.hammer.on("panend", e => {
      if (e.pointers.length > 1) return // 2本指は無視
      if (e.deltaX > 50) this.prevPage()
      else if (e.deltaX < -50) this.nextPage()
    })

    // ピンチズーム
    this.hammer.on("pinch", e => {
      canvas.style.transform = `scale(${e.scale})`
    })
  }

  disableHammer() {
    if (!this.hammer) return

    this.hammer.destroy()
    this.hammer = null

    const canvas = this.canvasTarget
    canvas.style.transform = ""
    canvas.style.touchAction = ""
  }
}