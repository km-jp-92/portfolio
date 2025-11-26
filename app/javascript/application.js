// Entry point for the build script in your package.json
import "@hotwired/turbo-rails"
import "./controllers"
import "./channels"

import React from "react";
import ReactDOM from "react-dom/client";
import SidePanel from "./components/SidePanel";

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("side-panel-root");
  if (container) {
    const root = ReactDOM.createRoot(container);
    root.render(<SidePanel />);
  }
});

