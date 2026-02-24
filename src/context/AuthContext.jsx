import { createContext, useContext, useState, useEffect } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from '../firebase'

const AuthContext = createContext(null)

// Demo credentials mapped to roles (with username support)
const DEMO_USERS = [
  { email: 'admin@tksecurity.com', username: 'admin', password: 'admin123', role: 'admin', name: 'Admin User' },
  { email: 'client@tksecurity.com', username: 'client', password: 'client123', role: 'client', name: 'Client User' },
  { email: 'employee@tksecurity.com', username: 'employee', password: 'employee123', role: 'employee', name: 'John Officer' },
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('tk_user')
    return saved ? JSON.parse(saved) : null
  })

  // Firebase sync - load profile photo on login and sync in real-time
  useEffect(() => {
    if (!user?.email) return
    
    const userKey = user.email.replace(/[.#$[\]]/g, '_')
    const profileRef = ref(db, `profiles/${userKey}`)
    
    const unsubscribe = onValue(profileRef, (snapshot) => {
      const data = snapshot.val()
      if (data?.photoURL && data.photoURL !== user.photoURL) {
        console.log('Firebase sync: Loading profile photo')
        setUser(prev => {
          const updated = { ...prev, photoURL: data.photoURL }
          localStorage.setItem('tk_user', JSON.stringify(updated))
          return updated
        })
      }
    })
    
    return () => unsubscribe()
  }, [user?.email])


  // Accepts either email or username
  const login = (input, password) => {
    const isEmail = input.includes('@')
    let foundUser = null
    if (isEmail) {
      foundUser = DEMO_USERS.find(u => u.email.toLowerCase() === input.toLowerCase())
      if (!foundUser) return { success: false, message: 'Email incorrect' }
    } else {
      foundUser = DEMO_USERS.find(u => u.username && u.username.toLowerCase() === input.toLowerCase())
      if (!foundUser) return { success: false, message: 'Username not correct' }
    }
    if (foundUser.password !== password) return { success: false, message: 'Password incorrect' }

    const userData = { email: foundUser.email, role: foundUser.role, name: foundUser.name }
    setUser(userData)
    localStorage.setItem('tk_user', JSON.stringify(userData))
    return { success: true, role: foundUser.role }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('tk_user')
  }

  const updateUser = (updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates }
      localStorage.setItem('tk_user', JSON.stringify(updated))
      return updated
    })
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
