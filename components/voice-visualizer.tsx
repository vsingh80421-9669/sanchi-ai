"use client"

import { useEffect, useRef } from "react"

interface VoiceVisualizerProps {
  isActive: boolean
  isSpeaking: boolean
}

export function VoiceVisualizer({ isActive, isSpeaking }: VoiceVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number
    let time = 0

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const centerY = canvas.height / 2
      const bars = 40
      const barWidth = canvas.width / bars

      for (let i = 0; i < bars; i++) {
        const amplitude = isActive || isSpeaking ? 30 : 5
        const frequency = 0.02
        const height = Math.sin(i * frequency + time) * amplitude + (isActive ? 20 : 10)

        const gradient = ctx.createLinearGradient(0, centerY - height, 0, centerY + height)
        gradient.addColorStop(0, "rgba(96, 165, 250, 0.8)")
        gradient.addColorStop(0.5, "rgba(59, 130, 246, 1)")
        gradient.addColorStop(1, "rgba(37, 99, 235, 0.8)")

        ctx.fillStyle = gradient
        ctx.fillRect(i * barWidth, centerY - height / 2, barWidth - 2, height)
      }

      time += isActive || isSpeaking ? 0.15 : 0.05
      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [isActive, isSpeaking])

  return (
    <div className="relative w-full h-32 flex items-center justify-center">
      <canvas ref={canvasRef} width={600} height={128} className="w-full h-full" />
    </div>
  )
}
