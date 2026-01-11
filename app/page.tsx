"use client";

import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("Ready");

  return (
    <main style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>🤖 Sanchi AI</h1>

      <p>Status: <strong>{message}</strong></p>

      <button
        onClick={() => setMessage("Listening...")}
        style={{
          padding: "10px 16px",
          fontSize: "16px",
          cursor: "pointer",
          marginTop: "20px"
        }}
      >
        Start
      </button>
    </main>
  );
}
