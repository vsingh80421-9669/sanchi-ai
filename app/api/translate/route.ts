import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, target_language } = body;

    if (!text || !target_language) {
      return NextResponse.json({ status: "error", message: "Text and target language are required" }, { status: 400 });
    }

    const GEMINI_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_KEY) {
      return NextResponse.json({ status: "error", message: "API key missing" }, { status: 500 });
    }

    const prompt = `Translate the following text perfectly into ${target_language} keeping the local cultural context and slang intact: ${text}`;

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
      translated_text: reply,
    });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
