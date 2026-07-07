import { NextResponse } from "next/server";

// ----------------------------------------------------------------------
// 1. SCIENTIFIC RESEARCH & DATA ANALYZER (Next.js Version)
// ----------------------------------------------------------------------
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query) {
      return NextResponse.json(
        { status: "error", message: "Query is required" },
        { status: 400 }
      );
    }

    const GEMINI_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_KEY) {
      return NextResponse.json(
        { status: "error", message: "Gemini API key missing in environment variables" },
        { status: 500 }
      );
    }

    // Gemini API Call Setup
    const prompt = `Act as a world-class scientist and research assistant. Analyze, explain concepts, or formulate a hypothesis for: ${query}. Provide scientific citations/references if possible.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI Engine";

    return NextResponse.json({
      status: "success",
      module: "Scientific Research",
      result: reply,
    });

  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}
