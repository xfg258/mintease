import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./components/ui/ui.css";
import "./App.css";

const theme = localStorage.getItem("mintease-theme");
if (theme === "dark" || theme === "light") {
  document.documentElement.setAttribute("data-theme", theme);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
