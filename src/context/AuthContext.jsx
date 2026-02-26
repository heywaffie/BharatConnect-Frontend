import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

// Seed accounts for demo
const SEED_USERS = [
  { id: 'u1', name: 'Alice Chen', email: 'citizen@demo.com', password: 'demo123', role: 'citizen', avatar: 'AC', joined: '2025-01-10' },
  { id: 'u2', name: 'Sen. James Ward', email: 'politician@demo.com', password: 'demo123', role: 'politician', avatar: 'JW', constituency: 'District 4', joined: '2024-09-01' },
  { id: 'u3', name: 'Maya Reyes', email: 'moderator@demo.com', password: 'demo123', role: 'moderator', avatar: 'MR', joined: '2024-11-15' },
  { id: 'u4', name: 'Admin User', email: 'admin@demo.com', password: 'demo123', role: 'admin', avatar: 'AU', joined: '2024-06-01' },
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('poli_user')) } catch { return null }
  })

  const [users, setUsers] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('poli_users'))
      return stored && stored.length ? stored : SEED_USERS
    } catch { return SEED_USERS }
  })

  useEffect(() => {
    localStorage.setItem('poli_users', JSON.stringify(users))
  }, [users])

  useEffect(() => {
    localStorage.setItem('poli_user', JSON.stringify(user))
  }, [user])

  function login(email, password) {
    const found = users.find(u => u.email === email && u.password === password)
    if (!found) return { error: 'Invalid email or password.' }
    setUser(found)
    return { success: true, user: found }
  }

  function signup({ name, email, password, role }) {
    if (users.find(u => u.email === email)) return { error: 'Email already registered.' }
    const newUser = {
      id: 'u' + Date.now(),
      name,
      email,
      password,
      role,
      avatar: name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      joined: new Date().toISOString().slice(0, 10),
    }
    setUsers(prev => [...prev, newUser])
    setUser(newUser)
    return { success: true }
  }

  function logout() {
    setUser(null)
  }

  function updateUsers(updater) {
    setUsers(updater)
  }

  return (
    <AuthContext.Provider value={{ user, users, login, signup, logout, updateUsers }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
