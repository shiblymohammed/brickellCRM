'use client'

import { useState, useRef } from 'react'
import { Upload, ImagePlus, Loader2, CheckCircle, AlertCircle, Phone, User, X, ArrowRight, Save, Trash2, Edit2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { useRouter } from 'next/navigation'

interface Contact {
  name: string | null
  phone: string | null
  isDuplicate?: boolean
  selected?: boolean
}

interface UploadResult {
  totalExtracted: number
  contacts: Contact[]
  hashes: string[]
}

export default function UploadPage() {
  const router = useRouter()
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFiles(selected: FileList | null) {
    if (!selected) return
    const arr = Array.from(selected)
    setFiles(arr)
    setResult(null)
    setError(null)
    const urls = arr.map(f => URL.createObjectURL(f))
    setPreviews(urls)
  }

  async function handleUpload() {
    if (!files.length) return
    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      files.forEach(f => formData.append('files', f))

      const res = await fetch('/api/leads/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')

      setResult(data)
    } catch (e: any) {
      setError(e.message || 'Unexpected error')
    } finally {
      setUploading(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  async function handleSaveLeads() {
    if (!result) return
    const selectedContacts = result.contacts.filter(c => c.selected)
    if (selectedContacts.length === 0) return

    setSaving(true)
    try {
      const res = await fetch('/api/leads/bulk-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contacts: selectedContacts,
          hash: result.hashes[0]
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')

      router.push('/admin/leads')
    } catch (e: any) {
      setError(e.message || 'Save failed')
      setSaving(false)
    }
  }

  function updateContact(index: number, field: 'name' | 'phone' | 'selected', value: any) {
    if (!result) return
    const newContacts = [...result.contacts]
    newContacts[index] = { ...newContacts[index], [field]: value }
    setResult({ ...result, contacts: newContacts })
  }

  function removeContact(index: number) {
    if (!result) return
    const newContacts = [...result.contacts]
    newContacts.splice(index, 1)
    setResult({ ...result, contacts: newContacts })
  }

  if (result) {
    const selectedCount = result.contacts.filter(c => c.selected).length

    return (
      <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">Review Extracted Leads</h2>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Found <span className="font-bold text-slate-700">{result.contacts.length}</span> contacts. Review and edit before saving.
            </p>
          </div>
          <button
            onClick={handleSaveLeads}
            disabled={saving || selectedCount === 0}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-bold tracking-wide hover:bg-slate-800 disabled:opacity-50 w-full md:w-auto shadow-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save {selectedCount} Leads
          </button>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="px-4 py-3 w-12">
                        <input 
                          type="checkbox" 
                          checked={selectedCount === result.contacts.length && result.contacts.length > 0}
                          onChange={(e) => {
                            const val = e.target.checked;
                            setResult({...result, contacts: result.contacts.map(c => ({...c, selected: val}))})
                          }}
                          className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                        />
                      </th>
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Phone Number</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {result.contacts.map((c, i) => (
                      <tr key={i} className={`hover:bg-slate-50 transition-colors ${!c.selected ? 'opacity-50' : ''}`}>
                        <td className="px-4 py-3">
                          <input 
                            type="checkbox" 
                            checked={c.selected || false}
                            onChange={(e) => updateContact(i, 'selected', e.target.checked)}
                            className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={c.name || ''}
                            onChange={(e) => updateContact(i, 'name', e.target.value)}
                            placeholder="No name"
                            className="w-full bg-transparent border-0 p-0 focus:ring-0 text-sm font-bold text-slate-900 placeholder:text-slate-400"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={c.phone || ''}
                            onChange={(e) => updateContact(i, 'phone', e.target.value)}
                            placeholder="Phone number"
                            className="w-full bg-transparent border-0 p-0 focus:ring-0 text-sm text-slate-600 font-mono"
                          />
                        </td>
                        <td className="px-4 py-3">
                          {c.isDuplicate ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100/50 px-2 py-0.5 rounded-full">
                              <AlertCircle className="w-3 h-3" /> Duplicate
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/50 px-2 py-0.5 rounded-full">
                              <CheckCircle className="w-3 h-3" /> New
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => removeContact(i)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Compact Editable List View */}
        <div className="md:hidden flex flex-col pb-6 -mx-4 px-4">
          <div className="flex items-center justify-between px-2 py-2.5 bg-slate-100 border-y border-slate-200 sticky top-0 z-10 -mx-4 px-4 mb-3">
             <div className="flex items-center gap-2">
               <input 
                  type="checkbox" 
                  checked={selectedCount === result.contacts.length && result.contacts.length > 0}
                  onChange={(e) => {
                    const val = e.target.checked;
                    setResult({...result, contacts: result.contacts.map(c => ({...c, selected: val}))})
                  }}
                  className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Select All</span>
             </div>
             <span className="text-[10px] font-bold text-slate-500 uppercase">{selectedCount} / {result.contacts.length} Selected</span>
          </div>

          <div className="flex flex-col gap-2.5">
          {result.contacts.map((c, i) => (
            <div key={i} className={`flex items-start gap-2.5 p-3 border rounded-xl bg-white shadow-sm transition-opacity ${!c.selected ? 'opacity-50 border-slate-200' : (c.isDuplicate ? 'border-amber-300 bg-amber-50/20' : 'border-slate-300')}`}>
              <div className="pt-1.5">
                <input 
                  type="checkbox" 
                  checked={c.selected || false}
                  onChange={(e) => updateContact(i, 'selected', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
              </div>
              <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                <input
                  type="text"
                  value={c.name || ''}
                  onChange={(e) => updateContact(i, 'name', e.target.value)}
                  placeholder="Enter name"
                  className="w-full bg-slate-50 border-none px-2.5 py-2 rounded-lg text-xs font-bold text-slate-900 focus:ring-1 focus:ring-slate-400 placeholder:text-slate-400 transition-shadow"
                />
                <input
                  type="text"
                  value={c.phone || ''}
                  onChange={(e) => updateContact(i, 'phone', e.target.value)}
                  placeholder="Phone number"
                  className="w-full bg-slate-50 border-none px-2.5 py-2 rounded-lg text-[11px] font-mono text-slate-600 focus:ring-1 focus:ring-slate-400 placeholder:text-slate-400 transition-shadow"
                />
                <div className="flex items-center justify-between mt-1 px-0.5">
                  {c.isDuplicate ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100/50 px-2 py-0.5 rounded">
                      <AlertCircle className="w-3 h-3" /> Duplicate
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/50 px-2 py-0.5 rounded">
                      <CheckCircle className="w-3 h-3" /> New
                    </span>
                  )}
                  <button onClick={() => removeContact(i)} className="flex items-center justify-center p-1 text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Upload Group Screenshot</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Upload a screenshot of a WhatsApp group members list. The AI will extract all phone numbers and names automatically.
        </p>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="flex flex-col items-center justify-center w-full h-64 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 cursor-pointer hover:border-slate-400 hover:bg-slate-100 transition-all group"
      >
        <Upload className="w-10 h-10 text-slate-400 group-hover:text-slate-500 transition-colors mb-3" />
        <p className="text-sm font-medium text-slate-700">Drop screenshots here or click to browse</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {previews.map((src, i) => (
            <div key={i} className="relative group">
              <img src={src} className="w-full h-36 object-cover rounded-xl border border-slate-200" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={files.length === 0 || uploading}
        className="w-full h-12 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {uploading ? <><Loader2 className="w-5 h-5 animate-spin" /> Extracting contacts...</> : 'Extract Contacts'}
      </button>
    </div>
  )
}
