// Entry point for the build script in your package.json
import "@hotwired/turbo-rails"
import "./controllers"
import "./channels"
import * as ActiveStorage from "@rails/activestorage"
ActiveStorage.start()

import React from "react";
import ReactDOM from "react-dom/client";
import DocumentGroupViewer from "./components/DocumentGroupViewer";

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("document-group-viewer-root");
  if (!container) return;

  // viewer.html.erb に埋め込まれた token を読む
  const token = container.dataset.token;

  const root = ReactDOM.createRoot(container);
  root.render(<DocumentGroupViewer token={token} />);
});
