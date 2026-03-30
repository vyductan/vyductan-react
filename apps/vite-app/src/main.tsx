import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "~/styles/globals.css";

import { App } from "~/app/app";

const rootElement = document.querySelector("#root");

if (!rootElement) {
  throw new Error("Missing #root element");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
