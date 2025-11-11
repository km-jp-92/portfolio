import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="pdf-upload"
export default class extends Controller {
  static targets = ["form"]

  upload() {
    this.formTarget.requestSubmit()
  }
}
