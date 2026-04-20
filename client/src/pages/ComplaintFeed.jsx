import { useState } from 'react'
import { Search, Filter, ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const ALL = [
  { _id:'1', title:'WiFi Not Working in Dorms', description:'The internet in all hostel rooms has been down for 5 days. Students cannot submit assignments or attend online classes.', category:'Infrastructure', priorityLevel:'High', status:'Pending', votes:73, downvotes:10, isAnonymous:false, author:'Raj K.' },
  { _id:'2', title:'Library Needs More Books', description:'The library lacks sufficient copies of reference books for final year exams. Multiple students compete for single copies.', category:'Academic', priorityLevel:'Medium', status:'In Progress', votes:93, downvotes:8, isAnonymous:false, author:'Anita S.' },
  { _id:'3', title:'Mess Food Quality is Poor', description:'The quality and hygiene of food served in the main mess has deteriorated significantly over the past month.', category:'Other', priorityLevel:'Low', status:'Resolved', votes:77, downvotes:4, isAnonymous:true, author:'Anonymous' },
  { _id:'4', title:'Ragging Incident in Hostel', description:'Serious ragging incident reported on 3rd floor. Immediate attention required.', category:'Safety', priorityLevel:'Critical', status:'Pending', votes:87, downvotes:2, isAnonymous:false, author:'M. Sharma' },
  { _id:'5', title:'Safety Concern in Chemistry Lab', description:'Expired chemicals are still being used in practicals. Fire hazard risk is high. Lab attendants are unresponsive.', category:'Safety', priorityLevel:'High', status:'Pending', votes:72, downvotes:2, isAnonymous:false, author:'Priya M.' },
  { _id:'6', title:'Broken Classroom Chairs', description:'Over 40% of chairs in block C classrooms are broken or unstable. Students are sitting on floors.', category:'Infrastructure', priorityLevel:'High', status:'Pending', votes:56, downvotes:3, isAnonymous:false, author:'Dev R.' },
]

const CATS = ['All', 'Academic', 'Infrastructure', 'Safety', 'Other']
const STATUSES = ['All', 'Pending', 'In Progress', 'Resolved']

function PriorityBadge({ level }) {
  const map = { Critical:'badge-critical', High:'badge-high', Medium:'badge-medium', Low:'badge-low' }
  return <span className={map[level] || 'badge-low'}>{level}</span>
}
function StatusBadge({ status }) {
  const map = { Pending:'status-pending', 'In Progress':'status-progress', Resolved:'status-resolved' }
  return <span className={map[status] || 'status-pending'}>{status}</span>
}

export default function ComplaintFeed() {
  const [complaints, setComplaints] = useState(ALL)
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('All')
  const [status, setStatus] = useState('All')
  const [sort, setSort] = useState('votes')

  const handleVote = (id, type) => {
    setComplaints(prev => prev.map(c =>
      c._id === id ? { ...c, votes: c.votes + (type === 'up' ? 1 : 0), downvotes: c.downvotes + (type === 'down' ? 1 : 0) } : c
    ))
    toast.success('Vote recorded!')
  }

  const filtered = complaints
    .filter(c => {
      const q = search.toLowerCase()
      return (!q || c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q))
        && (cat === 'All' || c.category === cat)
        && (status === 'All' || c.status === status)
    })
    .sort((a, b) => sort === 'votes' ? b.votes - a.votes : b.priorityScore - a.priorityScore)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-800 dark:text-white">Complaint Feed</h1>
        <p className="text-slate-500 text-sm mt-0.5">{filtered.length} complaints found</p>
      </div>

      {/* Filters */}
      <div className="card p-4 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text" placeholder="Search complaints..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${cat === c ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-indigo-50'}`}>
              {c}
            </button>
          ))}
          <div className="ml-auto flex gap-2">
            {STATUSES.map(s => (
              <button key={s} onClick={() => setStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${status === s ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-800' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Filter size={14} />
          <span>Sort by:</span>
          {['votes', 'priority'].map(s => (
            <button key={s} onClick={() => setSort(s)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-all
                ${sort === s ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {filtered.map(c => (
          <div key={c._id} className="card p-5 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-200">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <PriorityBadge level={c.priorityLevel} />
                  <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">{c.category}</span>
                </div>
                <h3 className="font-display font-bold text-slate-800 dark:text-white text-base">{c.title}</h3>
              </div>
              <StatusBadge status={c.status} />
            </div>

            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-4 line-clamp-2">{c.description}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <div className="w-5 h-5 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 text-xs font-bold">{c.author.charAt(0)}</span>
                </div>
                {c.isAnonymous ? 'Anonymous' : c.author}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleVote(c._id, 'up')}
                  className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors">
                  <ThumbsUp size={13} /> {c.votes}
                </button>
                <button onClick={() => handleVote(c._id, 'down')}
                  className="flex items-center gap-1.5 text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors">
                  <ThumbsDown size={13} /> {c.downvotes}
                </button>
                <button className="flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-600 px-2 py-1.5 rounded-lg transition-colors">
                  <MessageCircle size={13} /> Reply
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
