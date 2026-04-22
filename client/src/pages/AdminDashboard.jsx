import { useState, useEffect } from 'react'
import API from '../api/api'
import toast from 'react-hot-toast'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer
} from 'recharts'
import {
  ShieldCheck, CheckCircle, Clock, AlertTriangle,
  ChevronDown, ChevronUp, RefreshCw
} from 'lucide-react'

const STATUSES = ['Pending', 'In Progress', 'Resolved']
const CAT_COLORS = {
  Safety: '#ef4444',
  Infrastructure: '#f97316',
  Academic: '#6366f1',
  Other: '#10b981',
}
const STATUS_COLORS = {
  Pending: '#6366f1',
  'In Progress': '#f59e0b',
  Resolved: '#10b981',
}

function PriorityBadge({ level }) {
  const map = {
    Critical: 'badge-critical',
    High: 'badge-high',
    Medium: 'badge-medium',
    Low: 'badge-low',
  }
  return <span className={map[level] || 'badge-low'}>{level}</span>
}

function StatusBadge({ status }) {
  const map = {
    Pending: 'status-pending',
    'In Progress': 'status-progress',
    Resolved: 'status-resolved',
  }
  return <span className={map[status] || 'status-pending'}>{status}</span>
}

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  // ── Fetch All Data ────────────────────────────────────────────────────
  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      setLoading(true)
      const [complaintsRes, statsRes] = await Promise.all([
        API.get('/complaints'),
        API.get('/complaints/stats'),
      ])

      const complaintsData = complaintsRes.data.complaints || complaintsRes.data || []
      setComplaints(complaintsData)
      setStats(statsRes.data)
    } catch (err) {
      console.error('Admin fetch error:', err)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  // ── Update Status (Real API call) ─────────────────────────────────────
  const updateStatus = async (id, status) => {
    try {
      setUpdatingId(id)
      const { data } = await API.put(`/complaints/${id}/status`, { status })
      const updated = data.complaint || data

      // ✅ Real-time update - UI instantly change
      setComplaints(prev =>
        prev.map(c => (c._id === id ? { ...c, ...updated } : c))
      )

      // ✅ Stats bhi update karo
      updateLocalStats(status)

      toast.success(`Status updated to "${status}" ✅`)
    } catch (err) {
      console.error('Status update error:', err)
      toast.error(err.response?.data?.message || 'Failed to update status')
    } finally {
      setUpdatingId(null)
    }
  }

  // ── Local Stats Update (bina API call ke) ─────────────────────────────
  const updateLocalStats = (newStatus) => {
    if (!stats) return
    setStats(prev => {
      const updated = { ...prev }
      // Recalculate from complaints
      const all = complaints
      updated.pending = all.filter(c => c.status === 'Pending').length
      updated.inProgress = all.filter(c => c.status === 'In Progress').length
      updated.resolved = all.filter(c => c.status === 'Resolved').length
      return updated
    })
  }

  // ── Derived Dynamic Data ──────────────────────────────────────────────
  const totalComplaints = stats?.total || complaints.length
  const resolvedCount = stats?.resolved || complaints.filter(c => c.status === 'Resolved').length
  const pendingCount = stats?.pending || complaints.filter(c => c.status === 'Pending').length
  const highPriorityCount = complaints.filter(
    c => c.priorityLevel === 'High' || c.priorityLevel === 'Critical'
  ).length

  const highPriority = complaints
    .filter(c => c.priorityLevel === 'High' || c.priorityLevel === 'Critical')
    .sort((a, b) => (b.votes || 0) - (a.votes || 0))

  // ── Dynamic Chart Data ────────────────────────────────────────────────
  const categoryData = (() => {
    const map = {}
    complaints.forEach(c => {
      const cat = c.category || 'Other'
      map[cat] = (map[cat] || 0) + 1
    })
    return Object.entries(map).map(([name, value]) => ({
      name,
      value,
      color: CAT_COLORS[name] || '#94a3b8',
    }))
  })()

  const statusData = (() => {
    const map = {}
    complaints.forEach(c => {
      const s = c.status || 'Pending'
      map[s] = (map[s] || 0) + 1
    })
    return Object.entries(map).map(([name, count]) => ({
      name,
      count,
      fill: STATUS_COLORS[name] || '#94a3b8',
    }))
  })()

  // ── Loading State ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-4 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin" />
          <p className="text-slate-500 dark:text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-800 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage {totalComplaints} Complaints Efficiently
          </p>
        </div>
        <button
          onClick={fetchAll}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 transition-colors bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* ── Stats Row (DYNAMIC) ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: 'Total Complaints',
            val: totalComplaints,
            color: 'bg-indigo-600',
            icon: <ShieldCheck size={20} />,
          },
          {
            label: 'Resolved',
            val: resolvedCount,
            color: 'bg-green-500',
            icon: <CheckCircle size={20} />,
          },
          {
            label: 'Pending',
            val: pendingCount,
            color: 'bg-orange-500',
            icon: <Clock size={20} />,
          },
          {
            label: 'High Priority',
            val: highPriorityCount,
            color: 'bg-red-500',
            icon: <AlertTriangle size={20} />,
          },
        ].map((s, i) => (
          <div key={i} className={`${s.color} rounded-2xl p-5 text-white shadow-lg`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-white/80">{s.label}</p>
              {s.icon}
            </div>
            <p className="text-3xl font-bold font-display">{s.val}</p>
          </div>
        ))}
      </div>

      {/* ── High Priority Issues (DYNAMIC) ── */}
      <div className="p-6 card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold font-display text-slate-800 dark:text-white">
            High Priority Issues ({highPriority.length})
          </h2>
        </div>

        {highPriority.length === 0 ? (
          <div className="py-8 text-center text-slate-400 dark:text-slate-500">
            <CheckCircle size={40} className="mx-auto mb-2 text-green-400" />
            <p className="text-sm">No high priority issues! 🎉</p>
          </div>
        ) : (
          <div className="space-y-3">
            {highPriority.map(c => (
              <div
                key={c._id}
                className="flex items-center gap-3 p-3 border rounded-xl bg-slate-50 dark:bg-slate-700/50 border-slate-100 dark:border-slate-700"
              >
                <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-xl">
                  <AlertTriangle size={16} className="text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate text-slate-800 dark:text-white">
                    {c.title}
                  </p>
                  <p className="text-xs text-slate-400">
                    {c.category} · by{' '}
                    {c.isAnonymous
                      ? 'Anonymous'
                      : c.createdBy?.name || 'Unknown'}
                  </p>
                </div>
                <PriorityBadge level={c.priorityLevel} />
                <StatusBadge status={c.status} />
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  {c.votes || 0}
                </span>
                <span className="text-xs text-slate-400">Votes</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Charts (DYNAMIC) ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category Pie Chart */}
        <div className="p-6 card">
          <h2 className="mb-4 text-base font-bold font-display text-slate-800 dark:text-white">
            Complaints by Category
          </h2>
          {categoryData.length === 0 ? (
            <p className="py-10 text-sm text-center text-slate-400">No data yet</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((e, i) => (
                      <Cell key={i} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {categoryData.map(d => (
                  <div
                    key={d.name}
                    className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: d.color }}
                    />
                    {d.name} ({d.value})
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Status Bar Chart */}
        <div className="p-6 card">
          <h2 className="mb-4 text-base font-bold font-display text-slate-800 dark:text-white">
            Status Distribution
          </h2>
          {statusData.length === 0 ? (
            <p className="py-10 text-sm text-center text-slate-400">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={statusData} barSize={40}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {statusData.map((e, i) => (
                    <Cell key={i} fill={e.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Complaint Management Table (DYNAMIC) ── */}
      <div className="p-6 card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold font-display text-slate-800 dark:text-white">
            All Complaints ({complaints.length})
          </h2>
        </div>

        {complaints.length === 0 ? (
          <div className="py-10 text-center text-slate-400 dark:text-slate-500">
            <p className="text-sm">No complaints found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {complaints.map(c => (
              <div
                key={c._id}
                className="overflow-hidden border border-slate-100 dark:border-slate-700 rounded-xl"
              >
                <button
                  onClick={() =>
                    setExpanded(expanded === c._id ? null : c._id)
                  }
                  className="flex items-center w-full gap-3 p-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/30"
                >
                  <div className="flex items-center flex-1 min-w-0 gap-3">
                    <div className="flex items-center justify-center flex-shrink-0 bg-indigo-100 rounded-lg w-7 h-7 dark:bg-indigo-900/30">
                      <ShieldCheck size={14} className="text-indigo-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate text-slate-800 dark:text-white">
                        {c.title}
                      </p>
                      <p className="text-xs text-slate-400">
                        {c.isAnonymous
                          ? 'Anonymous'
                          : c.createdBy?.name || 'Unknown'}{' '}
                        · {new Date(c.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <PriorityBadge level={c.priorityLevel} />
                  <StatusBadge status={c.status} />
                  {expanded === c._id ? (
                    <ChevronUp size={16} className="text-slate-400" />
                  ) : (
                    <ChevronDown size={16} className="text-slate-400" />
                  )}
                </button>

                {expanded === c._id && (
                  <div className="px-4 pt-3 pb-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    {/* Description */}
                    <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">
                      {c.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                      <PriorityBadge level={c.priorityLevel} />
                      <span className="text-xs text-slate-400">
                        {c.category} · {c.votes || 0} upvotes ·{' '}
                        {c.downvotes || 0} downvotes
                      </span>

                      <div className="flex items-center gap-2 ml-auto">
                        <span className="text-xs font-medium text-slate-500">
                          Update Status:
                        </span>
                        {STATUSES.map(s => (
                          <button
                            key={s}
                            onClick={() => updateStatus(c._id, s)}
                            disabled={updatingId === c._id}
                            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all
                              ${
                                c.status === s
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-indigo-400'
                              }
                              ${updatingId === c._id ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                          >
                            {updatingId === c._id && c.status !== s ? (
                              <div className="w-3 h-3 border-2 border-current rounded-full border-t-transparent animate-spin" />
                            ) : (
                              s
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}