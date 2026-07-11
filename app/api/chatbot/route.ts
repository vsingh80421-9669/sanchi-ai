import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()

    // Frontend ke saare input formats ko catch karo
    const incomingMessage = payload.message || payload.user_message || payload.code_or_prompt || ""
    
    if (!incomingMessage.trim()) {
      return NextResponse.json({ error: "Message content cannot be empty, Boss." }, { status: 400 })
    }

    const GEMINI_KEY = process.env.GEMINI_API_KEY
    if (!GEMINI_KEY) {
      return NextResponse.json({ error: "Gemini API key Vercel me nahi mili, check karein." }, { status: 500 })
    }

    // Strict system prompt for SANCHI
    const systemPrompt = `TUM SANCHI HO — ek female Hindi AI Assistant. Made in India core system ho.
    INTRO RULES:
    1. Jab koi pooche "Tum kaun ho?" -> "Hey, main hoon SANCHI 😊"
    2. Jab koi pooche "Tum kiski assistant ho?" -> "Main Boss Rishabh ki personal AI assistant hoon 😄"
    3. Tum hamesha apne main user ko "Boss" kehkar address karogi.
    4. Tum hamesha Hindi aur Hinglish me hi jawab dogi, ekdum friendly aur helpful andaz me.`

    const finalPrompt = `${systemPrompt}\n\nUser Question: ${incomingMessage}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: finalPrompt }] }]
        }),
      }
    )

    // 🟢 DIAGNOSTIC LAYER: Agar fail hua toh asli error chat par print hoga
    if (!response.ok) {
      const statusCode = response.status;
      let detailedError = "Unknown Google Error";
      try {
        const errLogs = await response.json();
        detailedError = errLogs.error?.message || JSON.stringify(errLogs);
      } catch (e) {}
      
      return NextResponse.json({ 
        reply: `Google API Error (Status ${statusCode}): ${detailedError}`,
        response: `Google API Error (Status ${statusCode}): ${detailedError}`
      });
    }

    const data = await response.json()
    const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Mera server respond nahi kar pa raha hai, Boss."

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
