import { useState } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { ShieldCheck, CheckCircle, Clock, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'

const COMPLAINTS = [
  { _id:'1', title:'Ragging Incident in Hostel', category:'Safety', priorityLevel:'Critical', status:'Pending', votes:87 },
  { _id:'2', title:'Safety Concern in Chemistry Lab', category:'Safety', priorityLevel:'High', status:'Pending', votes:72 },
  { _id:'3', title:'Broken Classroom Chairs', category:'Infrastructure', priorityLevel:'High', status:'Pending', votes:56 },
  { _id:'4', title:'WiFi Not Working in Dorms', category:'Infrastructure', priorityLevel:'High', status:'Pending', votes:73 },
  { _id:'5', title:'Canteen Hygiene Issue', category:'Other', priorityLevel:'Medium', status:'In Progress', votes:45 },
  { _id:'6', title:'Library Needs More Books', category:'Academic', priorityLevel:'Medium', status:'Resolved', votes:93 },
]

const CAT_DATA = [
  { name: 'Safety', value: 2, color: '#ef4444' },
  { name: 'Infrastructure', value: 2, color: '#f97316' },
  { name: 'Academic', value: 1, color: '#6366f1' },
  { name: 'Other', value: 1, color: '#10b981' },
]

const STATUS_DATA = [
  { name: 'Pending', count: 4, fill: '#6366f1' },
  { name: 'In Progress', count: 1, fill: '#f59e0b' },
  { name: 'Resolved', count: 1, fill: '#10b981' },
]

const STATUSES = ['Pending', 'In Progress', 'Resolved']

function PriorityBadge({ level }) {
  const map = { Critical:'badge-critical', High:'badge-high', Medium:'badge-medium', Low:'badge-low' }
  return <span className={map[level] || 'badge-low'}>{level}</span>
}

function StatusBadge({ status }) {
  const map = { Pending:'status-pending', 'In Progress':'status-progress', Resolved:'status-resolved' }
  return <span className={map[status] || 'status-pending'}>{status}</span>
}

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState(COMPLAINTS)
  const [expanded, setExpanded] = useState(null)

  const updateStatus = (id, status) => {
    setComplaints(prev => prev.map(c => c._id === id ? { ...c, status } : c))
  }

  const highPriority = complaints.filter(c => c.priorityLevel === 'High' || c.priorityLevel === 'Critical')

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-800 dark:text-white">Admin Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Manage Complaints Efficiently</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Total Complaints', val:128, color:'bg-indigo-600', icon:<ShieldCheck size={20}/> },
          { label:'Resolved', val:75, color:'bg-green-500', icon:<CheckCircle size={20}/> },
          { label:'Pending', val:34, color:'bg-orange-500', icon:<Clock size={20}/> },
          { label:'High Priority', val:19, color:'bg-red-500', icon:<AlertTriangle size={20}/> },
        ].map((s,i) => (
          <div key={i} className={`${s.color} rounded-2xl p-5 text-white shadow-lg`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/80 text-xs font-medium">{s.label}</p>
              {s.icon}
            </div>
            <p className="text-3xl font-display font-bold">{s.val}</p>
          </div>
        ))}
      </div>

      {/* High Priority Issues */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-lg text-slate-800 dark:text-white">High Priority Issues</h2>
          <button className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline">View All →</button>
        </div>
        <div className="space-y-3">
          {highPriority.map(c => (
            <div key={c._id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={16} className="text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-slate-800 dark:text-white truncate">{c.title}</p>
                <p className="text-xs text-slate-400">{c.votes} Votes</p>
              </div>
              <PriorityBadge level={c.priorityLevel} />
              <span className="text-slate-400 font-bold text-sm">{c.votes}</span>
              <span className="text-xs text-slate-400">Votes</span>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-display font-bold text-base text-slate-800 dark:text-white mb-4">Complaints by Category</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={CAT_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                {CAT_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {CAT_DATA.map(d => (
              <div key={d.name} className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                {d.name} ({d.value})
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-display font-bold text-base text-slate-800 dark:text-white mb-4">Status Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={STATUS_DATA} barSize={40}>
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip />
              <Bar dataKey="count" radius={[8,8,0,0]}>
                {STATUS_DATA.map((e,i) => <Cell key={i} fill={e.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Complaint Management Table */}
      <div className="card p-6">
        <h2 className="font-display font-bold text-lg text-slate-800 dark:text-white mb-4">Recent Complaints</h2>
        <div className="space-y-2">
          {complaints.map(c => (
            <div key={c._id} className="border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === c._id ? null : c._id)}
                className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors text-left">
                <div className="flex-1 flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ShieldCheck size={14} className="text-indigo-600" />
                  </div>
                  <p className="font-medium text-sm text-slate-800 dark:text-white truncate">{c.title}</p>
                </div>
                <StatusBadge status={c.status} />
                {expanded === c._id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
              </button>
              {expanded === c._id && (
                <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-700 pt-3 bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex flex-wrap items-center gap-3">
                    <PriorityBadge level={c.priorityLevel} />
                    <span className="text-xs text-slate-400">{c.category} · {c.votes} votes</span>
                    <div className="ml-auto flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-medium">Update Status:</span>
                      {STATUSES.map(s => (
                        <button key={s} onClick={() => updateStatus(c._id, s)}
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all
                            ${c.status === s ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-indigo-400'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
