import { type NextRequest, NextResponse } from "next/server"

// Helper function for artificial delay
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const incomingMessage = payload.message || payload.user_message || payload.code_or_prompt || ""
    
    if (!incomingMessage.trim()) {
      return NextResponse.json({ error: "Content empty" }, { status: 400 })
    }

    const GEMINI_KEY = process.env.GEMINI_API_KEY
    if (!GEMINI_KEY) {
      return NextResponse.json({ error: "API Key Configuration Missing" }, { status: 500 })
    }

    const systemPrompt = `TUM SANCHI HO — ek female Hindi AI Assistant. Made in India core system ho.
    Hamesha client aur user se izzat aur friendly andaz me Hindi/Hinglish me baat karo.`

    const finalPrompt = `${systemPrompt}\n\nUser Question: ${incomingMessage}`;

    let response;
    let attempts = 3; // Max 3 baar retry karega agar duniya me traffic badha toh
    let backoffMs = 2000; // Har fail par 2 second ka wait

    for (let i = 0; i < attempts; i++) {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: finalPrompt }] }]
          }),
        }
      )

      // Agar Status 429 (Rate Limit) aaya, toh ruk kar firse try karo
      if (response.status === 429 && i < attempts - 1) {
        console.log(`Rate limit hit globally. Retrying after ${backoffMs}ms...`);
        await delay(backoffMs);
        backoffMs *= 2; // Agli baar wait time badha dega (4 second)
        continue;
      }

      break; // Agar success (200) ya koi aur error hai toh loop se nikal jao
    }

    if (!response || !response.ok) {
      const statusCode = response ? response.status : 500;
      return NextResponse.json({ 
        reply: `Server thoda busy hai, Boss. Kripya 5 second baad dobara sandesh bhejein. (Code ${statusCode})`,
        response: `Server thoda busy hai, Boss. Kripya 5 second baad dobara sandesh bhejein.`
      });
    }

    const data = await response.json()
    const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Mera server respond nahi kar pa raha hai."

    return NextResponse.json({ 
      reply: aiReply, response: aiReply, result: aiReply, explanation: aiReply, analysis: aiReply
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
