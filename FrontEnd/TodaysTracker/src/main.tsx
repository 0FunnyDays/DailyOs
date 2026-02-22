import "./index.css";
import "./styles/colors.css";
import "./styles/HomePage.css";
import "./styles/Header.css";
import "./styles/AppLayout.css";
import "./styles/Footer.css";
import "./styles/LoginPage.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";

if (import.meta.env.DEV) {
  import("./dev/seed").then(({ seedTestUser }) => seedTestUser());
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
