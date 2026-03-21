import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App.tsx";
import "./index.css";

const CLERK_PUBLISHABLE_KEY = "pk_live_Y2xlcmsuamFja3llY2xheXRvbi5jb20k";

createRoot(document.getElementById("root")!).render(
  <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} signInFallbackRedirectUrl="/dashboard" signUpFallbackRedirectUrl="/dashboard">
    <App />
  </ClerkProvider>
);
