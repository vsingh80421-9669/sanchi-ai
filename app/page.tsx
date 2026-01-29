"use client"

import { useState, useEffect } from "react"
import { AssistantAvatar } from "@/components/assistant-avatar"
import { VoiceVisualizer } from "@/components/voice-visualizer"
import { VoiceButton } from "@/components/voice-button"
import { ChatInterface } from "@/components/chat-interface"
import { WeatherPanel } from "@/components/weather-panel"
import { NotesPanel } from "@/components/notes-panel"
import { RemindersPanel } from "@/components/reminders-panel"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Cloud, StickyNote, Bell, BarChart3 } from "lucide-react"
import { useVoiceSynthesis } from "@/hooks/use-voice-synthesis"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { DashboardPanel } from "@/components/dashboard-panel"
import { storageService } from "@/lib/storege"


export default function Home() {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [voiceTranscript, setVoiceTranscript] = useState<string>("")
  const [conversationHistory, setConversationHistory] = useState<any[]>([])
  const [recognitionService, setRecognitionService] = useState<any>(null)
  const { isSpeaking, speak, setSpeakingChangeCallback } = useVoiceSynthesis()
  const { toast } = useToast()

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("@/lib/speech-recognition").then((module) => {
        const service = new module.SpeechRecognitionService()
        setRecognitionService(service)
      })
    }
  }, [])

  useEffect(() => {
    if (recognitionService) {
      setSpeakingChangeCallback((speaking: boolean) => {
        if (speaking) {
          recognitionService.pauseForSpeaking()
        } else {
          recognitionService.resumeAfterSpeaking()
        }
      })
    }
  }, [recognitionService, setSpeakingChangeCallback])

  /*
useEffect(() => {
  const checkRoutines = () => {
    const now = new Date()
    const hour = now.getHours()

    if (hour === 7 && storageService.shouldSendMorningGreeting()) {
      storageService.markMorningGreetingSent()
      speak("Good morning Boss, aaj ka din productive banate hain.")
    }

    const reminders = storageService.getReminders()
    reminders.forEach((reminder) => {
      if (reminder.time && !reminder.completed && hour === reminder.time) {
        speak(`Boss reminder: ${reminder.message}`)
        storageService.toggleReminder(reminder.id)
      }
    })

    const tasks = storageService.getTasks()
    const today = new Date().toDateString()
    tasks.forEach((task) => {
      if (!task.done && task.time === hour && task.date === today) {
        speak(`Boss, aapka task: ${task.text}`)
        storageService.markTaskDone(task.id)
      }
    })
  }

  checkRoutines()
  const interval = setInterval(checkRoutines, 60000)
  return () => clearInterval(interval)
}, [speak])
*/


  const handleSendMessage = async (message: string): Promise<{ response: string; searchPerformed?: boolean }> => {
    try {
      console.log("[v0] Processing message:", message)
      setIsProcessing(true)

     // storageService.logActivity("commands")

      const timeMatch = message.match(/(\d{1,2})\s*baje/i)
      if (timeMatch && (message.includes("yaad") || message.includes("reminder") || message.includes("task"))) {
        const hour = Number.parseInt(timeMatch[1])
        if (hour >= 0 && hour <= 23) {
          storageService.addTask(message, hour)
          const response = "Theek hai Boss, yaad rakhungi."
          await speak(response)
          setIsProcessing(false)
          return { response }
        }
      }

      const response = await fetch("/api/sanchi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()
      const aiResponse = data.reply

      setConversationHistory((prev) => [
        ...prev,
        { role: "user", content: message },
        { role: "assistant", content: aiResponse },
      ])

      if (recognitionService) {
        recognitionService.setLastOutput(aiResponse)
      }

      try {
        await speak(aiResponse)
      } catch (error) {
        console.error("[v0] All voice synthesis methods failed:", error)
      }

      setIsProcessing(false)
      return { response: aiResponse }
    } catch (error) {
      setIsProcessing(false)
      console.error("[v0] Message handling error:", error)
      throw error
    }
  }

  const handleVoiceTranscript = (transcript: string) => {
    console.log("[v0] Received voice transcript:", transcript)
    setVoiceTranscript(transcript)
    setIsListening(false)
  }

  const handleWakeWord = async () => {
    setIsListening(true)
    storageService.logActivity("wakeups")
    const mode = recognitionService?.getMode()
    if (mode === "locked") {
      await speak("Wapas aa gayi Boss")
    } else {
      await speak("Ji Boss, boliye")
    }
  }

  const handleStopCommand = async () => {
    setIsListening(false)
    await speak("Theek hai Boss")
  }

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            SANCHI
          </h1>
          <p className="text-muted-foreground text-lg">Your AI Voice Assistant</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-card/50 backdrop-blur-lg border-border/50 p-8 mb-6">
            <div className="flex flex-col items-center gap-6">
              <AssistantAvatar isActive={isListening} isSpeaking={isSpeaking} />
              <VoiceVisualizer isActive={isListening} isSpeaking={isSpeaking} />

              <VoiceButton
                onTranscript={handleVoiceTranscript}
                onWakeWord={handleWakeWord}
                onStopCommand={handleStopCommand}
                isProcessing={isProcessing}
              />
            </div>
          </Card>

          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="chat" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="weather" className="gap-2">
                <Cloud className="w-4 h-4" />
                Weather
              </TabsTrigger>
              <TabsTrigger value="notes" className="gap-2">
                <StickyNote className="w-4 h-4" />
                Notes
              </TabsTrigger>
              <TabsTrigger value="reminders" className="gap-2">
                <Bell className="w-4 h-4" />
                Reminders
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat">
              <ChatInterface
                onSendMessage={handleSendMessage}
                isSpeaking={isSpeaking}
                externalMessage={voiceTranscript}
              />
            </TabsContent>

            <TabsContent value="weather">
              <WeatherPanel />
            </TabsContent>

            <TabsContent value="notes">
              <NotesPanel />
            </TabsContent>

            <TabsContent value="reminders">
              <RemindersPanel />
            </TabsContent>

            <TabsContent value="dashboard">
              <DashboardPanel />
            </TabsContent>
          </Tabs>

          <Card className="bg-card/50 backdrop-blur-lg border-border/50 p-4 mt-6">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-muted-foreground">System Online</span>
              </div>
              <span className="text-muted-foreground">
                {isProcessing
                  ? "Processing..."
                  : isSpeaking
                    ? "Speaking..."
                    : isListening
                      ? "Listening..."
                      : "Ready to assist"}
              </span>
            </div>
          </Card>
        </div>
      </div>
      <Toaster />
    </main>
  )
}
