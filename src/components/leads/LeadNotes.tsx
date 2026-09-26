'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { FileText, Send, Loader2 } from 'lucide-react'

interface Note {
  id: string
  note: string
  timestamp: string
  author: { id: string; name: string }
}

interface LeadNotesProps {
  leadId: string
  initialNotes: Note[]
  authorId: string
}

export function LeadNotes({ leadId, initialNotes, authorId }: LeadNotesProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/leads/${leadId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: text.trim(), authorId }),
      })
      const data = await res.json()
      if (data.note) {
        setNotes(prev => [...prev, data.note])
        setText('')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-4 h-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-700">Notes ({notes.length})</h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-0">
        {notes.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs">No notes yet. Add the first one below.</p>
          </div>
        ) : (
          notes.map(note => (
            <div key={note.id} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <p className="text-sm text-slate-800 leading-relaxed">{note.note}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-5 h-5 rounded-full bg-slate-300 flex items-center justify-center text-[10px] font-semibold text-slate-600 flex-shrink-0">
                  {note.author.name.charAt(0)}
                </div>
                <span className="text-xs text-slate-500">{note.author.name}</span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-400">{format(new Date(note.timestamp), 'dd MMM, hh:mm a')}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 flex-shrink-0">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Add a note..."
          rows={2}
          disabled={submitting}
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!text.trim() || submitting}
          className="flex-shrink-0 w-10 h-10 self-end rounded-lg bg-slate-900 text-white flex items-center justify-center hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  )
}
