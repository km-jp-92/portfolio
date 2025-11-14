import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["dropzone", "fileInput"]

  connect() {
    this.dropzoneTarget.addEventListener("dragover", this.handleDragOver)
    this.dropzoneTarget.addEventListener("drop", this.handleDrop)
  }

  disconnect() {
    this.dropzoneTarget.removeEventListener("dragover", this.handleDragOver)
    this.dropzoneTarget.removeEventListener("drop", this.handleDrop)
  }

  upload() {
    this.fileInputTarget.form.requestSubmit()
  }

  handleDragOver = (event) => event.preventDefault()

  handleDrop = (event) => {
    event.preventDefault()

    const files = event.dataTransfer.files
    if (files.length > 0) {
      this.fileInputTarget.files = files
      this.upload()
    }
  }
}
