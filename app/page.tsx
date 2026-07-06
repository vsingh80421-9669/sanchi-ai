"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [status, setStatus] = useState("Ready");
  const [heardText, setHeardText] = useState("");
  const [debugError, setDebugError] = useState(""); // 🐛 Error dhoondhne ke liye

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window) && !("speechRecognition" in window)) {
      alert("Aapka browser Speech Recognition support nahi karta. Chrome use karein.");
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).speechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = "hi-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setStatus("Listening...");
      setDebugError("");
      setHeardText("");
    };

    recognition.onresult = (event: any) => {
      if (event.results && event.results[0]) {
        const text = event.results[0][0].transcript;
        setHeardText(text);
        setStatus("Processing...");

        const reply = getReply(text);
        speak(reply);
        setStatus("Replied");
      } else {
        setStatus("No speech detected");
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech Error:", event.error);
      setDebugError(`Mic Error: ${event.error}`);
      setStatus("Error");
    };

    recognition.onend = () => {
      // Agar status processing ya replied nahi hai, toh wapas ready karo
      setStatus((prev) => (prev === "Listening..." ? "Stopped" : prev));
    };

    try {
      recognition.start();
    } catch (e: any) {
      setDebugError(`Start Failed: ${e.message}`);
    }
  };

  const getReply = (text: string) => {
    const cleanText = text.toLowerCase().trim();

    if (
      cleanText.includes("नाम") || 
      cleanText.includes("name") || 
      cleanText.includes("sanchi") || 
      cleanText.includes("सांची")
    ) {
      return "Mera naam Sanchi AI hai";
    } 
    else if (
      cleanText.includes("kaise ho") || 
      cleanText.includes("kaise hain") || 
      cleanText.includes("कैसे ho") || 
      cleanText.includes("कैसे हो")
    ) {
      return "Main thik hoon, shukriya poochhne ke liye";
    } 
    else if (
      cleanText.includes("hello") || 
      cleanText.includes("hi") || 
      cleanText.includes("हे")
    ) {
      return "Hello, main Sanchi hoon";
    } 
    else if (
      cleanText.includes("Tum is waqt kahan ho") ||
      cleanText.includes("where are you") ||
      cleanText.includes("तुम इस वक्त कहा हो") ||
      cleanText.includes("तुम कहा हो")
    ) {
      return "main is waqt, aapke phone mein aapke sath Hain";
    }
    else {
      return "Maaf kijiye Boss, mujhe yeh samajh nahi aaya.";
    }
  };

  const speak = (replyText: string) => {
    if ("speechSynthesis" in window) {
      // Pehle se chal rahi aawaaz ko roko
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(replyText);
      utterance.lang = "hi-IN";
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", textAlign: "center", color: "#fff", background: "#111", minHeight: "100vh" }}>
      <h1 style={{ marginTop: "50px" }}>SANCHI AI - Voice Assistant</h1>
      
      <p style={{ fontSize: "18px", margin: "20px 0" }}>
        Status: <strong style={{ color: status === "Error" ? "#ff4d4d" : "#00ffcc" }}>{status}</strong>
      </p>

      {/* 🐛 Debugging text jo dikhayega ki piche kya dikkat hai */}
      {debugError && <p style={{ color: "#ff4d4d", fontSize: "14px" }}>{debugError}</p>}

      <button 
        onClick={startListening} 
        style={{ padding: "12px 24px", fontSize: "16px", cursor: "pointer", borderRadius: "25px", border: "none", background: "#00ffcc", color: "#000", fontWeight: "bold", marginTop: "10px" }}
      >
        Start Voice
      </button>

      {heardText && (
        <div style={{ marginTop: "30px", background: "#222", padding: "15px", borderRadius: "10px" }}>
          <p style={{ fontSize: "16px", color: "#aaa", margin: "5px 0" }}>Boss ne bola: "{heardText}"</p>
        </div>
      )}
    </div>
  );
}
