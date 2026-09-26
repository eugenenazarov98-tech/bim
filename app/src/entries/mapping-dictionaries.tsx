import { StrictMode } from "react";
import "../index.css";
import { createRoot } from "react-dom/client";
import Dictionaries from "@/pages/Dictionaries";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Dictionaries />
  </StrictMode>
);
