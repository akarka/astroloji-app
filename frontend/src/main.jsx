import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

console.log("main.jsx loaded"); // Debug log

const rootElement = document.getElementById("root");
console.log("Root element:", rootElement); // Debug log

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} else {
  console.error("Root element not found!");
}
