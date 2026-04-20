import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff, LogIn, Zap, ShieldCheck, TrendingUp } from 'lucide-react'

const FEATURES = [
  { icon: <Zap size={20} />, text: 'AI-powered complaint prioritization' },
  { icon: <TrendingUp size={20} />, text: 'Real-time voting & ranking' },
  { icon: <ShieldCheck size={20} />, text: 'Anonymous reporting support' },
]

const PARTICLE_POS = [
  { top: '10%', left: '10%', size: 'w-32 h-32', delay: '0s', color: 'bg-indigo-400' },
  { top: '60%', left: '5%', size: 'w-20 h-20', delay: '2s', color: 'bg-blue-400' },
  { top: '30%', left: '80%', size: 'w-24 h-24', delay: '1s', color: 'bg-purple-400' },
  { top: '75%', left: '75%', size: 'w-16 h-16', delay: '3s', color: 'bg-sky-400' },
  { top: '15%', left: '55%', size: 'w-10 h-10', delay: '1.5s', color: 'bg-indigo-300' },
]

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.email || !form.password) return toast.error('Please fill all fields')
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name}! 👋`)
      navigate(user.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* LEFT – Brand Panel */}
      <div className="relative flex-col justify-between hidden p-12 overflow-hidden lg:flex lg:w-1/2 mesh-bg">
        {/* Floating orbs */}
        {PARTICLE_POS.map((p, i) => (
          <div
            key={i}
            className={`absolute ${p.size} ${p.color} rounded-full opacity-20 animate-float`}
            style={{ top: p.top, left: p.left, animationDelay: p.delay, filter: 'blur(40px)' }}
          />
        ))}

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 bg-white/20 glass rounded-xl">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
              </svg>
            </div>
            <span className="text-xl font-bold tracking-wide text-white font-display">VoiceRank AI</span>
          </div>
          <p className="text-sm text-white/60 font-body">Student Grievance Prioritization</p>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="mb-4 text-5xl font-bold leading-tight text-white font-display">
              Raise Your<br />
              <span className="text-indigo-200">Voice.</span><br />
              Be Heard.
            </h1>
            <p className="text-lg leading-relaxed text-white/70 font-body">
              Your campus complaints, powered by AI. Real priorities, real action, real change.
            </p>
          </div>

          <div className="space-y-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 glass rounded-xl animate-slide-up"
                style={{ animationDelay: `${i * 0.1 + 0.2}s` }}>
                <div className="text-indigo-200">{f.icon}</div>
                <span className="text-sm text-white/90 font-body">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          
          <p className="text-sm text-white/70">Trusted by <strong className="text-white">2,400+</strong> students</p>
        </div>
      </div>

      {/* RIGHT – Login Form */}
      <div className="flex items-center justify-center w-full p-8 lg:w-1/2 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile Logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-lg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
              </svg>
            </div>
            <span className="font-bold text-indigo-700 font-display dark:text-indigo-400">VoiceRank AI</span>
          </div>

          <div className="mb-8">
            <h2 className="mb-2 text-3xl font-bold font-display text-slate-800 dark:text-white">Welcome back</h2>
            <p className="text-slate-500 dark:text-slate-400 font-body">Sign in to your account to continue</p>
          </div>

          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
              <input
                name="email" type="email" placeholder="you@college.edu"
                value={form.email} onChange={handleChange}
                className="input-field"
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
                <button type="button" className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  name="password" type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password} onChange={handleChange}
                  className="pr-12 input-field"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute transition-colors -translate-y-1/2 right-3 top-1/2 text-slate-400 hover:text-indigo-600">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
              <label htmlFor="remember" className="text-sm text-slate-600 dark:text-slate-400">Remember me for 30 days</label>
            </div>

            <button type="submit" disabled={loading} className="flex items-center justify-center w-full gap-2 text-base btn-primary">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" />
              ) : (
                <><LogIn size={18} /> Sign In</>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                Create one free
              </Link>
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mt-6">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            <span className="text-xs text-slate-400">or continue with</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            {['Google', 'Microsoft'].map(p => (
              <button key={p} type="button"
                className="flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                {p === 'Google' ? (
                  <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#00a4ef"><path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/></svg>
                )}
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
