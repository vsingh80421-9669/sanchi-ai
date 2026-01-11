"use client";

import { useState, useRef } from "react";

export default function Home() {
  const [status, setStatus] = useState("Ready");
  const [heardText, setHeardText] = useState("");
  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech Recognition not supported in this browser");
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = "hi-IN"; // Hindi
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setStatus("Listening...");
    };

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setHeardText(text);
      setStatus("Heard");
      speak(text); // jo suna wahi bolegi
    };

    recognition.onerror = () => {
      setStatus("Error");
    };

    recognition.onend = () => {
      setStatus("Ready");
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(
      "Tumne kaha: " + text
    );
    utterance.lang = "hi-IN";
    window.speechSynthesis.speak(utterance);
  };

  return (
    <main style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>🤖 Sanchi AI</h1>

      <p>Status: <strong>{status}</strong></p>

      <button
        onClick={startListening}
        style={{
          padding: "10px 16px",
          fontSize: "16px",
          cursor: "pointer",
          marginTop: "20px"
        }}
      >
        🎤 Start Listening
      </button>

      {heardText && (
        <p style={{ marginTop: "20px" }}>
          <strong>You said:</strong> {heardText}
        </p>
      )}
    </main>
  );
}
