"use client";

import React, { useState } from "react";

export default function IntegratedSaaSPlatform() {
  // Modes: 'owner' (Personal - Sanchi) or 'client' (Commercial - Zephyr)
  const [appMode, setAppMode] = useState<"owner" | "client">("owner");
  const [activeModule, setActiveModule] = useState<string>("dashboard");
  const [inputValue, setInputValue] = useState<string>("");
  const [secondaryInput, setSecondaryInput] = useState<string>(""); // For options/history
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Simulated internal lists for Notes and Reminders panels
  const [notes, setNotes] = useState<string[]>(["Zombie project script outline", "Vartman visualization technique routine"]);
  const [reminders, setReminders] = useState<string[]>(["Check Vercel build status", "Sync with Tejasviraj for design review"]);

  // API handler that calls the routes you created in the app/api folder
  const handleApiCall = async (endpoint: string, payload: object) => {
    setLoading(true);
    setApiResponse(null);
    try {
      const res = await fetch(`/api/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setApiResponse(data);
    } catch (error) {
      setApiResponse({ status: "error", message: "Failed to communicate with AI model" });
    } finally {
      setLoading(false);
    }
  };

  const currentAiName = appMode === "owner" ? "Sanchi AI" : "Zephyr AI";

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${appMode === "owner" ? "bg-slate-900 text-slate-100" : "bg-zinc-950 text-zinc-100"}`}>
      
      {/* HEADER SECTION */}
      <header className="border-b border-slate-800 p-4 flex justify-between items-center shadow-md">
        <div>
          <h1 className="text-2xl font-black tracking-wider text-emerald-400">
            {appMode === "owner" ? "SANCHI AI // INTERNAL" : "ZEPHYR CORE INTERACTIVE"}
          </h1>
          <p className="text-xs text-slate-400">Viraaj Tech Enterprise Infrastructure</p>
        </div>
        
        {/* Secret Toggle Switch for Meetings */}
        <button 
          onClick={() => setAppMode(appMode === "owner" ? "client" : "owner")}
          className="px-4 py-2 rounded text-xs font-bold uppercase tracking-widest bg-emerald-600 hover:bg-emerald-500 text-white shadow transition-all"
        >
          Active View: {appMode === "owner" ? "Owner (Private)" : "Client (Demo)"}
        </button>
      </header>

      <div className="flex flex-col md:flex-row min-h-[calc(min-h-screen-73px)]">
        
        {/* SIDEBAR NAVIGATION PANEL */}
        <aside className="w-full md:w-64 border-r border-slate-800 p-4 flex flex-col gap-2">
          <div className="text-xs font-semibold text-slate-500 uppercase px-2 mb-2">Core System</div>
          <button onClick={() => setActiveModule("dashboard")} className={`w-full text-left px-3 py-2 rounded text-sm font-medium transition-colors ${activeModule === "dashboard" ? "bg-slate-800 text-emerald-400" : "hover:bg-slate-800"}`}>
            📊 System Dashboard
          </button>
          <button onClick={() => setActiveModule("notes")} className={`w-full text-left px-3 py-2 rounded text-sm font-medium transition-colors ${activeModule === "notes" ? "bg-slate-800 text-emerald-400" : "hover:bg-slate-800"}`}>
            📝 Notes & Architecture
          </button>
          <button onClick={() => setActiveModule("reminders")} className={`w-full text-left px-3 py-2 rounded text-sm font-medium transition-colors ${activeModule === "reminders" ? "bg-slate-800 text-emerald-400" : "hover:bg-slate-800"}`}>
            🔔 Ops Reminders
          </button>

          <div className="text-xs font-semibold text-slate-500 uppercase px-2 mt-4 mb-2">AI Suite Modules</div>
          <button onClick={() => { setActiveModule("programming"); setApiResponse(null); }} className={`w-full text-left px-3 py-2 rounded text-sm font-medium transition-colors ${activeModule === "programming" ? "bg-slate-800 text-emerald-400" : "hover:bg-slate-800"}`}>
            💻 Programming Buddy
          </button>
          <button onClick={() => { setActiveModule("research"); setApiResponse(null); }} className={`w-full text-left px-3 py-2 rounded text-sm font-medium transition-colors ${activeModule === "research" ? "bg-slate-800 text-emerald-400" : "hover:bg-slate-800"}`}>
            🔬 Research Analyzer
          </button>
          <button onClick={() => { setActiveModule("education"); setApiResponse(null); }} className={`w-full text-left px-3 py-2 rounded text-sm font-medium transition-colors ${activeModule === "education" ? "bg-slate-800 text-emerald-400" : "hover:bg-slate-800"}`}>
            🎓 Education Coach
          </button>
          <button onClick={() => { setActiveModule("translate"); setApiResponse(null); }} className={`w-full text-left px-3 py-2 rounded text-sm font-medium transition-colors ${activeModule === "translate" ? "bg-slate-800 text-emerald-400" : "hover:bg-slate-800"}`}>
            🌐 Local Context Translator
          </button>
          <button onClick={() => { setActiveModule("youtube"); setApiResponse(null); }} className={`w-full text-left px-3 py-2 rounded text-sm font-medium transition-colors ${activeModule === "youtube" ? "bg-slate-800 text-emerald-400" : "hover:bg-slate-800"}`}>
            🎥 Content Recommendation
          </button>
        </aside>

        {/* MAIN WORKSPACE DISPLAY */}
        <main className="flex-1 p-6">
          
          {/* 1. DASHBOARD PANEL */}
          {activeModule === "dashboard" && (
            <div className="space-y-6">
              <div className="bg-slate-800/40 border border-slate-800 p-6 rounded-lg">
                <h2 className="text-xl font-bold text-white mb-2">System Status Console</h2>
                <p className="text-sm text-slate-400">
                  {appMode === "owner" 
                    ? "Welcome back Vivek. System running in complete stealth node. Internal core initialized as Sanchi AI." 
                    : "Welcome Client. System parameters verified. Global multi-model modules linked successfully under Zephyr AI Engine."}
                </p>
                <div className="mt-4 flex gap-4 text-xs font-mono text-emerald-400">
                  <span>● Core Status: Active</span>
                  <span>● Routes Configured: 11 API Endpoints</span>
                </div>
              </div>

              {/* Voice Visualizer Mock Integration */}
              <div className="border border-slate-800 p-6 rounded-lg bg-slate-900 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500 flex items-center justify-center mb-4 animate-pulse">
                  <span className="text-xl">🎙️</span>
                </div>
                <h3 className="font-bold text-sm">Voice Synthesis Visualizer Engine</h3>
                <p className="text-xs text-slate-500 mt-1">Listening parameters active. Click space to prompt via voice array.</p>
              </div>
            </div>
          )}

          {/* 2. NOTES PANEL */}
          {activeModule === "notes" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold">Project Notes File System</h2>
              <div className="grid gap-2">
                {notes.map((note, index) => (
                  <div key={index} className="p-3 bg-slate-800 rounded border border-slate-700 text-sm font-mono">
                    {note}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. REMINDERS PANEL */}
          {activeModule === "reminders" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold">Operational Reminders Log</h2>
              <div className="grid gap-2">
                {reminders.map((rem, index) => (
                  <div key={index} className="p-3 bg-slate-800/60 rounded border border-slate-700/60 text-sm flex items-center gap-2">
                    <span className="text-emerald-500">✓</span> {rem}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. PROGRAMMING BUDDY PANEL */}
          {activeModule === "programming" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold">💻 Programming Buddy & Architect Suite</h2>
              <input 
                type="text" 
                placeholder="Target Language (e.g., python, typescript)" 
                value={secondaryInput}
                onChange={(e) => setSecondaryInput(e.target.value)}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-sm"
              />
              <textarea 
                rows={5} 
                placeholder="Paste your source code logic or build requirement prompt here..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-sm font-mono"
              />
              <button 
                onClick={() => handleApiCall("programming", { code_or_prompt: inputValue, language: secondaryInput || "python" })}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-sm font-bold transition-all"
              >
                Execute Analysis
              </button>
            </div>
          )}

          {/* 5. RESEARCH ANALYZER PANEL */}
          {activeModule === "research" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold">🔬 Scientific Research & Hypothesis Data Engine</h2>
              <textarea 
                rows={4} 
                placeholder="Enter scientific queries, concepts to break down, or technical data sheets..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-sm"
              />
              <button 
                onClick={() => handleApiCall("research", { query: inputValue })}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-sm font-bold"
              >
                Analyze Hypothesis
              </button>
            </div>
          )}

          {/* 6. EDUCATION TUTOR PANEL */}
          {activeModule === "education" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold">🎓 Dynamic AI Education Coach</h2>
              <textarea 
                rows={4} 
                placeholder="Explain what concept? (e.g., quantum mechanics, backend data structures)..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-sm"
              />
              <button 
                onClick={() => handleApiCall("education", { query: inputValue })}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-sm font-bold"
              >
                Format Lesson Structure
              </button>
            </div>
          )}

          {/* 7. TRANSLATOR PANEL */}
          {activeModule === "translate" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold">🌐 Local Cultural Slang Context Translator</h2>
              <input 
                type="text" 
                placeholder="Target Language (e.g., Spanish, German, Hindi)" 
                value={secondaryInput}
                onChange={(e) => setSecondaryInput(e.target.value)}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-sm"
              />
              <textarea 
                rows={3} 
                placeholder="Enter formal or informal conversational string data..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-sm"
              />
              <button 
                onClick={() => handleApiCall("translate", { text: inputValue, target_language: secondaryInput })}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-sm font-bold"
              >
                Generate Translation Context
              </button>
            </div>
          )}

          {/* 8. YOUTUBE RECOMMENDER PANEL */}
          {activeModule === "youtube" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold">🎥 YouTube Algorithm Matrix Simulator</h2>
              <input 
                type="text" 
                placeholder="Watch history context array (comma separated)" 
                value={secondaryInput}
                onChange={(e) => setSecondaryInput(e.target.value)}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-sm"
              />
              <textarea 
                rows={3} 
                placeholder="Current search interest focus string..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-sm"
              />
              <button 
                onClick={() => handleApiCall("youtube-recommender", { 
                  user_watch_history: secondaryInput.split(","), 
                  current_search: inputValue 
                })}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-sm font-bold"
              >
                Synthesize Retention Strategy
              </button>
            </div>
          )}

          {/* CENTRAL INTERACTIVE RESPONSE LAYER */}
          {loading && (
            <div className="mt-6 p-4 rounded bg-slate-800/20 text-sm font-mono animate-pulse text-emerald-400 border border-emerald-500/20">
              🔄 {currentAiName} parsing data arrays... Processing query matrix...
            </div>
          )}

          {apiResponse && (
            <div className="mt-6 p-6 rounded-lg bg-slate-900 border border-slate-800">
              <div className="text-xs uppercase font-mono tracking-widest text-emerald-400 mb-2 font-bold">
                Output Stream from {currentAiName}
              </div>
              <pre className="text-sm font-mono whitespace-pre-wrap leading-relaxed text-slate-300 bg-slate-950 p-4 rounded border border-slate-850">
                {apiResponse.code || apiResponse.explanation || apiResponse.translated_text || apiResponse.recommendations || apiResponse.result || JSON.stringify(apiResponse, null, 2)}
              </pre>
            </div>
          )}

        </main>
      </div>
    </div>
  );
        }
              
