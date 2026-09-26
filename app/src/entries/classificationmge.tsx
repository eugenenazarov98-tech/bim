import { StrictMode } from "react";
import "../index.css";
import { createRoot } from "react-dom/client";
import Classification from "@/pages/Classification";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Classification />
  </StrictMode>
);
