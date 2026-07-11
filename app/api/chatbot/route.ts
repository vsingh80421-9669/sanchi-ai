import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()

    // Frontend ke saare input formats ko ek sath catch karo
    const incomingMessage = payload.message || payload.user_message || payload.code_or_prompt || ""
    
    if (!incomingMessage.trim()) {
      return NextResponse.json({ error: "Message content cannot be empty, Boss." }, { status: 400 })
    }

    const GEMINI_KEY = process.env.GEMINI_API_KEY
    if (!GEMINI_KEY) {
      return NextResponse.json({ error: "Gemini API key not configured in Vercel" }, { status: 500 })
    }

    // Dynamic Search Detection Layer
    const needsSearch = detectSearchIntent(incomingMessage)
    let searchContext = ""
    const currentDate = new Date().toLocaleDateString("hi-IN", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    })
    const currentTime = new Date().toLocaleTimeString("hi-IN", {
      hour: "2-digit", minute: "2-digit",
    })

    if (needsSearch && process.env.GOOGLE_SEARCH_API_KEY && process.env.GOOGLE_SEARCH_ENGINE_ID) {
      try {
        const enhancedQuery = incomingMessage.replace(/\b(kya|tumhe|mujhe|hai|ho|batao)\b/gi, "").trim()
        const url = `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_SEARCH_API_KEY}&cx=${process.env.GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(enhancedQuery)}&num=3`
        const searchRes = await fetch(url)
        if (searchRes.ok) {
          const searchData = await searchRes.json()
          searchContext = "\n\nTaaza Internet Context:\n" + searchData.items?.slice(0, 3).map((item: any) => item.snippet).join("\n")
        }
      } catch (e) {
        console.error("Search failed:", e)
      }
    }

    const systemPrompt = `TUM SANCHI HO — ek female Hindi AI Assistant.
    INTRO RULES:
    1. Jab koi pooche "Tum kaun ho?" -> "Hey, main hoon SANCHI 😊"
    2. Jab koi pooche "Tum kiski assistant ho?" -> "Main Boss Rishabh ki personal AI assistant hoon 😄"
    3. Tum hamesha apne main user ko "Boss" kehkar address karogi.
    4. Tum hamesha Hindi aur Hinglish me hi jawab dogi, ekdum friendly aur helpful andaz me. Made in India core system ho.
    
    Aaj ki Date aur Time: ${currentDate}, ${currentTime}${searchContext}`

    // HIT THE WORKING GEMINI API DIRECTLY
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\nUser Question: ${incomingMessage}` }] }]
        }),
      }
    )

    if (!response.ok) throw new Error("Gemini Engine Request Failed")

    const data = await response.json()
    const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Mera server respond nahi kar pa raha hai, Boss."

    // Universal keys return karo taaki frontend panel ka dropdown crash na ho
    return NextResponse.json({ 
      reply: aiReply, 
      response: aiReply,
      result: aiReply,
      explanation: aiReply,
      analysis: aiReply
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

function detectSearchIntent(message: string): boolean {
  const searchKeywords = ["search", "find", "news", "latest", "current", "aaj", "abhi", "mausam", "temperature", "batao"]
  const lowerMessage = message.toLowerCase()
  return searchKeywords.some((keyword) => lowerMessage.includes(keyword))
}
