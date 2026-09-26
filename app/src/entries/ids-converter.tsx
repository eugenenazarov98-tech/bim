import { StrictMode } from "react";
import "../index.css";
import { createRoot } from "react-dom/client";
import IdsConverter from "@/pages/IdsConverter";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <IdsConverter />
  </StrictMode>
);
