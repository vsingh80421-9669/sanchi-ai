"use client"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChatMessage } from "@/components/chat-message"
import { Send, Loader2, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  searchPerformed?: boolean
}

interface ChatInterfaceProps {
  onSendMessage: (message: string) => Promise<{ response: string; searchPerformed?: boolean }>
  isSpeaking: boolean
  externalMessage?: string
}

export function ChatInterface({ onSendMessage, isSpeaking, externalMessage }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello Boss 😊\nMain SANCHI hoon, aapki personal AI assistant.\nBataiye Boss, aaj kya kaam hai?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (externalMessage && externalMessage.trim()) {
      handleSendMessage(externalMessage)
    }
  }, [externalMessage])

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || input
    if (!textToSend.trim() || isProcessing) return

    setInput("")
    setIsProcessing(true)

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])

    try {
      console.log("[v0] Sending message to chat API:", textToSend)
      const { response, searchPerformed } = await onSendMessage(textToSend)

      // Add assistant response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
        searchPerformed,
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("[v0] Chat error:", error)
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="bg-card/50 backdrop-blur-lg border-border/50 p-6 h-[500px] flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message) => (
          <div key={message.id}>
            <ChatMessage role={message.role} content={message.content} timestamp={message.timestamp} />
            {message.searchPerformed && (
              <div className="flex items-center gap-1 text-xs text-accent ml-14 mt-1">
                <Search className="w-3 h-3" />
                <span>Web search performed</span>
              </div>
            )}
          </div>
        ))}
        {isProcessing && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-primary">
              <Loader2 className="w-5 h-5 text-primary-foreground animate-spin" />
            </div>
            <Card className="bg-card/50 backdrop-blur-lg border-border/50 p-4">
              <p className="text-sm text-muted-foreground">Processing your request...</p>
            </Card>
          </div>
        )}
        {isSpeaking && (
          <div className="text-center">
            <p className="text-xs text-primary animate-pulse">Speaking response...</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Ask me anything..."
          disabled={isProcessing}
          className="bg-secondary/50 border-border"
        />
        <Button onClick={() => handleSendMessage()} disabled={isProcessing || !input.trim()}>
          {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </Card>
  )
}
