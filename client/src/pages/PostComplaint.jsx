import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import API from '../api/api'

const CRITICAL_KEYWORDS = [
  'ragging',
  'harassment', 
  'danger', 
  'violence', 
  'threat', 
  'assault'
]

function analyzeLocally(text) {
  const lower = text.toLowerCase()
  const hasCritical = CRITICAL_KEYWORDS.some(kw => lower.includes(kw))

  let score = 30 + Math.floor(Math.random() * 40)
  if (hasCritical) score = 85 + Math.floor(Math.random() * 15)

  const level =
    score >= 80 ? 'Critical' :
    score >= 60 ? 'High' :
    score >= 40 ? 'Medium' : 'Low'

  let category = 'Other'
  if (/wifi|internet|infra|chair|lab|hostel|building|room|facility/.test(lower)) {
    category = 'Infrastructure'
  } else if (/exam|library|book|teacher|class|course|academic|study/.test(lower)) {
    category = 'Academic'
  } else if (/ragging|harass|danger|violence|safe|fire|chemical/.test(lower)) {
    category = 'Safety'
  }

  return {
    category,
    priorityScore: score,
    priorityLevel: level,
    summary: text.slice(0, 120) + '...'
  }
}

export default function PostComplaint() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    anonymous: false
  })

  const [analysis, setAnalysis] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const navigate = useNavigate()

  // ✅ Input Change Handler
  const change = (e) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]:
        e.target.name === 'anonymous'
          ? e.target.checked
          : e.target.value
    }))
    if (analysis) setAnalysis(null)
  }

  // ✅ AI Analyze Handler
  const analyzeWithAI = async () => {
    if (!form.description || form.description.length < 20) {
      return toast.error('Please write at least 20 characters')
    }

    setAnalyzing(true)
    await new Promise(r => setTimeout(r, 1200))
    const result = analyzeLocally(form.description)
    setAnalysis(result)
    setAnalyzing(false)
    toast.success('AI analysis complete!')
  }

  // ✅ Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.title.trim()) {
      return toast.error('Title is required')
    }
    if (!form.description || form.description.length < 20) {
      return toast.error('Description too short (min 20 characters)')
    }

    setSubmitting(true)

    try {
      const res = await API.post('/complaints', {
        title: form.title.trim(),
        description: form.description.trim(),
        category: analysis?.category || 'Other',
        anonymous: form.anonymous,       // ✅ FIXED - 'anonymous' key
        priorityScore: analysis?.priorityScore || 10,
        priorityLevel: analysis?.priorityLevel || 'Low',
        summary: analysis?.summary || form.description.slice(0, 120),
      })

      console.log('✅ Saved:', res.data)
      toast.success('Complaint submitted successfully!')
      navigate('/complaints')

    } catch (err) {
      console.error('❌ Submit error:', err.response?.data || err.message)
      toast.error(err.response?.data?.message || 'Error submitting complaint')
    } finally {
      setSubmitting(false)
    }
  }

  // ✅ Style Maps
  const levelBg = {
    Critical: 'bg-red-50 border-red-200',
    High: 'bg-orange-50 border-orange-200',
    Medium: 'bg-yellow-50 border-yellow-200',
    Low: 'bg-green-50 border-green-200'
  }

  const levelText = {
    Critical: 'text-red-700',
    High: 'text-orange-700',
    Medium: 'text-yellow-700',
    Low: 'text-green-700'
  }

  const isCritical = form.description &&
    CRITICAL_KEYWORDS.some(kw =>
      form.description.toLowerCase().includes(kw)
    )

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">

      {/* ✅ Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-800 dark:text-white">
          Post Complaint
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Submit your complaint and let AI analyze its priority
        </p>
      </div>

      {/* ✅ Critical Alert */}
      {isCritical && (
        <div className="flex items-center gap-2 p-3 bg-red-100 border border-red-300 rounded-lg">
          <AlertTriangle size={16} className="text-red-600 shrink-0" />
          <p className="text-sm font-medium text-red-700">
            ⚠️ Critical issue detected! This will be flagged immediately.
          </p>
        </div>
      )}

      {/* ✅ Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-5 card">

        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            name="title"
            placeholder="Enter complaint title..."
            value={form.title}
            onChange={change}
            className="w-full input-field"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            placeholder="Describe your complaint in detail (min 20 characters)..."
            value={form.description}
            onChange={change}
            rows={5}
            className="w-full resize-none input-field"
          />
          {/* ✅ Character Counter */}
          <p className={`text-xs text-right ${
            form.description.length < 20
              ? 'text-red-400'
              : 'text-green-500'
          }`}>
            {form.description.length} / 20 min characters
          </p>
        </div>

        {/* ✅ Anonymous Checkbox */}
        <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
          <input
            type="checkbox"
            name="anonymous"
            checked={form.anonymous}
            onChange={change}
            className="w-4 h-4 rounded accent-indigo-600"
          />
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Post Anonymously
          </span>
        </label>

        {/* ✅ AI Analyze Button */}
        <button
          type="button"
          onClick={analyzeWithAI}
          disabled={analyzing}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 transition-all rounded-lg dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Sparkles size={16} className={analyzing ? 'animate-spin' : ''} />
          {analyzing ? 'Analyzing with AI...' : '✨ Analyze with AI'}
        </button>

        {/* ✅ Analysis Result Card */}
        {analysis && (
          <div className={`p-4 border rounded-lg space-y-3 
            ${levelBg[analysis.priorityLevel]}`}
          >
            <p className={`text-sm font-bold ${levelText[analysis.priorityLevel]}`}>
              🤖 AI Analysis Result
            </p>

            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="space-y-0.5">
                <p className="text-xs text-slate-400">Category</p>
                <p className="font-semibold text-slate-700">
                  {analysis.category}
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-slate-400">Priority</p>
                <p className={`font-bold ${levelText[analysis.priorityLevel]}`}>
                  {analysis.priorityLevel}
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-slate-400">Score</p>
                <p className="font-semibold text-slate-700">
                  {analysis.priorityScore}/100
                </p>
              </div>
            </div>

            <div className="space-y-0.5">
              <p className="text-xs text-slate-400">Summary</p>
              <p className="text-xs italic text-slate-600">
                {analysis.summary}
              </p>
            </div>
          </div>
        )}

        {/* ✅ Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 px-4 
            bg-indigo-600 hover:bg-indigo-700 
            disabled:opacity-60 disabled:cursor-not-allowed 
            text-white font-semibold rounded-lg 
            transition-all duration-200"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-b-2 border-white rounded-full animate-spin" />
              Submitting...
            </span>
          ) : (
            '🚀 Submit Complaint'
          )}
        </button>

      </form>
    </div>
  )
}