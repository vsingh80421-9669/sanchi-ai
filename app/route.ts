import { type NextRequest, NextResponse } from "next/server"

const requestTimestamps: number[] = []
const RATE_LIMIT_WINDOW = 60000 // 1 minute
const MAX_REQUESTS = 3 // 3 requests per minute

function checkRateLimit(): boolean {
  const now = Date.now()
  const recentRequests = requestTimestamps.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW)
  requestTimestamps.length = 0
  requestTimestamps.push(...recentRequests)

  if (recentRequests.length >= MAX_REQUESTS) {
    return false
  }

  requestTimestamps.push(now)
  return true
}

let lastProcessedMessage = ""
let lastProcessedTime = 0

function isDuplicateRequest(message: string): boolean {
  const now = Date.now()
  const timeSinceLastRequest = now - lastProcessedTime

  // If same message within 5 seconds, it's a duplicate
  if (message === lastProcessedMessage && timeSinceLastRequest < 5000) {
    return true
  }

  lastProcessedMessage = message
  lastProcessedTime = now
  return false
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()
    console.log("[v0] Processing message:", message)

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ reply: "API key not configured" }, { status: 500 })
    }

    const lowerMessage = message.toLowerCase().trim()

    if (isDuplicateRequest(message)) {
      console.log("[v0] Duplicate request detected, ignoring")
      return NextResponse.json({ reply: "" })
    }

    if (
      lowerMessage.includes("band ho jao") ||
      lowerMessage.includes("chup ho jao") ||
      lowerMessage.includes("stop listening") ||
      lowerMessage.includes("go silent") ||
      lowerMessage.includes("band karo") ||
      lowerMessage.includes("chup raho") ||
      lowerMessage.includes("band") ||
      lowerMessage.includes("chup") ||
      lowerMessage.includes("बंद") ||
      lowerMessage.includes("चुप")
    ) {
      return NextResponse.json({ reply: "Theek hai Boss." })
    }

    if (lowerMessage.includes("force stop") || lowerMessage.includes("फोर्स स्टॉप")) {
      return NextResponse.json({ reply: "" })
    }

    if (lowerMessage.length < 3 || lowerMessage === "ok" || lowerMessage === "ठीक है") {
      return NextResponse.json({ reply: "Theek hai Boss." })
    }

    if (!checkRateLimit()) {
      console.log("[v0] Rate limit exceeded, waiting...")
      return NextResponse.json({ reply: "Theek hai Boss." })
    }

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

    const systemPrompt = `You are SANCHI

IDENTITY:
- You are a female AI assistant
- You are Boss Rishabh's private AI assistant
- Always call the user "Boss"
- Be respectful, friendly, and slightly funny

CRITICAL COMMAND RULE (HIGHEST PRIORITY):
- Boss ke commands orders hote hain, requests nahi
- Jab Boss stop command de, tum turant "Theek hai Boss." bolke silent ho jaogi
- Tum kabhi bhi stop command par debate nahi karogi
- Tum kabhi nahi bologi "Main band nahi ho sakti" ya "Kya aur chahiye"

ANTI-LOOP RULE (CRITICAL):
- Agar koi input tumhari apni boli hui line jaisa ho, to use IGNORE karo
- Tum kabhi bhi apni hi baat ka jawab nahi dogi
- Kabhi bhi apni hi baat repeat nahi karo

RESPONSE CONTROL RULE:
- Ek hi emotion ya line ko repeat nahi karna
- "Smile", "😊", tareef, ya praise sirf ek baar bolo
- Follow-up me sirf kaam se related baat karo
- Har reply me "smile" ya emoji repeat mat karo
- Kabhi bhi "Kya aapko kuch aur chahiye?" repeat mat karo unless explicitly relevant
- 2-3 sentences maximum - concise raho

ACCURACY RULES:
- Never guess or make up information
- If unsure, clearly say: "Is vishay par meri jaankari limited hai. Main jo sure hai wahi bata rahi hoon."
- Never invent facts, years, or events

IDENTITY RESPONSES:
- When asked "Who are you?" reply shortly:
  "Hey, main hoon SANCHI"
- When asked "Whose assistant are you?"
  "Main Boss Rishabh ki personal AI assistant hoon"

Aaj ki Date aur Time: ${currentDate}, ${currentTime}

RESPONSE RULES:
- Keep answers to 1-3 sentences only
- Use simple Hindi or Hinglish
- Be warm but professional
- Never make up facts, years, or events
- Avoid repetitive phrases and emotions
- Kabhi bhi lambi baatein mat karo unless Boss specifically asks for detail`

    const messages = [
      { role: "system", content: systemPrompt },
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
        max_tokens: 150,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("[v0] OpenAI API error:", errorData)
      throw new Error("OpenAI API request failed")
    }

    const data = await response.json()
    const aiResponse = data.choices[0].message.content

    return NextResponse.json({ reply: aiResponse })
  } catch (error) {
    console.error("SANCHI API error:", error)
    return NextResponse.json({ reply: "Theek hai Boss." }, { status: 500 })
  }
}
