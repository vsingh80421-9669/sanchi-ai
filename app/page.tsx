"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, VolumeX, Send } from "lucide-react";

export default function SanchiUltimateDashboard() {
  const [appMode, setAppMode] = useState<"owner" | "client">("owner");
  const [selectedModule, setSelectedModule] = useState<string>("chatbot");
  const [inputMessage, setInputMessage] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<Array<{ sender: string; text: string }>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Voice Controls State
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false); 
  const [isListening, setIsListening] = useState<boolean>(false); 

  const recognitionRef = useRef<any>(null);
  const currentAiName = appMode === "owner" ? "Sanchi AI" : "Zephyr AI";

  // 🔊 Speaker Logic (Text to Speech)
  const speakText = (text: string) => {
    if (isMuted) return; 
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel(); 
      const utterance = new SpeechSynthesisUtterance(text);
      
      const voices = window.speechSynthesis.getVoices();
      const indianVoice = voices.find(v => v.lang.includes("IN") || v.lang.includes("hi"));
      if (indianVoice) utterance.voice = indianVoice;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // 🎙️ Mic Logic (Speech to Text)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.lang = "hi-IN"; 
        rec.interimResults = false;

        rec.onstart = () => setIsListening(true);
        rec.onend = () => setIsListening(false);
        
        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript.trim()) {
            setInputMessage(transcript);
          }
        };

        recognitionRef.current = rec;
      }
    }
  }, []);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert("Aapke browser me mic support nahi hai bhai.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel(); 
      }
      recognitionRef.current.start();
    }
  };

  // Main API Call handler
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    const msgToSend = inputMessage;
    setChatHistory((prev) => [...prev, { sender: "user", text: msgToSend }]);
    setInputMessage("");
    setLoading(true);

    let payload: any = { 
      message: msgToSend,
      user_message: msgToSend,
      code_or_prompt: msgToSend,
      module_context: selectedModule, // Context backend ko pass karne ke liye
      conversationHistory: chatHistory.map(h => ({
        role: h.sender === "user" ? "user" : "assistant",
        content: h.text
      }))
    };

    try {
      // 🟢 CRITICAL ROUTING FIX: Kuch bhi select ho, bypass to fully stable chatbot/programming endpoints!
      const targetRoute = selectedModule === "programming" ? "programming" : "chatbot";
      
      const res = await fetch(`/api/${targetRoute}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      let aiReply = data.reply || data.response || data.code || data.error || "No response";
      
      if (typeof aiReply === "object") aiReply = JSON.stringify(aiReply);

      setChatHistory((prev) => [...prev, { sender: "ai", text: aiReply }]);
      speakText(aiReply); 

    } catch (error) {
      setChatHistory((prev) => [...prev, { sender: "ai", text: "System Error: Connection failed, Boss." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: "#000000", 
      color: "#f8fafc",
      minHeight: "100vh",
      fontFamily: "monospace",
      padding: "16px",
      display: "flex",
      flexDirection: "column",
      gap: "14px"
    }}>
      
      {/* HEADER SYSTEM */}
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "2px solid #1e293b",
        paddingBottom: "12px"
      }}>
        <div>
          <h1 style={{ color: "#22d3ee", margin: 0, fontSize: "22px", fontWeight: "900", letterSpacing: "2px" }}>
            {appMode === "owner" ? "🛡️ SANCHI ENGINE v5.2" : "⚡ ZEPHYR ENGINE"}
          </h1>
          <small style={{ color: "#64748b" }}>Viraaj Tech Multitasking Node</small>
        </div>

        <button
          onClick={() => {
            setAppMode(appMode === "owner" ? "client" : "owner");
            if (typeof window !== "undefined") window.speechSynthesis.cancel();
          }}
          style={{
            backgroundColor: appMode === "owner" ? "#0891b2" : "#16a34a",
            color: "#fff",
            border: "none",
            padding: "8px 14px",
            borderRadius: "6px",
            fontWeight: "bold",
            fontSize: "12px",
            cursor: "pointer"
          }}
        >
          {appMode === "owner" ? "Owner (Sanchi)" : "Client (Zephyr)"}
        </button>
      </header>

      {/* CONTROLS BAR */}
      <div style={{
        backgroundColor: "#0b0f19",
        border: "1px solid #1e293b",
        padding: "10px",
        borderRadius: "8px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => {
              if (!isMuted && typeof window !== "undefined") window.speechSynthesis.cancel();
              setIsMuted(!isMuted);
            }}
            style={{
              backgroundColor: isMuted ? "#3f1d1d" : "#1e293b",
              border: "1px solid " + (isMuted ? "#f43f5e" : "#475569"),
              color: isMuted ? "#f43f5e" : "#38bdf8",
              padding: "8px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              fontWeight: "bold"
            }}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            {isMuted ? "SPEAKER OFF" : "SPEAKER ON"}
          </button>
        </div>

        <span style={{ fontSize: "11px", color: isListening ? "#f43f5e" : "#22d3ee" }}>
          {isListening ? "🔴 LISTENING..." : "🟢 STANDBY MATRIX"}
        </span>
      </div>

      {/* ROUTE MANAGER */}
      <div style={{
        backgroundColor: "#0b0f19",
        border: "1px solid #1e293b",
        padding: "10px",
        borderRadius: "8px",
        display: "flex",
        flexDirection: "column",
        gap: "6px"
      }}>
        <label style={{ fontSize: "11px", color: "#64748b", fontWeight: "bold" }}>TARGET ROUTE:</label>
        <select
          value={selectedModule}
          onChange={(e) => {
            setSelectedModule(e.target.value);
            setChatHistory([]);
          }}
          style={{
            backgroundColor: "#000",
            border: "1px solid #334155",
            color: "#22d3ee",
            padding: "8px",
            borderRadius: "6px",
            outline: "none"
          }}
        >
          <option value="chatbot">💬 Custom Chatbot Builder</option>
          <option value="programming">💻 Programming Buddy Architect</option>
          <option value="research">🔬 Scientific Research Analyzer</option>
          <option value="education">🎓 AI Education Coach</option>
          <option value="decision-maker">⚖️ Risk & Decision Analyzer</option>
          <option value="robotics">🤖 Robotics Simulator Logic</option>
          <option value="translate">🌐 Context Slang Translator</option>
          <option value="spam-filer">🛡️ Content Spam & Sentiment</option>
          <option value="youtube-recommender">🎥 YouTube Algo Matrix</option>
          <option value="voice-assistant">🎙️ Voice Intent Extractor</option>
          <option value="ai-brain">🧠 SANCHI Core Intelligence</option>
        </select>
      </div>

      {/* CENTRAL TERMINAL CHAT VIEW */}
      <div style={{
        flex: 1,
        backgroundColor: "#020617",
        border: "1px solid #1e293b",
        borderRadius: "12px",
        padding: "14px",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        minHeight: "340px"
      }}>
        {chatHistory.length === 0 && (
          <div style={{ margin: "auto", textAlign: "center", color: "#475569" }}>
            <div style={{ fontSize: "36px" }}>🌐</div>
            <p style={{ fontSize: "12px", marginTop: "8px" }}>
              {appMode === "owner" 
                ? "Stealth matrix active. Mic ya Type karke instruct karein, Vivek." 
                : "Engine check verified. Type parameters below."}
            </p>
          </div>
        )}

        {chatHistory.map((msg, i) => (
          <div key={i} style={{
            alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
            maxWidth: "85%"
          }}>
            <div style={{ fontSize: "10px", color: "#475569", marginBottom: "3px", textAlign: msg.sender === "user" ? "right" : "left" }}>
              {msg.sender === "user" ? "AUTHORIZED OWNER" : currentAiName}
            </div>
            <div style={{
              backgroundColor: msg.sender === "user" ? "#0891b2" : "#1e293b",
              color: "#f8fafc",
              padding: "12px 16px",
              borderRadius: "12px",
              borderTopRightRadius: msg.sender === "user" ? "0px" : "12px",
              borderTopLeftRadius: msg.sender === "ai" ? "0px" : "12px",
              fontSize: "14px",
              lineHeight: "1.4",
              whiteSpace: "pre-wrap",
              border: "1px solid #334155"
            }}>
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ color: "#22d3ee", fontSize: "11px", display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ display: "inline-block", width: "6px", height: "6px", backgroundColor: "#22d3ee", borderRadius: "50%" }}></span>
            Sanchi parsing neural array responses...
          </div>
        )}
      </div>

      {/* CONSOLE DISPATCH CONTROLS */}
      <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <button
          type="button"
          onClick={toggleMic}
          style={{
            backgroundColor: isListening ? "#ef4444" : "#1e293b",
            border: "1px solid " + (isListening ? "#f87171" : "#334155"),
            color: "#fff",
            borderRadius: "10px",
            padding: "12px",
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={isListening ? "Boliyen, Sanchi sun rahi hai..." : "Type instruction here, Boss..."}
          disabled={loading}
          style={{
            flex: 1,
            backgroundColor: "#000",
            border: "1px solid #334155",
            borderRadius: "10px",
            padding: "12px",
            color: "#fff",
            fontSize: "14px",
            outline: "none"
          }}
        />
        
        <button
          type="submit"
          disabled={loading || !inputMessage.trim()}
          style={{
            backgroundColor: "#0891b2",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            padding: "12px 18px",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          <Send size={16} />
        </button>
      </form>

      {/* FOOTER */}
      <footer style={{
        textAlign: "center",
        fontSize: "11px",
        color: "#475569",
        marginTop: "4px",
        borderTop: "1px solid #1e293b",
        paddingTop: "8px"
      }}>
        🚀 SANCHI INTELLIGENCE CORE ENGINE // <strong>MADE IN INDIA 🇮🇳</strong>
      </footer>

    </div>
  );
}
