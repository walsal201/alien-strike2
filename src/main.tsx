import { createRoot } from "react-dom/client";
import React from "react";
import App from "./App.tsx";
import "./index.css";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      const err = this.state.error as Error;
      return (
        <div style={{
          background: "#0a0a0a", color: "#00ff41", fontFamily: "monospace",
          padding: "2rem", minHeight: "100vh", whiteSpace: "pre-wrap"
        }}>
          <h2 style={{ color: "#ff0000" }}>⚠ SYSTEM CRASH — RENDER ERROR</h2>
          <p><strong>{err.message}</strong></p>
          <pre style={{ color: "#ffaa00", fontSize: "12px" }}>{err.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
