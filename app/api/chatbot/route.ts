import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    
    // 🟢 FIX 1: Frontend format aur backend format dono ko check karo taaki khali request na jaye!
    const userMessage = payload.user_message || payload.message || ""
    const systemInstruction = payload.system_instruction || "You are a helpful AI assistant."

    if (!userMessage.trim()) {
      return NextResponse.json({ error: "Message content cannot be empty" }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 })
    }

    // Google Gemini API Request
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userMessage }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] }
        }),
      }
    )

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      console.error("Gemini API Error details:", errData)
      throw new Error("Gemini API request failed")
    }

    const data = await response.json()
    const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated."

    // 🟢 FIX 2: Universal Response taaki frontend kisi bhi key par crash na ho
    return NextResponse.json({ 
      reply: aiReply,
      response: aiReply
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
