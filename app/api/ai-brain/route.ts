import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()

    // 🟢 FIX 1: Frontend ke saare variable formats (message, user_message, code_or_prompt) ko accept karo
    const incomingMessage = payload.message || payload.user_message || payload.code_or_prompt || ""
    const conversationHistory = payload.conversationHistory || []

    if (!incomingMessage.trim()) {
      return NextResponse.json({ error: "Message content cannot be empty, Boss." }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    // 📡 Automatic Search Intent Detection
    const needsSearch = detectSearchIntent(incomingMessage)
    let searchContext = ""
    const currentDate = new Date().toLocaleDateString("hi-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    const currentTime = new Date().toLocaleTimeString("hi-IN", {
      hour: "2-digit",
      minute: "2-digit",
    })

    if (needsSearch && process.env.GOOGLE_SEARCH_API_KEY && process.env.GOOGLE_SEARCH_ENGINE_ID) {
      const apiKeyValid = process.env.GOOGLE_SEARCH_API_KEY.length > 20
      const cxValid = process.env.GOOGLE_SEARCH_ENGINE_ID.includes(":")

      if (apiKeyValid && cxValid) {
        try {
          const enhancedQuery = enhanceQueryWithTimeContext(incomingMessage)
          const searchResults = await performSearch(enhancedQuery)
          searchContext = `\n\nInternet se taaza jaankari (${currentDate}, ${currentTime} tak):\n${searchResults}`
        } catch (error) {
          console.error("Search failed:", error)
        }
      }
    }

    const messages = [
      {
        role: "system",
        content: `TUM SANCHI HO — ek female Hindi AI Assistant.
        INTRO RULES:
        1. Jab koi pooche "Tum kaun ho?" -> "Hey, main hoon SANCHI 😊"
        2. Jab koi pooche "Tum kiski assistant ho?" -> "Main Boss Rishabh ki personal AI assistant hoon 😄"
        3. Tum hamesha apne main user ko "Boss" kehkar address karogi.
        4. Tum hamesha Hindi aur Hinglish me hi jawab dogi, ekdum friendly andaz me.
        
        GOLDEN RULE: TUM KABHI BHI ANDAZA (GUESS) SE JAWAB NAHI DOGI.
        Aaj ki Date aur Time: ${currentDate}, ${currentTime}${searchContext}`
      },
      ...conversationHistory,
      { role: "user", content: incomingMessage },
    ]

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.7,
        max_tokens: 400,
      }),
    })

    if (!response.ok) throw new Error("OpenAI API request failed")

    const data = await response.json()
    const aiResponse = data.choices[0].message.content

    // 🟢 FIX 2: Universal Response bhej rahe hain taaki frontend kisi bhi dropdown par fise na!
    return NextResponse.json({ 
      reply: aiResponse, 
      response: aiResponse,
      searchPerformed: needsSearch && searchContext !== "" 
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

function enhanceQueryWithTimeContext(query: string): string {
  return query.replace(/\b(kya|tumhe|mujhe|hai|ho|batao)\b/gi, "").trim()
}

async function performSearch(query: string): Promise<string> {
  if (!process.env.GOOGLE_SEARCH_API_KEY || !process.env.GOOGLE_SEARCH_ENGINE_ID) {
    throw new Error("Google Search API credentials not configured")
  }
  const url = `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_SEARCH_API_KEY}&cx=${process.env.GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&num=5`
  const response = await fetch(url)
  if (!response.ok) throw new Error("Search request failed")
  const data = await response.json()
  return data.items?.slice(0, 5).map((item: any, index: number) => `${index + 1}. ${item.title}: ${item.snippet}`).join("\n") || "No results found"
}
