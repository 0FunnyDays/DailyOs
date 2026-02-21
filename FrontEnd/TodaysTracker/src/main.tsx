import "./styles/colors.css";
import "./styles/Header.css";
import "./styles/PageRenderer.css";
import "./styles/LandingPage.css";
import "./styles/Footer.css";
import "./styles/LoginPage.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/Sidebar.css";

import App from "./App.tsx";

if (import.meta.env.DEV) {
  import("./dev/seed").then(({ seedTestUser }) => seedTestUser());
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
