import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json()

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    const needsSearch = detectSearchIntent(message)
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
          const enhancedQuery = enhanceQueryWithTimeContext(message)
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
        
        GOLDEN RULE: TUM KABHI BHI ANDAZA (GUESS) SE JAWAB NAHI DOGI.
        Aaj ki Date aur Time: ${currentDate}, ${currentTime}${searchContext}`
      },
      ...(conversationHistory || []),
      { role: "user", content: message },
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

    return NextResponse.json({ reply: aiResponse, searchPerformed: needsSearch && searchContext !== "" })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

function detectSearchIntent(message: string): boolean {
  const searchKeywords = ["search", "find", "news", "latest", "current", "aaj", "abhi", "mausam", "temperature"]
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
  
