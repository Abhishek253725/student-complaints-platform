import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Send, AlertTriangle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios' // ✅ ADD

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
    await new Promise(r => setTimeout(r, 1200))
    const result = analyzeLocally(form.description)
    setAnalysis(result)
    setAnalyzing(false)
    toast.success('AI analysis complete!')
  }

  // 🔥 FINAL SUBMIT FUNCTION
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.title) return toast.error('Title is required')
    if (!form.description || form.description.length < 20) return toast.error('Description too short')

    setSubmitting(true)

    try {
      const token = localStorage.getItem("token")

      const res = await axios.post(
        "http://localhost:5000/api/complaints",
        {
          title: form.title,
          description: form.description,
          category: analysis?.category || 'Other',
          priorityScore: analysis?.priorityScore || 0,
          priorityLevel: analysis?.priorityLevel || 'Low',
          summary: analysis?.summary || form.description,
          isAnonymous: form.anonymous
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      console.log("Saved:", res.data)

      toast.success('Complaint submitted successfully!')
      navigate('/complaints')

    } catch (err) {
      console.error(err.response?.data || err.message)
      toast.error(err.response?.data?.message || "Error submitting complaint")
    } finally {
      setSubmitting(false)
    }
  }

  const levelColor = { Critical:'text-red-600', High:'text-orange-500', Medium:'text-yellow-600', Low:'text-green-600' }
  const levelBg = { Critical:'bg-red-50 border-red-200', High:'bg-orange-50 border-orange-200', Medium:'bg-yellow-50 border-yellow-200', Low:'bg-green-50 border-green-200' }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Post Complaint</h1>

      {form.description && CRITICAL_KEYWORDS.some(kw => form.description.toLowerCase().includes(kw)) && (
        <div className="flex items-center gap-2 p-3 bg-red-100 border border-red-300 rounded">
          <AlertTriangle size={16} />
          <p>Critical issue detected!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="title" placeholder="Title" value={form.title} onChange={change} className="input-field" />

        <textarea name="description" placeholder="Description" value={form.description} onChange={change} className="input-field" />

        <label>
          <input type="checkbox" name="anonymous" checked={form.anonymous} onChange={change} />
          Post Anonymously
        </label>

        <button type="button" onClick={analyzeWithAI}>
          <Sparkles size={16}/> Analyze
        </button>

        {analysis && (
          <div className={`p-3 border ${levelBg[analysis.priorityLevel]}`}>
            <p>Category: {analysis.category}</p>
            <p>Priority: {analysis.priorityLevel}</p>
          </div>
        )}

        <button type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Complaint"}
        </button>
      </form>
    </div>
  )
}