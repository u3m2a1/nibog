"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Define the user type based on the API response
interface User {
  user_id: number
  full_name: string
  email: string
  email_verified: boolean
  phone: string
  phone_verified: boolean
  password_hash?: string // This is included in the response but shouldn't be used
  city_id: number
  accepted_terms: boolean
  terms_accepted_at: string | null
  is_active: boolean
  is_locked: boolean
  locked_until: string | null
  deactivated_at: string | null
  created_at: string
  updated_at: string
  last_login_at: string | null
}

// Define the auth context type
interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (userData: User) => void
  logout: () => void
  isAuthenticated: boolean
}

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
})

// Create a provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Login function
  const login = (userData: User) => {
    console.log('Setting user in auth context:', userData)
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  // Logout function
  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Create a hook to use the auth context
export const useAuth = () => useContext(AuthContext)
