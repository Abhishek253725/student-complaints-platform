import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../api/api'  // ✅ axios instance use karo - token auto lagega
import toast from 'react-hot-toast'
import { TrendingUp, ThumbsUp, ThumbsDown, CheckCircle, Clock, PlusCircle } from 'lucide-react'

function PriorityBadge({ level }) {
  const map = {
    High:     'badge-high',
    Medium:   'badge-medium',
    Low:      'badge-low',
    Critical: 'badge-critical',
  }
  return <span className={map[level] || 'badge-low'}>{level}</span>
}

function StatusBadge({ status }) {
  const map = {
    Pending:       'status-pending',
    'In Progress': 'status-progress',
    Resolved:      'status-resolved',
  }
  return <span className={map[status] || 'status-pending'}>{status}</span>
}

function StatCard({ icon, label, value, color, bg }) {
  return (
    <div className="flex items-center gap-4 p-5 card">
      <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
        <span className={color}>{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-bold font-display text-slate-800 dark:text-white">{value}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      </div>
    </div>
  )
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading]       = useState(true)
  const [form, setForm]             = useState({
    title:       '',
    description: '',
    category:    'Other',
    anonymous:   false,
  })
  const [submitting, setSubmitting] = useState(false)

  // ── Stats derived from real data ──────────────────────────────────────────
  const myComplaints = complaints.filter(c => {
    const createdById = c.createdBy?._id || c.createdBy
    return String(createdById) === String(user?._id)
  })

  const resolved   = myComplaints.filter(c => c.status === 'Resolved').length
  const pending    = myComplaints.filter(c => c.status === 'Pending').length
  const totalVotes = myComplaints.reduce((acc, c) => acc + (c.votes || 0), 0)

  // ── Fetch on mount ────────────────────────────────────────────────────────
  useEffect(() => {
    fetchComplaints()
  }, [])

  const fetchComplaints = async () => {
    try {
      setLoading(true)
      const { data } = await API.get('/complaints') // ✅ API instance - token auto
      setComplaints(Array.isArray(data) ? data : data.complaints || [])
    } catch (err) {
      console.error('Fetch error:', err)
      toast.error('Could not load complaints')
    } finally {
      setLoading(false)
    }
  }

  // ── Submit complaint ──────────────────────────────────────────────────────
  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim())
      return toast.error('Please fill all fields')

    setSubmitting(true)
    try {
      const { data } = await API.post('/complaints', {  // ✅ API instance
        title:       form.title.trim(),
        description: form.description.trim(),
        category:    form.category,
        anonymous:   form.anonymous,
      })

      const newComplaint = data.complaint || data
      setComplaints(prev => [newComplaint, ...prev])  // ✅ Real-time update
      setForm({ title: '', description: '', category: 'Other', anonymous: false })
      toast.success('Complaint submitted successfully! ✨')
    } catch (err) {
      console.error('Submit error:', err)
      toast.error(err.response?.data?.message || 'Failed to submit complaint')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Vote ──────────────────────────────────────────────────────────────────
  const handleVote = async (id, type) => {
    try {
      const { data } = await API.put(`/complaints/${id}/vote`, { type }) // ✅ API instance
      const updated = data.complaint || data
      setComplaints(prev =>
        prev.map(c => c._id === id ? { ...c, ...updated } : c) // ✅ Real-time update
      )
      toast.success(type === 'up' ? '👍 Upvoted!' : '👎 Downvoted!')
    } catch (err) {
      console.error('Vote error:', err)
      toast.error('Could not record vote')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-800 dark:text-white">
          Student Dashboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
          Raise Your Voice, Be Heard.
        </p>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<TrendingUp size={20}/>}
          label="My Complaints"
          value={loading ? '...' : myComplaints.length}
          color="text-indigo-600"
          bg="bg-indigo-100 dark:bg-indigo-900/30"
        />
        <StatCard
          icon={<CheckCircle size={20}/>}
          label="Resolved"
          value={loading ? '...' : resolved}
          color="text-green-600"
          bg="bg-green-100 dark:bg-green-900/30"
        />
        <StatCard
          icon={<Clock size={20}/>}
          label="Pending"
          value={loading ? '...' : pending}
          color="text-orange-500"
          bg="bg-orange-100 dark:bg-orange-900/30"
        />
        <StatCard
          icon={<ThumbsUp size={20}/>}
          label="Total Votes"
          value={loading ? '...' : totalVotes}
          color="text-blue-600"
          bg="bg-blue-100 dark:bg-blue-900/30"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        {/* ── Post Complaint Form ── */}
        <div className="p-6 card">
          <h2 className="flex items-center gap-2 mb-4 text-lg font-bold font-display text-slate-800 dark:text-white">
            <PlusCircle size={20} className="text-indigo-600"/> Post a Complaint
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Title"
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className="input-field"
            />

            <select
              value={form.category}
              onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
              className="input-field"
            >
              <option value="Infrastructure">Infrastructure</option>
              <option value="Academic">Academic</option>
              <option value="Safety">Safety</option>
              <option value="Other">Other</option>
            </select>

            <textarea
              placeholder="Description – be specific about the issue..."
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={4}
              className="resize-none input-field"
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm cursor-pointer text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={form.anonymous}
                  onChange={e => setForm(p => ({ ...p, anonymous: e.target.checked }))}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                Post Anonymously
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex items-center gap-2 py-2.5 text-sm"
              >
                {submitting && (
                  <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"/>
                )}
                {submitting ? 'Submitting...' : 'Submit Complaint'}
              </button>
            </div>
          </form>
        </div>

        {/* ── Recent Complaints ── */}
        <div className="p-6 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold font-display text-slate-800 dark:text-white">
              Recent Complaints
            </h2>
            <Link
              to="/complaints"
              className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View All →
            </Link>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 border-2 border-indigo-600 rounded-full border-t-transparent animate-spin"/>
            </div>
          )}

          {/* Empty */}
          {!loading && complaints.length === 0 && (
            <div className="py-10 text-center text-slate-400 dark:text-slate-500">
              <p className="text-sm">No complaints yet.</p>
              <p className="mt-1 text-xs">Be the first to raise an issue!</p>
            </div>
          )}

          {/* List */}
          {!loading && complaints.length > 0 && (
            <div className="space-y-3">
              {complaints.slice(0, 4).map(c => (
                <div
                  key={c._id}
                  className="p-3 transition-all border rounded-xl bg-slate-50 dark:bg-slate-700/50 border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-700"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-semibold leading-tight text-slate-800 dark:text-white">
                      {c.title}
                    </p>
                    <StatusBadge status={c.status}/>
                  </div>
                  <div className="flex items-center justify-between">
                    <PriorityBadge level={c.priorityLevel}/>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleVote(c._id, 'up')}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-green-600 transition-colors rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
                      >
                        <ThumbsUp size={12}/> {c.votes || 0}
                      </button>
                      <button
                        onClick={() => handleVote(c._id, 'down')}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <ThumbsDown size={12}/> {c.downvotes || 0}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}