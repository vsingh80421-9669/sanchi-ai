export interface Note {
  id: string
  content: string
  timestamp: number
}

export interface Reminder {
  id: string
  message: string
  timestamp: number
  completed: boolean
  time?: number // Hour of the day (0-23)
}

export interface Stats {
  wakeups: number
  commands: number
  lastSeen: string
  lastMorningGreeting?: string
}

export interface Task {
  id: string
  text: string
  time: number // Hour of the day (0-23)
  done: boolean
  date: string // Date string to track which day it was scheduled for
}

export const storageService = {
  // Notes
  getNotes(): Note[] {
    if (typeof window === "undefined") return []
    const notes = localStorage.getItem("sanchi_notes")
    return notes ? JSON.parse(notes) : []
  },

  addNote(content: string): Note {
    const notes = this.getNotes()
    const newNote: Note = {
      id: Date.now().toString(),
      content,
      timestamp: Date.now(),
    }
    notes.unshift(newNote)
    localStorage.setItem("sanchi_notes", JSON.stringify(notes))
    return newNote
  },

  deleteNote(id: string): void {
    const notes = this.getNotes().filter((n) => n.id !== id)
    localStorage.setItem("sanchi_notes", JSON.stringify(notes))
  },

  // Reminders
  getReminders(): Reminder[] {
    if (typeof window === "undefined") return []
    const reminders = localStorage.getItem("sanchi_reminders")
    return reminders ? JSON.parse(reminders) : []
  },

  addReminder(message: string, timestamp: number, time?: number): Reminder {
    const reminders = this.getReminders()
    const newReminder: Reminder = {
      id: Date.now().toString(),
      message,
      timestamp,
      completed: false,
      time, // Added time field
    }
    reminders.unshift(newReminder)
    localStorage.setItem("sanchi_reminders", JSON.stringify(reminders))
    return newReminder
  },

  toggleReminder(id: string): void {
    const reminders = this.getReminders()
    const reminder = reminders.find((r) => r.id === id)
    if (reminder) {
      reminder.completed = !reminder.completed
      localStorage.setItem("sanchi_reminders", JSON.stringify(reminders))
    }
  },

  deleteReminder(id: string): void {
    const reminders = this.getReminders().filter((r) => r.id !== id)
    localStorage.setItem("sanchi_reminders", JSON.stringify(reminders))
  },

  // Stats management
  getStats(): Stats {
    if (typeof window === "undefined") return { wakeups: 0, commands: 0, lastSeen: "", lastMorningGreeting: "" }
    const stats = localStorage.getItem("sanchi_stats")
    return stats ? JSON.parse(stats) : { wakeups: 0, commands: 0, lastSeen: "", lastMorningGreeting: "" }
  },

  logActivity(type: "wakeups" | "commands"): void {
    const stats = this.getStats()
    stats[type] = (stats[type] || 0) + 1
    stats.lastSeen = new Date().toLocaleString()
    localStorage.setItem("sanchi_stats", JSON.stringify(stats))
  },

  shouldSendMorningGreeting(): boolean {
    const stats = this.getStats()
    const today = new Date().toDateString()
    return stats.lastMorningGreeting !== today
  },

  markMorningGreetingSent(): void {
    const stats = this.getStats()
    stats.lastMorningGreeting = new Date().toDateString()
    localStorage.setItem("sanchi_stats", JSON.stringify(stats))
  },

  // Task management
  getTasks(): Task[] {
    if (typeof window === "undefined") return []
    const tasks = localStorage.getItem("sanchi_tasks")
    return tasks ? JSON.parse(tasks) : []
  },

  addTask(text: string, time: number): Task {
    const tasks = this.getTasks()
    const newTask: Task = {
      id: Date.now().toString(),
      text,
      time,
      done: false,
      date: new Date().toDateString(),
    }
    tasks.unshift(newTask)
    localStorage.setItem("sanchi_tasks", JSON.stringify(tasks))
    return newTask
  },

  markTaskDone(id: string): void {
    const tasks = this.getTasks()
    const task = tasks.find((t) => t.id === id)
    if (task) {
      task.done = true
      localStorage.setItem("sanchi_tasks", JSON.stringify(tasks))
    }
  },
        }

