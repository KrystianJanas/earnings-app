import React, { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import CompanySelector from './CompanySelector'
import CreateCompany from './CreateCompany'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, hasCompanyAccess, needsCompanySetup, isLoading } = useAuth()
  const [showCreateCompany, setShowCreateCompany] = useState(false)
  const location = useLocation()

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        color: '#a3a3a3'
      }}>
        Ładowanie...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!hasCompanyAccess) {
    if (showCreateCompany) {
      return (
        <CreateCompany 
          onBack={() => setShowCreateCompany(false)}
          onSuccess={() => setShowCreateCompany(false)}
        />
      )
    } else {
      return (
        <CompanySelector 
          onCreateNew={() => setShowCreateCompany(true)}
        />
      )
    }
  }

  return children
}

export default ProtectedRoute