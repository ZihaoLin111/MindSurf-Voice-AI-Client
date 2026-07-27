import { createApp } from "vue";
import App from "./App.vue";
import OverlayApp from "./OverlayApp.vue";
import "./styles/base.css";

const isOverlay = new URLSearchParams(window.location.search).get("view") === "overlay";
if (isOverlay) {
  document.documentElement.classList.add("overlay-document");
}

createApp(isOverlay ? OverlayApp : App).mount("#app");
