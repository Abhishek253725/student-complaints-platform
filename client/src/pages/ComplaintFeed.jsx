import { useState, useEffect } from 'react'
import { Search, Filter, ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import API from '../api/api'

const CATS = ['All', 'Academic', 'Infrastructure', 'Safety', 'Other']
const STATUSES = ['All', 'Pending', 'In Progress', 'Resolved']

function PriorityBadge({ level }) {
  const map = {
    Critical: 'badge-critical',
    High: 'badge-high',
    Medium: 'badge-medium',
    Low: 'badge-low'
  }
  return <span className={map[level] || 'badge-low'}>{level}</span>
}

function StatusBadge({ status }) {
  const map = {
    Pending: 'status-pending',
    'In Progress': 'status-progress',
    Resolved: 'status-resolved'
  }
  return <span className={map[status] || 'status-pending'}>{status}</span>
}

export default function ComplaintFeed() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('All')
  const [status, setStatus] = useState('All')
  const [sort, setSort] = useState('votes')

  // ✅ Backend se complaints fetch karo
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true)
        const res = await API.get('/complaints')
        console.log('API Response:', res.data)

        // ✅ Backend { complaints: [...] } return karta hai
        setComplaints(res.data.complaints || [])

      } catch (err) {
        console.error('Fetch error:', err)
        toast.error('Failed to load complaints')
      } finally {
        setLoading(false)
      }
    }

    fetchComplaints()
  }, [])

  // ✅ Vote Handler
  const handleVote = async (id, type) => {
    try {
      await API.post(`/complaints/${id}/vote`, { type })

      // ✅ Local state update
      setComplaints(prev => prev.map(c =>
        c._id === id
          ? {
              ...c,
              votes: c.votes + (type === 'up' ? 1 : 0),
              downvotes: c.downvotes + (type === 'down' ? 1 : 0)
            }
          : c
      ))
      toast.success('Vote recorded!')

    } catch (err) {
      console.error('Vote error:', err)
      toast.error('Vote failed!')
    }
  }

  // ✅ Filter + Sort
  const filtered = complaints
    .filter(c => {
      const q = search.toLowerCase()
      return (
        (!q ||
          c.title?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q)
        ) &&
        (cat === 'All' || c.category === cat) &&
        (status === 'All' || c.status === status)
      )
    })
    .sort((a, b) =>
      sort === 'votes'
        ? (b.votes || 0) - (a.votes || 0)
        : (b.priorityScore || 0) - (a.priorityScore || 0)
    )

  // ✅ Loading Spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-b-2 border-indigo-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ✅ Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-800 dark:text-white">
          Complaint Feed
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {filtered.length} complaints found
        </p>
      </div>

      {/* ✅ Filters */}
      <div className="p-4 space-y-3 card">

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute -translate-y-1/2 left-3 top-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search complaints..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {CATS.map(c => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${cat === c
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-indigo-50'
                }`}
            >
              {c}
            </button>
          ))}

          {/* Status Filter */}
          <div className="flex gap-2 ml-auto">
            {STATUSES.map(s => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${status === s
                    ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-800'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Filter size={14} />
          <span>Sort by:</span>
          {['votes', 'priority'].map(s => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-all
                ${sort === s
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ✅ Empty State */}
      {filtered.length === 0 && !loading && (
        <div className="py-16 text-center text-slate-400">
          <p className="text-lg font-medium">No complaints found</p>
          <p className="mt-1 text-sm">
            Try changing filters or post a new complaint
          </p>
        </div>
      )}

      {/* ✅ Complaint Cards */}
      <div className="space-y-4">
        {filtered.map(c => (
          <div
            key={c._id}
            className="p-5 transition-all duration-200 card hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800"
          >
            {/* Card Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <PriorityBadge level={c.priorityLevel} />
                  <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                    {c.category}
                  </span>
                </div>
                <h3 className="text-base font-bold font-display text-slate-800 dark:text-white">
                  {c.title}
                </h3>
              </div>
              <StatusBadge status={c.status} />
            </div>

            {/* Description */}
            <p className="mb-4 text-sm leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">
              {c.description}
            </p>

            {/* Card Footer */}
            <div className="flex items-center justify-between">

              {/* Author */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <div className="flex items-center justify-center w-5 h-5 bg-indigo-100 rounded-full dark:bg-indigo-900/50">
                  <span className="text-xs font-bold text-indigo-600">
                    {c.isAnonymous
                      ? 'A'
                      : c.createdBy?.name?.charAt(0)?.toUpperCase() || 'U'
                    }
                  </span>
                </div>
                <span>
                  {c.isAnonymous
                    ? 'Anonymous'
                    : c.createdBy?.name || 'User'
                  }
                </span>
              </div>

              {/* Vote Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleVote(c._id, 'up')}
                  className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <ThumbsUp size={13} />
                  {c.votes || 0}
                </button>

                <button
                  onClick={() => handleVote(c._id, 'down')}
                  className="flex items-center gap-1.5 text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <ThumbsDown size={13} />
                  {c.downvotes || 0}
                </button>

                <button className="flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-600 px-2 py-1.5 rounded-lg transition-colors">
                  <MessageCircle size={13} />
                  Reply
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>

    </div>
  )
}