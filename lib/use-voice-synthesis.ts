"use client"

import { useState, useCallback } from "react"

export function useVoiceSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [onSpeakingChange, setOnSpeakingChange] = useState<((speaking: boolean) => void) | null>(null)

  const speakWithBrowser = useCallback(
    (text: string) => {
      return new Promise<void>((resolve, reject) => {
        if (!("speechSynthesis" in window)) {
          reject(new Error("Browser speech synthesis not supported"))
          return
        }

        const utterance = new SpeechSynthesisUtterance(text)

        // Configure for more natural voice
        utterance.lang = "hi-IN"
        utterance.pitch = 1.1 // female tone
        utterance.rate = 1
        utterance.volume = 1.0

        utterance.onend = () => {
          console.log("[v0] Browser speech completed")
          setIsSpeaking(false)
          onSpeakingChange?.(false)
          resolve()
        }

        utterance.onerror = (error) => {
          console.error("[v0] Browser speech error:", error)
          setIsSpeaking(false)
          onSpeakingChange?.(false)
          reject(error)
        }

        setIsSpeaking(true)
        onSpeakingChange?.(true)
        window.speechSynthesis.speak(utterance)
      })
    },
    [onSpeakingChange],
  )

  const speak = useCallback(
    async (text: string) => {
      try {
        console.log("[v0] Requesting voice synthesis for:", text)
        setIsSpeaking(true)
        onSpeakingChange?.(true)

        const response = await fetch("/api/voice", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text }),
        })

        const contentType = response.headers.get("content-type")

        if (contentType?.includes("application/json")) {
          const data = await response.json()
          if (data.useFallback) {
            console.log("[v0] Using browser speech synthesis:", data.message)
            await speakWithBrowser(text)
            return
          }
        } else if (contentType?.includes("audio")) {
          const audioBlob = await response.blob()
          const audioUrl = URL.createObjectURL(audioBlob)

          const audio = new Audio(audioUrl)

          audio.onended = () => {
            console.log("[v0] ElevenLabs audio playback completed")
            setIsSpeaking(false)
            onSpeakingChange?.(false)
            URL.revokeObjectURL(audioUrl)
          }

          audio.onerror = () => {
            console.log("[v0] Audio playback error, trying browser fallback")
            setIsSpeaking(false)
            onSpeakingChange?.(false)
            URL.revokeObjectURL(audioUrl)
            speakWithBrowser(text).catch(() => {})
          }

          await audio.play()
          return
        }

        console.log("[v0] Unexpected response format, using browser speech synthesis fallback")
        await speakWithBrowser(text)
      } catch (error) {
        console.error("[v0] Voice synthesis error:", error)
        try {
          await speakWithBrowser(text)
        } catch (fallbackError) {
          console.error("[v0] Browser speech fallback also failed:", fallbackError)
          setIsSpeaking(false)
          onSpeakingChange?.(false)
          throw error
        }
      }
    },
    [speakWithBrowser, onSpeakingChange],
  )

  const stopSpeaking = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
    onSpeakingChange?.(false)
  }, [onSpeakingChange])

  return {
    isSpeaking,
    speak,
    stopSpeaking,
    setSpeakingChangeCallback: setOnSpeakingChange,
  }
}
