import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AddEarnings from './pages/AddEarnings'
import Monthly from './pages/Monthly'
import Settings from './pages/Settings'
import Employees from './pages/Employees'
import Clients from './pages/Clients'

function App() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#0a0a0a',
        color: '#a3a3a3'
      }}>
        Ładowanie...
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} 
      />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-earnings"
        element={
          <ProtectedRoute>
            <Layout>
              <AddEarnings />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/monthly"
        element={
          <ProtectedRoute>
            <Layout>
              <Monthly />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients"
        element={
          <ProtectedRoute>
            <Layout>
              <Clients />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees"
        element={
          <ProtectedRoute>
            <Layout>
              <Employees />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Catch all route */}
      <Route 
        path="*" 
        element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} 
      />
    </Routes>
  )
}

export default App