import { Controller } from "@hotwired/stimulus"

// controller: pdf-selector
export default class extends Controller {
  static values = { groupId: Number }

  change(event) {
    const docId = event.target.value
    if (!docId) return

    const groupId = this.groupIdValue
    // viewer ページに遷移
    window.location.href = `/document_groups/${groupId}/viewer?document_id=${docId}`
  }
}
