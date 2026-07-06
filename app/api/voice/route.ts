import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    const elevenLabsKey = process.env.ELEVENLABS_API_KEY

    // This prevents 401 errors from being logged
    return NextResponse.json(
      {
        useFallback: true,
        message: "Using browser speech synthesis",
      },
      { status: 200 },
    )

    /*
    // If no API key or key is clearly invalid, immediately return fallback
    if (!elevenLabsKey || elevenLabsKey.length < 20) {
      return NextResponse.json(
        {
          useFallback: true,
          message: "Using browser speech synthesis",
        },
        { status: 200 },
      )
    }

    const voiceId = "n8agU3KLt1Yttvrx1mYA"

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": elevenLabsKey,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
        signal: controller.signal,
      }).catch(() => null)

      clearTimeout(timeoutId)

      if (!response.ok || response.status !== 200) {
        return NextResponse.json(
          {
            useFallback: true,
            message: "Using browser speech synthesis",
          },
          { status: 200 },
        )
      }

      const audioBuffer = await response.arrayBuffer()

      return new NextResponse(audioBuffer, {
        headers: {
          "Content-Type": "audio/mpeg",
        },
      })
    } catch {
      return NextResponse.json(
        {
          useFallback: true,
          message: "Using browser speech synthesis",
        },
        { status: 200 },
      )
    }
    */
  } catch (error) {
    return NextResponse.json(
      {
        useFallback: true,
        message: "Using browser speech synthesis",
      },
      { status: 200 },
    )
  }
}
