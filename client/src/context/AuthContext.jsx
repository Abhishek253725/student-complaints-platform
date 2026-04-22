import { createContext, useContext, useState, useEffect } from 'react'
import API from '../api/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // ✅ Refresh pe token check karo
  useEffect(() => {
    const token = localStorage.getItem('vr_token')
    const userData = localStorage.getItem('vr_user')

    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch {
        // ✅ Corrupt data clear karo
        localStorage.removeItem('vr_token')
        localStorage.removeItem('vr_user')
      }
    }

    setLoading(false)
  }, [])

  // ✅ LOGIN - /api fix kiya
  const login = async (email, password) => {
    try {
      const res = await API.post('/auth/login', { email, password })
      // ✅ /api/auth/login → baseURL already has localhost:5000
      // ✅ routes mein /api/auth hai
      // ✅ isliye sirf /auth/login likhna hai

      const { token, user } = res.data

      localStorage.setItem('vr_token', token)
      localStorage.setItem('vr_user', JSON.stringify(user))

      setUser(user)
      return user

    } catch (err) {
      throw err
    }
  }

  // ✅ REGISTER - /api fix kiya
  const register = async (name, email, password, role = 'student') => {
    try {
      const res = await API.post('/auth/register', {
        name,
        email,
        password,
        role
      })

      const { token, user } = res.data

      localStorage.setItem('vr_token', token)
      localStorage.setItem('vr_user', JSON.stringify(user))

      setUser(user)
      return user

    } catch (err) {
      throw err
    }
  }

  // ✅ LOGOUT
  const logout = () => {
    localStorage.removeItem('vr_token')
    localStorage.removeItem('vr_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)