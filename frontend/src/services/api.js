import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5100'

// Check if API_BASE_URL already includes /api to avoid duplication
const baseURL = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`

const api = axios.create({
  baseURL,
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// We'll set up the response interceptor after AuthContext is available
let authContextLogout = null

export const setAuthLogout = (logoutFn) => {
  authContextLogout = logoutFn
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      // Use AuthContext logout if available, otherwise fallback to window.location
      if (authContextLogout) {
        authContextLogout()
      } else {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  validate: () => api.get('/auth/validate'),
}

export const earningsAPI = {
  getDashboard: (period = 'month') => api.get('/earnings/dashboard', { params: { period } }),
  getDayEarnings: (date) => api.get(`/earnings/day/${date}`),
  saveDayEarnings: (data) => api.post('/earnings/day', data),
  getMonthlyEarnings: (year, month) => api.get(`/earnings/monthly/${year}/${month}`),
}

export default api