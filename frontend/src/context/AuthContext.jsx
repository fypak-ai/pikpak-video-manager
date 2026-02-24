import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/api/pikpak/status').then(({ data }) => {
      if (data.authenticated) setUser({ username: data.username })
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const login = async (username, password) => {
    const { data } = await axios.post('/api/pikpak/login', { username, password })
    setUser({ username: data.username })
    return data
  }

  const logout = async () => {
    await axios.post('/api/pikpak/logout')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
