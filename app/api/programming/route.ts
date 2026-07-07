import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code_or_prompt, language = "python" } = body;

    if (!code_or_prompt) {
      return NextResponse.json({ status: "error", message: "Code or prompt is required" }, { status: 400 });
    }

    const GEMINI_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_KEY) {
      return NextResponse.json({ status: "error", message: "API key missing" }, { status: 500 });
    }

    const prompt = `Act as an expert software architect. Write, optimize, or fix this code in language '${language}':\n${code_or_prompt}\nProvide clean code and execution details.`;

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
      module: "Programming Agent",
      code: reply,
    });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
