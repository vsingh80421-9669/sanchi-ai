"use client"

import { Card } from "@/components/ui/card"
import { User, Bot } from "lucide-react"

interface ChatMessageProps {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isUser = role === "user"

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isUser ? "bg-secondary" : "bg-primary"
        }`}
      >
        {isUser ? (
          <User className="w-5 h-5 text-secondary-foreground" />
        ) : (
          <Bot className="w-5 h-5 text-primary-foreground" />
        )}
      </div>

      <Card className={`max-w-[75%] p-4 ${isUser ? "bg-secondary" : "bg-card/50 backdrop-blur-lg border-border/50"}`}>
        <p className={`text-sm leading-relaxed ${isUser ? "text-secondary-foreground" : "text-foreground"}`}>
          {content}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          {timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </Card>
    </div>
  )
}
