import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5100'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
}

export const earningsAPI = {
  getDashboard: (period = 'month') => api.get('/earnings/dashboard', { params: { period } }),
  getDayEarnings: (date) => api.get(`/earnings/day/${date}`),
  saveDayEarnings: (data) => api.post('/earnings/day', data),
  getMonthlyEarnings: (year, month) => api.get(`/earnings/monthly/${year}/${month}`),
}

export default api