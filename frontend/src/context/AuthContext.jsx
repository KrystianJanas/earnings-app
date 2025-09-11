import React, { createContext, useContext, useState, useEffect } from 'react'
import { setAuthLogout, authAPI } from '../services/api'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const validateAndSetAuth = async () => {
      const savedToken = localStorage.getItem('token')
      const savedUser = localStorage.getItem('user')
      
      if (savedToken && savedUser) {
        try {
          // Validate token with backend
          const response = await authAPI.validate()
          if (response.data.valid) {
            setToken(savedToken)
            setUser(response.data.user) // Use fresh user data from backend
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('token')
            localStorage.removeItem('user')
          }
        } catch (error) {
          // Token validation failed, clear storage
          console.log('Token validation failed:', error.message)
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      }
      
      setIsLoading(false)
    }
    
    validateAndSetAuth()
  }, [])

  const login = (userData, authToken) => {
    localStorage.setItem('token', authToken)
    localStorage.setItem('user', JSON.stringify(userData))
    setToken(authToken)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  // Register logout function with api interceptors
  useEffect(() => {
    setAuthLogout(logout)
  }, [])  

  const isAuthenticated = !!token && !!user

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}