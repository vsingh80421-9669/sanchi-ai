"use client"

import { Card } from "@/components/ui/card"
import { Cloud } from "lucide-react"

export function WeatherPanel() {
  return (
    <Card className="bg-card/50 backdrop-blur-lg border-border/50 p-6 h-[500px] flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Weather Information</h2>
        <p className="text-muted-foreground text-sm">
          Ask SANCHI about the weather in any city using voice or text chat.
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-muted-foreground max-w-md">
          <Cloud className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="mb-4">Try asking questions like:</p>
          <div className="space-y-2 text-sm">
            <div className="bg-secondary/50 rounded-lg p-3 border border-border/50">
              &quot;What&apos;s the weather in Delhi?&quot;
            </div>
            <div className="bg-secondary/50 rounded-lg p-3 border border-border/50">
              &quot;Tell me about Mumbai&apos;s current weather&quot;
            </div>
            <div className="bg-secondary/50 rounded-lg p-3 border border-border/50">
              &quot;How&apos;s the weather today in Bangalore?&quot;
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
