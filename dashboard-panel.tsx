"use client"

import { useEffect, useState } from "react"
// import { Card } from "@/components/ui/card"
import { Activity, MessageSquare, Mic, Clock } from "lucide-react"
import { storageService } from "@/lib/storage"

export function DashboardPanel() {
  const [stats, setStats] = useState({ wakeups: 0, commands: 0, lastSeen: "" })

  useEffect(() => {
    const loadStats = () => {
      const currentStats = storageService.getStats()
      setStats(currentStats)
    }

    loadStats()
    const interval = setInterval(loadStats, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-card/50 backdrop-blur-lg border border-border/50 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">Activity Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-background/50 rounded-lg p-4 border border-border/30">
          <div className="flex items-center gap-3 mb-2">
            <Mic className="w-5 h-5 text-accent" />
            <span className="text-sm text-muted-foreground">Wake-ups</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.wakeups}</p>
        </div>

        <div className="bg-background/50 rounded-lg p-4 border border-border/30">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Commands</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.commands}</p>
        </div>

        <div className="bg-background/50 rounded-lg p-4 border border-border/30">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-secondary" />
            <span className="text-sm text-muted-foreground">Last Active</span>
          </div>
          <p className="text-sm font-medium text-foreground">{stats.lastSeen || "--"}</p>
        </div>
      </div>
    </div>
  )
}
