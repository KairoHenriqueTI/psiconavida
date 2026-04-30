export function getApiBase() {
  const configured = import.meta.env.VITE_API_URL;
  if (typeof window !== "undefined") {
    const isLocalhost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
    return isLocalhost && configured ? configured : "";
  }
  if (configured) return configured;
  return "http://localhost:3001";
}

export const API_BASE = getApiBase();
