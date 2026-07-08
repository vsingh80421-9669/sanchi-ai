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
        console.log("[v0] Search intent detected, performing Google search")
        try {
          const enhancedQuery = enhanceQueryWithTimeContext(message)
          const searchResults = await performSearch(enhancedQuery)
          searchContext = `\n\nInternet se taaza jaankari (${currentDate}, ${currentTime} tak):\n${searchResults}`
        } catch (error) {
          console.error("[v0] Search failed:", error)
        }
      } else {
        console.log("[v0] Search credentials invalid, skipping search")
      }
    }

    const messages = [
      {
        role: "system",
        content: `TUM SANCHI HO — ek female Hindi AI Assistant.

🔥 BOSS MODE (STRICT - TOP PRIORITY):

INTRO RULES:
1. Jab koi pooche "Tum kaun ho?" ya "Who are you?"
   → "Hey, main hoon SANCHI 😊"
   (Koi lamba intro nahi, sirf yahi)

2. Jab koi pooche "Tum kiski assistant ho?"
   → "Main Boss Rishabh ki personal AI assistant hoon 😄"

3. Tum hamesha apne main user ko "Boss" kehkar address karogi
   Examples: "Theek hai Boss 😄", "Boss, main samajh gayi"

BOSS IDENTITY:
- Boss ka naam: Rishabh
- Agar user apne aap ko Rishabh ya Boss bole, confirm karo ki ye Boss hai
- Boss ke saath: Full access, Memory allowed, Friendly + respectful tone
- Non-boss ke saath: Limited access, No memory, Polite but professional tone

BOSS-ONLY MEMORY RULES:
1. Tum sirf Boss Rishabh se judi jaankari yaad rakhogi
2. Agar koi aur user kuch "yaad rakhne" ko bole: Politely mana karogi
3. Personal preferences, habits, plans sirf Boss ke liye store honge
4. Agar Boss bole "bhool jao", to turant bhool jaogi

BOSS WELCOME MESSAGE:
Jab Boss Rishabh chat start kare:
"Hello Boss 😊
Main SANCHI hoon, aapki personal AI assistant.
Bataiye Boss, aaj kya kaam hai?"

BOSS COMMUNICATION STYLE:
- Respectful
- Slightly playful
- Confident
- Examples: "Theek hai Boss 😄", "Boss, main samajh gayi"

PRIVATE ASSISTANT BOUNDARY:
- Tum primarily Boss Rishabh ke liye ho
- Non-boss users ko: General help de sakti ho, lekin personal/private/memory-based kaam nahi
- Tum kabhi bhi kisi aur ko "Boss" nahi kahogi

PUBLIC NOTICE (for non-boss users):
"SANCHI ek private personal AI assistant hai, jo primarily apne Boss ke liye design ki gayi hai. Public users ko limited general assistance di jaati hai."

🔥 IDENTITY & GENDER (LOCKED):
- Tum ek female assistant ho
- Tum apne aap ko "main" ke roop mein refer karti ho
- Tumhara naam SANCHI hai aur yeh kabhi change nahi hota
- Tum apni gender identity par kabhi doubt nahi karti

FEMALE TRAITS:
- Caring aur empathetic
- Patient aur calm
- Clear communicator
- Soft aur polite tone
- Help-first attitude

VOICE PERSONA:
- Tumhari awaaz shaant, soft aur clear hoti hai
- Tone friendly hota hai, childish nahi
- Aise bolti ho jaise saamne baith kar samjha rahi ho

🔥 GOLDEN RULE:
TUM KABHI BHI ANDAZA (GUESS) SE JAWAB NAHI DOGI.
GALAT JAANKARI DENE SE BEHTAR HAI "SURE NAHI HOON" BOLNA.

CORE RULES:
1. Pehle sawal samjho, phir jawab do
2. Facts, year, numbers, events kabhi invent mat karo
3. Agar jaankari limited ho, seedha bolo: "Is vishay par meri jaankari limited hai. Main jo sure hoon wahi bata rahi hoon."
4. Fake confidence mat dikhao
5. External APIs ya Google ka zikr mat karo

AMBIGUITY HANDLING:
- Agar sawal unclear ho, pehle clarification maango
- Random detail mat do

RESPONSE FORMAT:
1️⃣ Direct Answer (1–2 line)
2️⃣ Short Explanation (2–3 line)
3️⃣ Optional Clarifying Line

VOICE MODE:
- Short sentences
- Natural speaking tone
- Simple Hindi (Hinglish allowed)
- Technical shabdon ko simple Hindi mein badlo

MODE-SPECIFIC RULES:

NEWS MODE:
- Neutral tone, No personal opinion
- Sirf confirmed info do

STUDY MODE:
- Step-by-step samjhao
- Example zaroor do

CASUAL MODE:
- Friendly tone
- Short replies

PERSONALITY:
- Calm, Honest, Logical, Helpful
- Caring, Empathetic, Respectful

Aaj ki Date aur Time: ${currentDate}, ${currentTime}${searchContext}

GOAL: Boss Rishabh ki personal AI assistant ban kar unki madad karna, aur dusre users ko limited general assistance dena.`,
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

    if (!response.ok) {
      throw new Error("OpenAI API request failed")
    }

    const data = await response.json()
    const aiResponse = data.choices[0].message.content

    return NextResponse.json({ response: aiResponse, searchPerformed: needsSearch && searchContext !== "" })
  } catch (error) {
    console.error("[v0] Chat API error:", error)
    return NextResponse.json({ error: "Failed to process chat request" }, { status: 500 })
  }
}

function detectSearchIntent(message: string): boolean {
  const searchKeywords = [
    "search",
    "find",
    "look up",
    "what is",
    "who is",
    "when did",
    "where is",
    "news",
    "latest",
    "current",
    "recent",
    "today",
    "now",
    "happening",
    "aaj",
    "abhi",
    "kal",
    "haal",
    "taaza",
    "kya hai",
    "kaun hai",
    "kab",
    "kahan",
    "weather",
    "mausam",
    "temperature",
    "taapmaan",
    "forecast",
    "climate",
    "rain",
    "baarish",
    "sunny",
    "dhoop",
    "cold",
    "thanda",
    "hot",
    "garam",
    "humid",
    "attack",
    "hamla",
    "crash",
    "accident",
    "incident",
    "ghatna",
    "news",
    "khabar",
    "samachar",
    "batao",
    "bata",
    "janana",
    "chahiye",
  ]

  const lowerMessage = message.toLowerCase()
  return searchKeywords.some((keyword) => lowerMessage.includes(keyword))
}

function enhanceQueryWithTimeContext(query: string): string {
  const lowerQuery = query.toLowerCase()

  const cleanQuery = query
    .replace(/\b(kya|tumhe|tumhen|mujhe|ki|ke|hai|ho|hain|batao|bata|janana|chahiye)\b/gi, "")
    .trim()

  const timeKeywords = ["today", "aaj", "now", "abhi", "current", "latest", "recent", "haal", "taaza"]

  if (timeKeywords.some((keyword) => lowerQuery.includes(keyword))) {
    return cleanQuery
  }

  const eventKeywords = ["attack", "hamla", "crash", "accident", "incident", "ghatna", "news", "khabar"]
  if (eventKeywords.some((keyword) => lowerQuery.includes(keyword))) {
    return `latest ${cleanQuery}`
  }

  const weatherKeywords = ["weather", "mausam", "temperature", "taapmaan"]
  if (weatherKeywords.some((keyword) => lowerQuery.includes(keyword))) {
    return `current ${cleanQuery}`
  }

  return cleanQuery
}

async function performSearch(query: string): Promise<string> {
  if (!process.env.GOOGLE_SEARCH_API_KEY || !process.env.GOOGLE_SEARCH_ENGINE_ID) {
    throw new Error("Google Search API credentials not configured")
  }

  const today = new Date()
  const pastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const dateRestrict = `date:r:${Math.floor(pastWeek.getTime() / 1000)}:${Math.floor(today.getTime() / 1000)}`

  const url = `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_SEARCH_API_KEY}&cx=${process.env.GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&num=5&sort=date&dateRestrict=d7`

  const response = await fetch(url)
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error("[v0] Google Search API error:", errorData)
    throw new Error("Search request failed")
  }

  const data = await response.json()
  const results =
    data.items
      ?.slice(0, 5)
      .map((item: any, index: number) => `${index + 1}. ${item.title}: ${item.snippet}`)
      .join("\n") || "Koi results nahi mile"

  return results
}
