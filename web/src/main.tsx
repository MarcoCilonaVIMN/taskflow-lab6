import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App";

const container = document.getElementById("root");
if (!container) throw new Error("Elemento #root non trovato");

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
