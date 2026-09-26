import { StrictMode } from "react";
import "../index.css";
import { createRoot } from "react-dom/client";
import Mapping from "@/pages/Mapping";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Mapping />
  </StrictMode>
);
