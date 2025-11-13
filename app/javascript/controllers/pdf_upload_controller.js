import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="pdf-upload"
export default class extends Controller {
  static targets = ["form"]

  connect() {
    this.dropArea = this.formTarget.querySelector("label")
    this.fileInput = this.formTarget.querySelector('input[type="file"]')

    // ドロップ時の処理
    this.formTarget.addEventListener("dragover", this.handleDragOver.bind(this))
    this.formTarget.addEventListener("dragleave", this.handleDragLeave.bind(this))
    this.formTarget.addEventListener("drop", this.handleDrop.bind(this))
  }

  upload() {
    this.formTarget.requestSubmit()
  }

  handleDragOver(event) {
    event.preventDefault()
    event.stopPropagation()
    this.dropArea.classList.add("bg-blue-100") // 視覚的に反応
  }

  handleDragLeave(event) {
    event.preventDefault()
    event.stopPropagation()
    this.dropArea.classList.remove("bg-blue-100")
  }

  handleDrop(event) {
    event.preventDefault()
    event.stopPropagation()
    this.dropArea.classList.remove("bg-blue-100")

    const files = event.dataTransfer.files
    if (files.length > 0) {
      // input[type="file"] にドラッグしたファイルをセット
      this.fileInput.files = files
      this.upload()
    }
  }
}
