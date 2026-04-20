import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff, UserPlus, GraduationCap, ShieldCheck, Check } from 'lucide-react'

const ROLES = [
  { value: 'student', label: 'Student', icon: <GraduationCap size={24} />, desc: 'Post & vote on complaints' },
  { value: 'admin', label: 'Admin', icon: <ShieldCheck size={24} />, desc: 'Manage & resolve issues' },
]

const STEPS = ['Account Type', 'Personal Info', 'Credentials']

const PARTICLE_POS = [
  { top: '5%', left: '15%', size: 'w-40 h-40', delay: '0s' },
  { top: '55%', left: '8%', size: 'w-24 h-24', delay: '2s' },
  { top: '25%', left: '75%', size: 'w-32 h-32', delay: '1s' },
  { top: '70%', left: '70%', size: 'w-20 h-20', delay: '3s' },
]

export default function RegisterPage() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'student' })
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const change = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const nextStep = () => {
    if (step === 1 && !form.name) return toast.error('Please enter your name')
    if (step === 1 && !form.email) return toast.error('Please enter your email')
    setStep(s => s + 1)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.password || form.password.length < 6) return toast.error('Password must be at least 6 characters')
    if (form.password !== form.confirm) return toast.error('Passwords do not match')
    setLoading(true)
    try {
      const user = await register(form.name, form.email, form.password, form.role)
      toast.success(`Account created! Welcome, ${user.name}! 🎉`)
      navigate(user.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const strength = (() => {
    const p = form.password
    if (!p) return 0
    let s = 0
    if (p.length >= 6) s++
    if (p.length >= 10) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  })()

  const strengthLabel = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'][strength]
  const strengthColor = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'][strength]

  return (
    <div className="flex min-h-screen">
      {/* LEFT – Brand Panel */}
      <div className="relative flex-col justify-between hidden p-12 overflow-hidden lg:flex lg:w-1/2 mesh-bg">
        {PARTICLE_POS.map((p, i) => (
          <div key={i} className={`absolute ${p.size} bg-white rounded-full opacity-10 animate-float`}
            style={{ top: p.top, left: p.left, animationDelay: p.delay, filter: 'blur(50px)' }} />
        ))}

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-white/20 glass rounded-xl">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
            </svg>
          </div>
          <div>
            <p className="text-lg font-bold text-white font-display">VoiceRank AI</p>
            <p className="text-xs text-white/50">Student Grievance Platform</p>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold leading-tight text-white font-display">
            Join the<br />
            <span className="text-indigo-200">movement</span><br />
            for change.
          </h1>
          <p className="text-white/70 font-body">Every voice matters. Register and start making your campus better today.</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { val: '2.4K+', label: 'Students' },
              { val: '580+', label: 'Resolved' },
              { val: '98%', label: 'Satisfaction' },
            ].map((s, i) => (
              <div key={i} className="p-4 text-center glass rounded-xl">
                <p className="text-2xl font-bold text-white font-display">{s.val}</p>
                <p className="mt-1 text-xs text-white/60">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="p-5 glass rounded-2xl">
            <p className="mb-3 text-sm italic text-white/90 font-body">"VoiceRank AI helped us fix the hostel WiFi issue within 3 days. Incredible platform!"</p>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center text-xs font-bold text-white bg-indigo-300 rounded-full w-7 h-7">R</div>
              <div>
                <p className="text-xs font-semibold text-white">Abhishek maurya.</p>
                <p className="text-xs text-white/50">B.Tech 3rd Year</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-white/40">
          © 2026 VoiceRank AI. All rights reserved.
        </div>
      </div>

      {/* RIGHT – Registration Form */}
      <div className="flex items-center justify-center w-full p-8 overflow-y-auto lg:w-1/2 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-md py-4 animate-slide-up">
          {/* Mobile Logo */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-lg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
              </svg>
            </div>
            <span className="font-bold text-indigo-700 font-display dark:text-indigo-400">VoiceRank AI</span>
          </div>

          <div className="mb-6">
            <h2 className="mb-1 text-3xl font-bold font-display text-slate-800 dark:text-white">Create account</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Step {step + 1} of {STEPS.length} – {STEPS[step]}</p>
          </div>

          {/* Progress bar */}
          <div className="flex gap-2 mb-8">
            {STEPS.map((s, i) => (
              <div key={i} className="flex flex-col flex-1 gap-1">
                <div className={`h-1.5 rounded-full transition-all duration-500 ${i <= step ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`} />
                <span className={`text-xs font-medium ${i <= step ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>{s}</span>
              </div>
            ))}
          </div>

          {/* STEP 0 – Choose Role */}
          {step === 0 && (
            <div className="space-y-4 animate-fade-in">
              <p className="mb-4 font-medium text-slate-600 dark:text-slate-300">I am registering as a...</p>
              {ROLES.map(r => (
                <button key={r.value} type="button" onClick={() => setForm(p => ({ ...p, role: r.value }))}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left
                    ${form.role === r.value
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50'
                      : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                    ${form.role === r.value ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                    {r.icon}
                  </div>
                  <div>
                    <p className={`font-semibold font-display ${form.role === r.value ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-200'}`}>{r.label}</p>
                    <p className="text-sm text-slate-400">{r.desc}</p>
                  </div>
                  {form.role === r.value && (
                    <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 ml-auto bg-indigo-600 rounded-full">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
              <button type="button" onClick={() => setStep(1)} className="w-full mt-2 btn-primary">
                Continue →
              </button>
            </div>
          )}

          {/* STEP 1 – Personal Info */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                <input name="name" type="text" placeholder="John Doe"
                  value={form.name} onChange={change} className="input-field" autoFocus />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                <input name="email" type="email" placeholder="you@college.edu"
                  value={form.email} onChange={change} className="input-field" />
                <p className="text-xs text-slate-400 mt-1.5">Use your institutional email for verification</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(0)} className="flex-1 btn-secondary">← Back</button>
                <button type="button" onClick={nextStep} className="flex-1 btn-primary">Continue →</button>
              </div>
            </div>
          )}

          {/* STEP 2 – Credentials */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <input name="password" type={showPass ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={form.password} onChange={change} className="pr-12 input-field" autoFocus />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    className="absolute transition-colors -translate-y-1/2 right-3 top-1/2 text-slate-400 hover:text-indigo-600">
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {/* Strength */}
                {form.password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(n => (
                        <div key={n} className={`flex-1 h-1 rounded-full transition-all duration-300 ${n <= strength ? strengthColor : 'bg-slate-200 dark:bg-slate-700'}`} />
                      ))}
                    </div>
                    <p className={`text-xs font-medium ${strengthColor.replace('bg-', 'text-')}`}>{strengthLabel}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <input name="confirm" type={showConfirm ? 'text' : 'password'}
                    placeholder="Repeat your password"
                    value={form.confirm} onChange={change} className="pr-12 input-field" />
                  <button type="button" onClick={() => setShowConfirm(p => !p)}
                    className="absolute transition-colors -translate-y-1/2 right-3 top-1/2 text-slate-400 hover:text-indigo-600">
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {form.confirm && form.password !== form.confirm && (
                  <p className="mt-1 text-xs text-red-500">Passwords don't match</p>
                )}
                {form.confirm && form.password === form.confirm && (
                  <p className="flex items-center gap-1 mt-1 text-xs text-green-600"><Check size={12} /> Passwords match</p>
                )}
              </div>

              <div className="flex items-start gap-2">
                <input type="checkbox" id="terms" required className="w-4 h-4 mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                <label htmlFor="terms" className="text-xs text-slate-500 dark:text-slate-400">
                  I agree to the <span className="text-indigo-600 cursor-pointer hover:underline">Terms of Service</span> and <span className="text-indigo-600 cursor-pointer hover:underline">Privacy Policy</span>
                </label>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="flex-1 btn-secondary">← Back</button>
                <button type="submit" disabled={loading} className="flex items-center justify-center flex-1 gap-2 btn-primary">
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" />
                  ) : (
                    <><UserPlus size={18} /> Register</>
                  )}
                </button>
              </div>

              {/* Summary */}
              <div className="p-3 mt-2 space-y-1 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400">
                <p>📧 {form.email}</p>
                <p>👤 {form.name} · {form.role === 'admin' ? '🛡 Admin' : '🎓 Student'}</p>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
