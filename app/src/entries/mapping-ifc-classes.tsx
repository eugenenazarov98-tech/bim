import { StrictMode } from "react";
import "../index.css";
import { createRoot } from "react-dom/client";
import IfcClasses from "@/pages/IfcClasses";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <IfcClasses />
  </StrictMode>
);
