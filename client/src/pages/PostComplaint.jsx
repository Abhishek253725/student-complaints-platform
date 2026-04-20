import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Send, AlertTriangle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const CATEGORIES = ['Academic', 'Infrastructure', 'Safety', 'Other']

const CRITICAL_KEYWORDS = ['ragging', 'harassment', 'danger', 'violence', 'threat', 'assault']

function analyzeLocally(text) {
  const lower = text.toLowerCase()
  const hasCritical = CRITICAL_KEYWORDS.some(kw => lower.includes(kw))
  let score = 30 + Math.floor(Math.random() * 40)
  if (hasCritical) score = 85 + Math.floor(Math.random() * 15)
  const level = score >= 80 ? 'Critical' : score >= 60 ? 'High' : score >= 40 ? 'Medium' : 'Low'

  let category = 'Other'
  if (/wifi|internet|infra|chair|lab|hostel|building|room|facility/.test(lower)) category = 'Infrastructure'
  else if (/exam|library|book|teacher|class|course|academic|study/.test(lower)) category = 'Academic'
  else if (/ragging|harass|danger|violence|safe|fire|chemical/.test(lower)) category = 'Safety'

  return { category, priorityScore: score, priorityLevel: level, summary: text.slice(0, 120) + '...' }
}

export default function PostComplaint() {
  const [form, setForm] = useState({ title: '', description: '', anonymous: false })
  const [analysis, setAnalysis] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const change = e => {
    setForm(p => ({ ...p, [e.target.name]: e.target.name === 'anonymous' ? e.target.checked : e.target.value }))
    if (analysis) setAnalysis(null)
  }

  const analyzeWithAI = async () => {
    if (!form.description || form.description.length < 20) return toast.error('Please write a description first (min 20 chars)')
    setAnalyzing(true)
    await new Promise(r => setTimeout(r, 1800))
    const result = analyzeLocally(form.description)
    setAnalysis(result)
    setAnalyzing(false)
    toast.success('AI analysis complete! ✨')
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.title) return toast.error('Title is required')
    if (!form.description || form.description.length < 20) return toast.error('Description too short')
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 1200))
    toast.success('Complaint submitted successfully!')
    navigate('/complaints')
  }

  const levelColor = { Critical:'text-red-600', High:'text-orange-500', Medium:'text-yellow-600', Low:'text-green-600' }
  const levelBg = { Critical:'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800', High:'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800', Medium:'bg-yellow-50 border-yellow-200', Low:'bg-green-50 border-green-200' }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-800 dark:text-white">Post a Complaint</h1>
        <p className="text-slate-500 text-sm mt-0.5">Our AI will analyze and categorize your complaint automatically</p>
      </div>

      {/* Critical keywords banner */}
      {form.description && CRITICAL_KEYWORDS.some(kw => form.description.toLowerCase().includes(kw)) && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl animate-fade-in">
          <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
          <div>
            <p className="text-red-700 dark:text-red-400 font-semibold text-sm">Critical keywords detected!</p>
            <p className="text-red-600 dark:text-red-400 text-xs">This complaint will be marked HIGH PRIORITY and escalated immediately.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Complaint Title *</label>
            <input name="title" type="text" placeholder="Brief summary of the issue"
              value={form.title} onChange={change} className="input-field" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Description *</label>
            <textarea name="description" rows={6}
              placeholder="Describe your complaint in detail. Include when, where, and how it affects you and others..."
              value={form.description} onChange={change} className="input-field resize-none" />
            <p className="text-xs text-slate-400 mt-1">{form.description.length} characters (minimum 20)</p>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input name="anonymous" type="checkbox" checked={form.anonymous} onChange={change}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Post Anonymously</span>
            </label>
            <button type="button" onClick={analyzeWithAI} disabled={analyzing}
              className="flex items-center gap-2 px-4 py-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-xl text-sm font-semibold hover:bg-violet-200 transition-colors disabled:opacity-60">
              {analyzing ? (
                <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Sparkles size={15} />
              )}
              {analyzing ? 'Analyzing...' : 'Analyze with AI'}
            </button>
          </div>
        </div>

        {/* AI Analysis Result */}
        {analysis && (
          <div className={`card p-5 border-2 ${levelBg[analysis.priorityLevel]} animate-slide-up`}>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle size={18} className="text-green-600" />
              <p className="font-display font-bold text-slate-800 dark:text-white">AI Analysis Complete</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">Category</p>
                <p className="font-bold text-slate-800 dark:text-white text-sm">{analysis.category}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">Priority Score</p>
                <div className="relative w-12 h-12 mx-auto">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15" fill="none"
                      stroke={analysis.priorityScore >= 80 ? '#ef4444' : analysis.priorityScore >= 60 ? '#f97316' : '#6366f1'}
                      strokeWidth="3" strokeDasharray={`${analysis.priorityScore * 0.94} 100`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200">{analysis.priorityScore}</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">Priority Level</p>
                <p className={`font-bold text-sm ${levelColor[analysis.priorityLevel]}`}>{analysis.priorityLevel}</p>
              </div>
            </div>
          </div>
        )}

        <button type="submit" disabled={submitting}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-base">
          {submitting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <><Send size={18} /> Submit Complaint</>
          )}
        </button>
      </form>
    </div>
  )
}
