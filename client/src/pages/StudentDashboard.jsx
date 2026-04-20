import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'
import { TrendingUp, ThumbsUp, ThumbsDown, AlertTriangle, CheckCircle, Clock, PlusCircle } from 'lucide-react'

const MOCK_COMPLAINTS = [
  { _id:'1', title:'WiFi Not Working in Dorms', category:'Infrastructure', priorityLevel:'High', status:'Pending', votes:73, downvotes:10 },
  { _id:'2', title:'Library Needs More Books', category:'Academic', priorityLevel:'Medium', status:'In Progress', votes:93, downvotes:8 },
  { _id:'3', title:'Mess Food Quality is Poor', category:'Other', priorityLevel:'Low', status:'Resolved', votes:77, downvotes:4 },
  { _id:'4', title:'Safety Concern in Chemistry Lab', category:'Safety', priorityLevel:'High', status:'Pending', votes:65, downvotes:2 },
]

function PriorityBadge({ level }) {
  const map = { High:'badge-high', Medium:'badge-medium', Low:'badge-low', Critical:'badge-critical' }
  return <span className={map[level] || 'badge-low'}>{level}</span>
}

function StatusBadge({ status }) {
  const map = { Pending:'status-pending', 'In Progress':'status-progress', Resolved:'status-resolved' }
  return <span className={map[status] || 'status-pending'}>{status}</span>
}

function StatCard({ icon, label, value, color, bg }) {
  return (
    <div className={`card p-5 flex items-center gap-4`}>
      <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
        <span className={color}>{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-display font-bold text-slate-800 dark:text-white">{value}</p>
        <p className="text-slate-500 dark:text-slate-400 text-sm">{label}</p>
      </div>
    </div>
  )
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const [complaints, setComplaints] = useState(MOCK_COMPLAINTS)
  const [form, setForm] = useState({ title: '', description: '', anonymous: false })
  const [submitting, setSubmitting] = useState(false)

  const handleVote = (id, type) => {
    setComplaints(prev => prev.map(c =>
      c._id === id ? { ...c, votes: c.votes + (type === 'up' ? 1 : 0), downvotes: (c.downvotes||0) + (type === 'down' ? 1 : 0) } : c
    ))
    toast.success(`Vote recorded!`)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.title || !form.description) return toast.error('Please fill all fields')
    setSubmitting(true)
    try {
      // Simulate AI analysis
      await new Promise(r => setTimeout(r, 1500))
      const newComplaint = {
        _id: Date.now().toString(),
        title: form.title,
        category: 'Other',
        priorityLevel: 'Medium',
        status: 'Pending',
        votes: 0,
        downvotes: 0,
      }
      setComplaints(prev => [newComplaint, ...prev])
      setForm({ title: '', description: '', anonymous: false })
      toast.success('Complaint submitted & AI analyzed! ✨')
    } catch {
      toast.error('Failed to submit complaint')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-800 dark:text-white">Student Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Raise Your Voice, Be Heard.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<TrendingUp size={20}/>} label="My Complaints" value="12" color="text-indigo-600" bg="bg-indigo-100 dark:bg-indigo-900/30" />
        <StatCard icon={<CheckCircle size={20}/>} label="Resolved" value="8" color="text-green-600" bg="bg-green-100 dark:bg-green-900/30" />
        <StatCard icon={<Clock size={20}/>} label="Pending" value="3" color="text-orange-500" bg="bg-orange-100 dark:bg-orange-900/30" />
        <StatCard icon={<ThumbsUp size={20}/>} label="Total Votes" value="247" color="text-blue-600" bg="bg-blue-100 dark:bg-blue-900/30" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Post Complaint Form */}
        <div className="card p-6">
          <h2 className="font-display font-bold text-lg text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <PlusCircle size={20} className="text-indigo-600" /> Post a Complaint
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text" placeholder="Title"
              value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className="input-field"
            />
            <textarea
              placeholder="Description – be specific about the issue..."
              value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={4} className="input-field resize-none"
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                <input type="checkbox" checked={form.anonymous} onChange={e => setForm(p => ({ ...p, anonymous: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                Post Anonymously
              </label>
              <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2 py-2.5 text-sm">
                {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                {submitting ? 'Analyzing...' : 'Submit Complaint'}
              </button>
            </div>
          </form>
        </div>

        {/* Recent Complaints */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg text-slate-800 dark:text-white">Recent Complaints</h2>
            <Link to="/complaints" className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline">View All →</Link>
          </div>
          <div className="space-y-3">
            {complaints.slice(0, 4).map(c => (
              <div key={c._id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-700 transition-all">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-semibold text-sm text-slate-800 dark:text-white leading-tight">{c.title}</p>
                  <StatusBadge status={c.status} />
                </div>
                <div className="flex items-center justify-between">
                  <PriorityBadge level={c.priorityLevel} />
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleVote(c._id, 'up')}
                      className="flex items-center gap-1 text-xs text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 px-2 py-1 rounded-lg transition-colors">
                      <ThumbsUp size={12} /> {c.votes}
                    </button>
                    <button onClick={() => handleVote(c._id, 'down')}
                      className="flex items-center gap-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded-lg transition-colors">
                      <ThumbsDown size={12} /> {c.downvotes || 0}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
