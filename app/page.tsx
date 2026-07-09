"use client";

import React, { useState, useEffect } from "react";

export default function SanchiUltimateDashboard() {
  // Identities: Owner (Sanchi AI) vs Client (Zephyr AI)
  const [appMode, setAppMode] = useState<"owner" | "client">("owner");
  const [selectedModule, setSelectedModule] = useState<string>("chatbot");
  const [inputMessage, setInputMessage] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<Array<{ sender: string; text: string }>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const currentAiName = appMode === "owner" ? "Sanchi AI" : "Zephyr AI";

  // Voice Function
  const speakText = (text: string) => {
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

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  // Main API Call handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg = inputMessage;
    setChatHistory((prev) => [...prev, { sender: "user", text: userMsg }]);
    setInputMessage("");
    setLoading(true);

    // Dynamic Payload Builder - Fully Fixed for Exact Endpoints
    let payload: any = { ai_provider: "gemini" };
    if (selectedModule === "chatbot") {
      payload.system_instruction = "You are a helpful AI assistant.";
      payload.user_message = userMsg;
    } else if (selectedModule === "programming") {
      payload.code_or_prompt = userMsg;
      payload.language = "python";
    } else if (selectedModule === "decision-maker") {
      payload.scenario = userMsg;
      // Dyanmic options extracted via split logic if user inputs comma, else sets default array
      payload.options = userMsg.includes(",") ? userMsg.split(",") : ["Yes", "No"];
    } else if (selectedModule === "translate") {
      payload.text = userMsg;
      payload.target_language = "English";
    } else if (selectedModule === "youtube-recommender") {
      payload.user_watch_history = ["Cinematic Editing", "Coding"];
      payload.current_search = userMsg;
    } else {
      payload.query = userMsg;
    }

    try {
      const res = await fetch(`/api/${selectedModule}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      
      let aiReply = data.reply || data.result || data.explanation || data.code || data.analysis || data.translated_text || data.assistant_speech_reply || JSON.stringify(data);
      
      if (typeof aiReply === "object") aiReply = JSON.stringify(aiReply);

      setChatHistory((prev) => [...prev, { sender: "ai", text: aiReply }]);
      speakText(aiReply);

    } catch (error) {
      setChatHistory((prev) => [...prev, { sender: "ai", text: "System Error: Connection failed." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-all duration-300 ${appMode === "owner" ? "bg-slate-950 text-slate-100" : "bg-neutral-950 text-neutral-100"}`}>
      
      {/* HEADER PLATFORM */}
      <header className="border-b border-slate-800 p-4 flex justify-between items-center bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div>
          <h1 className="text-xl font-black tracking-widest text-cyan-400">
            {appMode === "owner" ? "🛡️ SANCHI ENGINE v5.2" : "⚡ ZEPHYR ENTERPRISE AI"}
          </h1>
          <p className="text-xs text-slate-400 font-mono">Viraaj Tech Core Systems Inc.</p>
        </div>

        <button
          onClick={() => {
            setAppMode(appMode === "owner" ? "client" : "owner");
            if (typeof window !== "undefined") window.speechSynthesis.cancel();
          }}
          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded text-xs font-bold tracking-wider uppercase transition-all shadow-lg"
        >
          Mode: {appMode === "owner" ? "Owner (Sanchi)" : "Client (Zephyr)"}
        </button>
      </header>

      {/* CORE WORKSPACE */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col min-h-[calc(100vh-73px)]">
        
        {/* MODULE SELECTOR */}
        <div className="mb-4 bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row gap-3 items-center justify-between">
          <label className="text-sm font-bold text-slate-300 font-mono">Select Target Engine Route:</label>
          <select
            value={selectedModule}
            onChange={(e) => {
              setSelectedModule(e.target.value);
              setChatHistory([]);
            }}
            className="bg-slate-950 border border-slate-700 text-cyan-400 text-sm rounded-lg p-2.5 focus:ring-cyan-500 focus:border-cyan-500 font-medium"
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

        {/* CHAT LOG VIEW */}
        <div className="flex-1 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 overflow-y-auto mb-4 min-h-[350px] max-h-[500px] flex flex-col gap-4 shadow-inner">
          {chatHistory.length === 0 && (
            <div className="text-center my-auto space-y-2">
              <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center border text-xl ${isSpeaking ? "animate-bounce bg-cyan-500/20 border-cyan-400 text-cyan-400" : "bg-slate-800 border-slate-700"}`}>
                {isSpeaking ? "🔊" : "🤖"}
              </div>
              <p className="text-sm text-slate-400 font-mono">
                {appMode === "owner" 
                  ? "System running in stealth. State your directive, Vivek." 
                  : "Welcome. Select an AI operation module above to begin engine validation."}
              </p>
            </div>
          )}

          {chatHistory.map((msg, i) => (
            <div key={i} className={`flex flex-col max-w-[80%] ${msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"}`}>
              <span className="text-[10px] font-mono text-slate-500 mb-1 px-1 uppercase tracking-wider">
                {msg.sender === "user" ? "Authorized Owner" : currentAiName}
              </span>
              <div className={`p-3 rounded-2xl text-sm leading-relaxed ${msg.sender === "user" ? "bg-cyan-600 text-white rounded-tr-none shadow-md" : "bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/60"}`}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex mr-auto items-center gap-2 text-xs font-mono text-cyan-400 animate-pulse bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span>⚡ {currentAiName} parsing database arrays...</span>
            </div>
          )}
        </div>

        {/* CONSOLE INPUT */}
        <form onSubmit={handleSendMessage} className="flex gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800 shadow-xl">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={loading ? "Processing query array..." : `Prompt ${currentAiName} on routing node...`}
            disabled={loading}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 font-mono disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold px-5 py-2.5 rounded-lg text-sm transition-all font-mono shadow-md"
          >
            EXECUTE
          </button>
        </form>

        {isSpeaking && (
          <div className="mt-2 text-center">
            <button 
              type="button"
              onClick={() => { if(typeof window !== 'undefined') window.speechSynthesis.cancel(); setIsSpeaking(false); }}
              className="text-[11px] font-mono font-bold text-rose-400 hover:text-rose-300 bg-rose-950/30 border border-rose-900/50 px-3 py-1 rounded-full animate-pulse"
            >
              ■ Mute Audio Stream
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
