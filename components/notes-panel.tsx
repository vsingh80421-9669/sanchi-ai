"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { StickyNote, Plus, Trash2 } from "lucide-react"
import { storageService, type Note } from "@/lib/storage"

export function NotesPanel() {
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState("")

  useEffect(() => {
    setNotes(storageService.getNotes())
  }, [])

  const handleAddNote = () => {
    if (!newNote.trim()) return

    const note = storageService.addNote(newNote)
    setNotes([note, ...notes])
    setNewNote("")
  }

  const handleDeleteNote = (id: string) => {
    storageService.deleteNote(id)
    setNotes(notes.filter((n) => n.id !== id))
  }

  return (
    <Card className="bg-card/50 backdrop-blur-lg border-border/50 p-6 h-[500px] flex flex-col">
      <h2 className="text-xl font-semibold mb-4">Notes</h2>

      <div className="mb-4">
        <Textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Type your note..."
          className="bg-secondary/50 border-border mb-2 min-h-[100px]"
        />
        <Button onClick={handleAddNote} disabled={!newNote.trim()} className="w-full gap-2">
          <Plus className="w-4 h-4" />
          Add Note
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <StickyNote className="w-12 h-12 mb-2 opacity-50" />
            <p>No notes yet. Add your first note above.</p>
          </div>
        ) : (
          notes.map((note) => (
            <Card key={note.id} className="bg-secondary/50 p-4">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <p className="text-sm leading-relaxed mb-2">{note.content}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(note.timestamp).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteNote(note.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </Card>
  )
}
