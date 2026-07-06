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
      return "Maaf kijiye Boss, mujhe yeh samajh nahi aaya.";
    }
  };

  // 🗣️ Voice output logic
  const speak = (replyText: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(replyText);
      utterance.lang = "hi-IN";
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", textAlign: "center", color: "#fff", background: "#111", minHeight: "100vh" }}>
      <h1 style={{ marginTop: "50px" }}>SANCHI AI - Voice Assistant</h1>
      <p style={{ fontSize: "18px", margin: "20px 0" }}>Status: <strong style={{ color: "#00ffcc" }}>{status}</strong></p>
      <button 
        onClick={startListening} 
        style={{ padding: "12px 24px", fontSize: "16px", cursor: "pointer", borderRadius: "25px", border: "none", background: "#00ffcc", color: "#000", fontWeight: "bold" }}
      >
        Start Voice
      </button>
      {heardText && <p style={{ marginTop: "30px", fontSize: "16px", color: "#aaa" }}>Boss ne bola: "{heardText}"</p>}
    </div>
  );
}

