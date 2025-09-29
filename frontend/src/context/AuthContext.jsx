import React, { createContext, useContext, useState, useEffect } from 'react'
import { setAuthLogout, authAPI, companiesAPI } from '../services/api'

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
  const [currentCompany, setCurrentCompany] = useState(null)
  const [companies, setCompanies] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [needsCompanySetup, setNeedsCompanySetup] = useState(false)

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
            
            // Load company data
            await loadCompanyData()
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

  const loadCompanyData = async () => {
    try {
      // Get user's companies
      const companiesResponse = await companiesAPI.getCompanies()
      setCompanies(companiesResponse.data)
      
      // Get current company
      const currentCompanyResponse = await companiesAPI.getCurrentCompany()
      if (currentCompanyResponse.data) {
        setCurrentCompany(currentCompanyResponse.data)
        setNeedsCompanySetup(false)
      } else {
        setCurrentCompany(null)
        setNeedsCompanySetup(companiesResponse.data.length === 0)
      }
    } catch (error) {
      console.error('Failed to load company data:', error)
      // If error indicates no company access, set needsCompanySetup
      if (error.response?.data?.requiresCompanySetup) {
        setNeedsCompanySetup(true)
      }
    }
  }

  const login = async (userData, authToken) => {
    localStorage.setItem('token', authToken)
    localStorage.setItem('user', JSON.stringify(userData))
    setToken(authToken)
    setUser(userData)
    
    // Load company data after login
    await loadCompanyData()
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    setCurrentCompany(null)
    setCompanies([])
    setNeedsCompanySetup(false)
  }

  const switchCompany = async (companyId) => {
    try {
      await companiesAPI.switchCompany(companyId)
      await loadCompanyData() // Reload company data
      return true
    } catch (error) {
      console.error('Failed to switch company:', error)
      return false
    }
  }

  const createCompany = async (companyData) => {
    try {
      const response = await companiesAPI.createCompany(companyData)
      await loadCompanyData() // Reload company data
      return response.data
    } catch (error) {
      console.error('Failed to create company:', error)
      throw error
    }
  }

  // Register logout function with api interceptors
  useEffect(() => {
    setAuthLogout(logout)
  }, [])  

  const isAuthenticated = !!token && !!user
  const hasCompanyAccess = !!currentCompany && !needsCompanySetup

  const value = {
    user,
    token,
    currentCompany,
    companies,
    isAuthenticated,
    hasCompanyAccess,
    needsCompanySetup,
    isLoading,
    login,
    logout,
    switchCompany,
    createCompany,
    loadCompanyData
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}