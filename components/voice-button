"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Power, PowerOff } from "lucide-react"
import { SpeechRecognitionService } from "@/lib/speech-recognition"
import { useToast } from "@/hooks/use-toast"

interface VoiceButtonProps {
  onTranscript: (text: string) => void
  onWakeWord: () => void
  onStopCommand: () => void
  isProcessing: boolean
  recognitionService?: any // Accept external recognition service
  isContinuousMode?: boolean
}

export function VoiceButton({
  onTranscript,
  onWakeWord,
  onStopCommand,
  isProcessing,
  recognitionService: externalRecognition,
  isContinuousMode = false,
}: VoiceButtonProps) {
  const [isListening, setIsListening] = useState(false)
  const [isContinuous, setIsContinuous] = useState(false)
  const [recognition] = useState(() => externalRecognition || new SpeechRecognitionService())
  const { toast } = useToast()

  useEffect(() => {
    if (!recognition.isAvailable()) {
      toast({
        title: "Speech Recognition Unavailable",
        description: "Your browser doesn't support speech recognition. Please use Chrome or Edge.",
        variant: "destructive",
      })
    }
  }, [recognition, toast])

  const handleContinuousToggle = () => {
    if (!isContinuous) {
      recognition.startContinuous(
        () => {
          console.log("[v0] Wake word detected!")
          setIsListening(true)
          onWakeWord()
        },
        (transcript) => {
          console.log("[v0] Command received:", transcript)
          onTranscript(transcript)
        },
        () => {
          console.log("[v0] Stop command received")
          setIsListening(false)
          onStopCommand()
        },
        (error) => {
          console.log("[v0] Speech recognition error:", error)
        },
      )
      setIsContinuous(true)
      toast({
        title: "Wake Word Active",
        description: "Say 'Sanchi' to activate me. Say 'band' or 'chup' to stop.",
      })
    } else {
      recognition.stop()
      setIsContinuous(false)
      setIsListening(false)
    }
  }

  const handleVoiceToggle = () => {
    if (isProcessing) return

    if (!isListening) {
      recognition.start(
        (transcript) => {
          console.log("[v0] Voice transcript received:", transcript)
          setIsListening(false)
          onTranscript(transcript)
        },
        (error) => {
          console.log("[v0] Speech recognition error:", error)
          setIsListening(false)
          toast({
            title: "Voice Error",
            description: "Failed to recognize speech. Please try again.",
            variant: "destructive",
          })
        },
      )
      setIsListening(true)
    } else {
      recognition.stop()
      setIsListening(false)
    }
  }

  return (
    <div className="flex gap-3">
      <Button
        size="lg"
        onClick={handleContinuousToggle}
        disabled={!recognition.isAvailable()}
        className={`gap-2 transition-all ${isContinuous ? "bg-primary hover:bg-primary/90" : "bg-muted hover:bg-muted/90"}`}
        variant={isContinuous ? "default" : "outline"}
      >
        {isContinuous ? (
          <>
            <Power className="w-5 h-5" />
            Wake Mode Active
          </>
        ) : (
          <>
            <PowerOff className="w-5 h-5" />
            Enable Wake Mode
          </>
        )}
      </Button>

      {/* Regular voice button */}
      <Button
        size="lg"
        onClick={handleVoiceToggle}
        disabled={!recognition.isAvailable() || isProcessing || isContinuous}
        className={`gap-2 transition-all ${isListening && !isContinuous ? "bg-destructive hover:bg-destructive/90 animate-pulse" : ""}`}
      >
        {isListening && !isContinuous ? (
          <>
            <MicOff className="w-5 h-5" />
            Stop Listening
          </>
        ) : (
          <>
            <Mic className="w-5 h-5" />
            {isProcessing ? "Processing..." : "Push to Talk"}
          </>
        )}
      </Button>
    </div>
  )
}
