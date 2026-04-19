import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

// Configure API base URL from environment
setBaseUrl(import.meta.env.VITE_API_URL || "http://localhost:5005");

createRoot(document.getElementById("root")!).render(<App />);
