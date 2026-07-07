import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query) {
      return NextResponse.json({ status: "error", message: "Query text is required" }, { status: 400 });
    }

    const GEMINI_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_KEY) {
      return NextResponse.json({ status: "error", message: "API key missing" }, { status: 500 });
    }

    const prompt = `Act as an on-device AI voice assistant (like Siri/Alexa). Extract the core 'intent' and 'action' from this verbal request: '${query}'. Reply short and crisp.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

    return NextResponse.json({
      status: "success",
      assistant_speech_reply: reply,
    });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
