'use client'

import { useState, useMemo } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Search, CheckSquare, Square, Loader2, List, LayoutGrid } from 'lucide-react'
import { useRouter } from 'next/navigation'

const statusColor: Record<string, string> = {
  AI_DRAFT: 'bg-slate-100 text-slate-600',
  PENDING_AUDIT: 'bg-yellow-50 text-yellow-700',
  APPROVED: 'bg-emerald-50 text-emerald-700',
  ASSIGNED: 'bg-blue-50 text-blue-700',
  CONTACTED: 'bg-purple-50 text-purple-700',
  INTERESTED: 'bg-indigo-50 text-indigo-700',
  FOLLOW_UP: 'bg-cyan-50 text-cyan-700',
  QUOTATION: 'bg-orange-50 text-orange-700',
  NEGOTIATION: 'bg-pink-50 text-pink-700',
  WON: 'bg-green-50 text-green-700',
  LOST: 'bg-red-50 text-red-700',
  REJECTED: 'bg-slate-50 text-slate-500',
}

const filterOptions = [
  { id: 'ALL', label: 'All' },
  { id: 'UNASSIGNED', label: 'Unassigned' },
  { id: 'ASSIGNED', label: 'Assigned' },
  { id: 'PENDING_AUDIT', label: 'Audit' },
  { id: 'WON', label: 'Won' },
]

export default function LeadsClient({ initialLeads }: { initialLeads: any[] }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set())
  const [assigning, setAssigning] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  const staffFilters = useMemo(() => {
    const staff = new Map()
    initialLeads.forEach(lead => {
      if (lead.assignedTo?.name && lead.assignedToId) {
        staff.set(lead.assignedToId, lead.assignedTo.name.split(' ')[0])
      }
    })
    return Array.from(staff.entries()).map(([id, name]) => ({
      id: `STAFF_${id}`,
      label: name
    }))
  }, [initialLeads])

  const allFilters = [...filterOptions, ...staffFilters]

  const filteredLeads = useMemo(() => {
    return initialLeads.filter(lead => {
      if (search) {
        const query = search.toLowerCase()
        const matchesName = lead.customerName?.toLowerCase().includes(query)
        const matchesPhone = lead.phone?.includes(query)
        if (!matchesName && !matchesPhone) return false
      }
      if (activeFilter === 'UNASSIGNED') return !lead.assignedToId
      if (activeFilter === 'ASSIGNED') return !!lead.assignedToId
      if (activeFilter.startsWith('STAFF_')) return lead.assignedToId === activeFilter.replace('STAFF_', '')
      if (activeFilter !== 'ALL') return lead.status === activeFilter
      return true
    })
  }, [initialLeads, search, activeFilter])

  const toggleSelect = (id: string) => {
    const next = new Set(selectedLeads)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedLeads(next)
  }

  const toggleAll = () => {
    if (selectedLeads.size === filteredLeads.length && filteredLeads.length > 0) {
      setSelectedLeads(new Set())
    } else {
      setSelectedLeads(new Set(filteredLeads.map(l => l.id)))
    }
  }

  const handleBulkAssign = async (strategy: string) => {
    if (selectedLeads.size === 0) return
    setAssigning(true)
    try {
      const ids = Array.from(selectedLeads)
      await Promise.all(ids.map(id => 
        fetch(`/api/leads/${id}/audit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'APPROVE', strategy })
        })
      ))
      setSelectedLeads(new Set())
      router.refresh()
    } catch (e) {
      alert('Error assigning leads')
    } finally {
      setAssigning(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 md:bg-transparent max-w-7xl mx-auto">
      {/* Mobile Sticky Header (Ultra Compact, Merged with Topbar) */}
      <div className="md:hidden bg-white border-b border-slate-200 sticky top-[-16px] z-20 -mt-4 -mx-4 pt-4 px-2">
        <div className="flex items-center gap-1.5 p-1.5">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leads..." 
              className="w-full h-8 pl-8 pr-2 rounded-lg bg-slate-100 border-none text-[12px] focus:ring-1 focus:ring-slate-900 focus:outline-none"
            />
          </div>
          {selectedLeads.size > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-slate-500 px-1">{selectedLeads.size}</span>
              <button
                onClick={() => handleBulkAssign('round_robin')}
                disabled={assigning}
                className="h-8 px-3 rounded-lg bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center disabled:opacity-50"
              >
                {assigning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Assign'}
              </button>
            </div>
          )}
        </div>
        <div className="flex overflow-x-auto scrollbar-hide gap-1 px-1.5 pb-2 mt-1">
          {allFilters.map(opt => (
            <button
              key={opt.id}
              onClick={() => setActiveFilter(opt.id)}
              className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase whitespace-nowrap border ${
                activeFilter === opt.id 
                ? 'bg-slate-900 text-white border-slate-900' 
                : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {/* Mobile Select All Bar */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border-t border-slate-200">
          <button onClick={toggleAll} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 uppercase">
            {selectedLeads.size === filteredLeads.length && filteredLeads.length > 0 ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
            Select All
          </button>
          <span className="text-[9px] text-slate-400 font-bold uppercase">{filteredLeads.length} leads</span>
        </div>
      </div>

      {/* Desktop Sticky Header */}
      <div className="hidden md:block bg-transparent px-4 pt-4 pb-3 sticky top-0 z-10 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or phone..." 
              className="w-full h-10 pl-9 pr-4 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none shadow-sm"
            />
          </div>
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
              <List className="w-4 h-4"/>
            </button>
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
              <LayoutGrid className="w-4 h-4"/>
            </button>
          </div>
        </div>
        
        <div className="flex overflow-x-auto gap-2">
          {allFilters.map(opt => (
            <button
              key={opt.id}
              onClick={() => setActiveFilter(opt.id)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wide uppercase shadow-sm border ${
                activeFilter === opt.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {selectedLeads.size > 0 && (
          <div className="flex items-center justify-between bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">{selectedLeads.size}</span>
              <span className="text-sm font-semibold">Selected</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleBulkAssign('round_robin')} className="bg-white text-slate-900 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-50">Auto (Round Robin)</button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto pb-6">
        {filteredLeads.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs font-medium">
            No leads found.
          </div>
        ) : (
          <>
            {/* Mobile Ultra Dense List */}
            <div className="md:hidden flex flex-col bg-white border-t border-slate-200">
              {filteredLeads.map(lead => {
                const isSelected = selectedLeads.has(lead.id)
                return (
                  <div 
                    key={lead.id} 
                    onClick={() => toggleSelect(lead.id)}
                    className={`flex items-start gap-2 p-2 border-b border-slate-100 ${isSelected ? 'bg-blue-50/40' : ''}`}
                  >
                    <button className={`flex-shrink-0 mt-0.5 ${isSelected ? 'text-blue-600' : 'text-slate-300'}`}>
                      {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="font-bold text-slate-900 text-[12px] truncate">{lead.customerName || 'Unknown'}</h3>
                        <span className="text-[10px] text-slate-500 font-mono flex-shrink-0">{lead.phone || 'No phone'}</span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-[10px] text-slate-500 truncate pr-2">{lead.requirement || 'No req'}</span>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className={`px-1 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${statusColor[lead.status] || 'bg-slate-100 text-slate-600'}`}>
                            {lead.status.replace(/_/g, ' ')}
                          </span>
                          {lead.assignedTo ? (
                            <span className="text-[9px] font-bold text-slate-600 bg-slate-100 px-1 py-0.5 rounded truncate max-w-[60px]">
                              {lead.assignedTo.name.split(' ')[0]}
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1 py-0.5 rounded">
                              Unassigned
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block mx-4">
              {viewMode === 'list' && (
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 w-10 text-center"><button onClick={toggleAll} className="text-slate-400 hover:text-slate-900"><Square className="w-4 h-4" /></button></th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-500 text-xs uppercase tracking-wider">Customer</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-500 text-xs uppercase tracking-wider">Phone</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-500 text-xs uppercase tracking-wider">Requirement</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-500 text-xs uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-500 text-xs uppercase tracking-wider">Assigned To</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredLeads.map((lead) => (
                        <tr key={lead.id} onClick={() => toggleSelect(lead.id)} className={`cursor-pointer ${selectedLeads.has(lead.id) ? 'bg-slate-50' : 'hover:bg-slate-50/50'}`}>
                          <td className="px-4 py-3 text-center"><button className={selectedLeads.has(lead.id) ? 'text-slate-900' : 'text-slate-300'}>{selectedLeads.has(lead.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}</button></td>
                          <td className="px-4 py-3 font-bold text-slate-900 text-xs">{lead.customerName || 'Unknown'}</td>
                          <td className="px-4 py-3 text-slate-500 font-mono text-xs">{lead.phone || '—'}</td>
                          <td className="px-4 py-3 text-slate-600 max-w-[200px] truncate text-xs">{lead.requirement || '—'}</td>
                          <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${statusColor[lead.status] || 'bg-slate-50 text-slate-500'}`}>{lead.status.replace(/_/g, ' ')}</span></td>
                          <td className="px-4 py-3 text-xs">{lead.assignedTo?.name ? <span className="font-semibold text-slate-700">{lead.assignedTo.name}</span> : <span className="font-bold text-amber-600">Unassigned</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Desktop Grid View */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredLeads.map(lead => (
                    <div key={lead.id} onClick={() => toggleSelect(lead.id)} className={`p-4 rounded-xl border cursor-pointer ${selectedLeads.has(lead.id) ? 'border-slate-900 ring-1 ring-slate-900' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                      <div className="flex justify-between mb-2">
                        <button className={selectedLeads.has(lead.id) ? 'text-slate-900' : 'text-slate-300'}>{selectedLeads.has(lead.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}</button>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${statusColor[lead.status]}`}>{lead.status.replace(/_/g, ' ')}</span>
                      </div>
                      <h3 className="font-bold text-sm truncate">{lead.customerName || 'Unknown'}</h3>
                      <div className="text-xs text-slate-500 font-mono mb-2">{lead.phone || 'No phone'}</div>
                      {lead.requirement && <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded-md mb-2">{lead.requirement}</p>}
                      <div className="mt-auto pt-2 border-t border-slate-50">{lead.assignedTo?.name ? <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded">{lead.assignedTo.name}</span> : <span className="text-[10px] font-bold bg-amber-50 text-amber-600 px-2 py-1 rounded">Unassigned</span>}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
