// このファイルはReactに移行したため現在使用していません（MVPリリース時に使用）
import { Controller } from "@hotwired/stimulus"

// controller: pdf-selector
export default class extends Controller {
  static values = { viewToken: String }

  change(event) {
    const docId = event.target.value
    if (!docId) return

    const token = this.viewTokenValue
    // viewer ページに遷移
    window.location.href = `/documents/viewer/${token}?document_id=${docId}`
  }
}
