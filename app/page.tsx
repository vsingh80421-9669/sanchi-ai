"use client";

import { useState } from "react";

export default function Home() {
  const [status, setStatus] = useState("Ready");
  const [heardText, setHeardText] = useState("");

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition not supported");
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = "hi-IN";

    recognition.onstart = () => {
      setStatus("Listening...");
    };

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setHeardText(text);

      const reply = getReply(text); // 🧠 yahin soch rahi hai
      speak(reply);                // 🗣️ yahin bol rahi hai

      setStatus("Replied");
    };

    recognition.onerror = () => {
      setStatus("Error");
    };

    recognition.onend = () => {
      setStatus("Ready");
    };

    recognition.start();
  };

  // 🧠 Sanchi ka decision brain
  const getReply = (text: string) => {
    text = text.toLowerCase();

    if (text.includes("hello") || text.includes("hi")) {
      return "Hello, main Sanchi hoon";
    } 
    else if (text.includes("naam")) {
      return "Mera naam Sanchi AI hai";
    } 
    else if (text.includes("kaise ho")) {
      return "Main thik hoon, shukriya puchhne ke liye";
    } 
    else {
      return "Mujhe samajh nahi aaya, dobara bolo";
    }
  };

  // 🗣️ bolne ka part
  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
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
        Start Listening
      </button>

      {heardText && (
        <p style={{ marginTop: "20px" }}>
          You said: <strong>{heardText}</strong>
        </p>
      )}
    </main>
  );
}
