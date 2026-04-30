import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

// Configure API base URL automatically for Netlify Cloud vs Localhost
const apiUrl = import.meta.env.VITE_API_URL || "";
console.log("🚀 Falaa Deals Initializing - API URL:", apiUrl || "Local (Relative)");
setBaseUrl(apiUrl);

createRoot(document.getElementById("root")!).render(<App />);
