import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ThemeProvider } from 'styled-components'
import { AuthProvider } from './context/AuthContext'
import { ThemeContextProvider, useTheme } from './context/ThemeContext'
import { GlobalStyles, theme, darkTheme } from './styles/theme'
import App from './App'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
})

const ThemedApp = () => {
  const { isDarkMode } = useTheme()
  const currentTheme = isDarkMode ? darkTheme : theme

  return (
    <ThemeProvider theme={currentTheme}>
      <AuthProvider>
        <GlobalStyles />
        <App />
      </AuthProvider>
    </ThemeProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeContextProvider>
          <ThemedApp />
        </ThemeContextProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)