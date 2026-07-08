"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, Plus, Trash2, Check } from "lucide-react"
import { storageService, type Reminder } from "@/lib/storage"

export function RemindersPanel() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [newReminder, setNewReminder] = useState("")
  const [reminderTime, setReminderTime] = useState("")

  useEffect(() => {
    setReminders(storageService.getReminders())
  }, [])

  const handleAddReminder = () => {
    if (!newReminder.trim() || !reminderTime) return

    const timestamp = new Date(reminderTime).getTime()
    const reminder = storageService.addReminder(newReminder, timestamp)
    setReminders([reminder, ...reminders])
    setNewReminder("")
    setReminderTime("")
  }

  const handleToggleReminder = (id: string) => {
    storageService.toggleReminder(id)
    setReminders(storageService.getReminders())
  }

  const handleDeleteReminder = (id: string) => {
    storageService.deleteReminder(id)
    setReminders(reminders.filter((r) => r.id !== id))
  }

  return (
    <Card className="bg-card/50 backdrop-blur-lg border-border/50 p-6 h-[500px] flex flex-col">
      <h2 className="text-xl font-semibold mb-4">Reminders</h2>

      <div className="mb-4 space-y-2">
        <Input
          value={newReminder}
          onChange={(e) => setNewReminder(e.target.value)}
          placeholder="What do you want to be reminded about?"
          className="bg-secondary/50 border-border"
        />
        <Input
          type="datetime-local"
          value={reminderTime}
          onChange={(e) => setReminderTime(e.target.value)}
          className="bg-secondary/50 border-border"
        />
        <Button onClick={handleAddReminder} disabled={!newReminder.trim() || !reminderTime} className="w-full gap-2">
          <Plus className="w-4 h-4" />
          Add Reminder
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {reminders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Bell className="w-12 h-12 mb-2 opacity-50" />
            <p>No reminders set. Create one above.</p>
          </div>
        ) : (
          reminders.map((reminder) => (
            <Card key={reminder.id} className={`bg-secondary/50 p-4 ${reminder.completed ? "opacity-60" : ""}`}>
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <p className={`text-sm leading-relaxed mb-2 ${reminder.completed ? "line-through" : ""}`}>
                    {reminder.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(reminder.timestamp).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleReminder(reminder.id)}
                    className={reminder.completed ? "text-primary" : ""}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteReminder(reminder.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </Card>
  )
}
