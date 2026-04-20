import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  LayoutDashboard, FileText, PlusCircle, Settings, LogOut,
  Bell, Moon, Sun, Menu, X, ShieldCheck, Users
} from 'lucide-react'

function NavItem({ to, icon, label }) {
  return (
    <NavLink to={to} className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm
       ${isActive
         ? 'bg-white/20 text-white'
         : 'text-white/60 hover:text-white hover:bg-white/10'}`
    }>
      {icon}
      <span>{label}</span>
    </NavLink>
  )
}

export default function Layout() {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const [sideOpen, setSideOpen] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const navLinks = user?.role === 'admin'
    ? [
        { to: '/admin', icon: <ShieldCheck size={18} />, label: 'Admin Dashboard' },
        { to: '/complaints', icon: <FileText size={18} />, label: 'Complaints' },
        { to: '/dashboard', icon: <Users size={18} />, label: 'Student View' },
      ]
    : [
        { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
        { to: '/complaints', icon: <FileText size={18} />, label: 'My Complaints' },
        { to: '/post', icon: <PlusCircle size={18} />, label: 'Post Complaint' },
      ]

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-indigo-800 to-indigo-900 p-5">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
          </svg>
        </div>
        <div>
          <p className="text-white font-display font-bold text-sm">VoiceRank AI</p>
          <p className="text-white/40 text-xs">Grievance Platform</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="space-y-1 flex-1">
        {navLinks.map(l => <NavItem key={l.to} {...l} />)}
      </nav>

      {/* User + Logout */}
      <div className="space-y-3 border-t border-white/10 pt-4">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-white/40 text-xs capitalize">{user?.role}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 flex-shrink-0 flex-col">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      {sideOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-60 flex-shrink-0"><Sidebar /></div>
          <div className="flex-1 bg-black/50" onClick={() => setSideOpen(false)} />
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <button onClick={() => setSideOpen(true)} className="lg:hidden text-slate-500 hover:text-indigo-600">
            <Menu size={22} />
          </button>
          <div className="hidden lg:block">
            <p className="text-slate-400 text-sm">Welcome back,</p>
            <p className="font-display font-bold text-slate-800 dark:text-white">{user?.name} 👋</p>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button onClick={toggle} className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-all">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-all relative">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
