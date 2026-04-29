import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

// Configure API base URL automatically
const defaultUrl = "";
setBaseUrl(import.meta.env.VITE_API_URL || defaultUrl);

createRoot(document.getElementById("root")!).render(<App />);
