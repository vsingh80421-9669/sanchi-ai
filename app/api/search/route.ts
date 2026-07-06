import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!process.env.GOOGLE_SEARCH_API_KEY || !process.env.GOOGLE_SEARCH_ENGINE_ID) {
      return NextResponse.json({ error: "Google Search API not configured" }, { status: 500 })
    }

    const url = `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_SEARCH_API_KEY}&cx=${process.env.GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&num=3`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error("Google Search API request failed")
    }

    const data = await response.json()
    const results =
      data.items?.slice(0, 3).map((item: any) => ({
        title: item.title,
        snippet: item.snippet,
        link: item.link,
      })) || []

    return NextResponse.json({ results })
  } catch (error) {
    console.error("[v0] Search API error:", error)
    return NextResponse.json({ error: "Failed to process search request" }, { status: 500 })
  }
}
