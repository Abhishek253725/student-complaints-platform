import { createContext, useContext, useState, useEffect } from 'react'
import API from '../api/api' // ✅ USE CENTRAL API

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // ✅ Load user from localStorage on refresh
  useEffect(() => {
    const token = localStorage.getItem('vr_token')
    const userData = localStorage.getItem('vr_user')

    if (token && userData) {
      setUser(JSON.parse(userData))
    }

    setLoading(false)
  }, [])

  // ✅ LOGIN
  const login = async (email, password) => {
    try {
      const res = await API.post('/api/auth/login', { email, password })

      const { token, user } = res.data

      localStorage.setItem('vr_token', token)
      localStorage.setItem('vr_user', JSON.stringify(user))

      setUser(user)

      return user
    } catch (err) {
      throw err
    }
  }

  // ✅ REGISTER
  const register = async (name, email, password, role = 'student') => {
    try {
      const res = await API.post('/api/auth/register', {
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