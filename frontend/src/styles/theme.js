import styled, { createGlobalStyle, css } from 'styled-components'

// Breakpoints for responsive design
export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
}

// Media query helpers
export const media = {
  sm: (...args) => css`@media (min-width: ${breakpoints.sm}px) { ${css(...args)} }`,
  md: (...args) => css`@media (min-width: ${breakpoints.md}px) { ${css(...args)} }`,
  lg: (...args) => css`@media (min-width: ${breakpoints.lg}px) { ${css(...args)} }`,
  xl: (...args) => css`@media (min-width: ${breakpoints.xl}px) { ${css(...args)} }`,
  '2xl': (...args) => css`@media (min-width: ${breakpoints['2xl']}px) { ${css(...args)} }`
}

export const theme = {
  colors: {
    primary: '#6366f1',
    primaryHover: '#5b59e8',
    secondary: '#8b5cf6',
    background: '#0a0a0a',
    cardBg: '#1a1a1a',
    surface: '#262626',
    text: {
      primary: '#ffffff',
      secondary: '#a3a3a3',
      muted: '#737373'
    },
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    border: '#404040'
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem'
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem'
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
  },
  breakpoints,
  media
}

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text.primary};
    line-height: 1.6;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  input, button, textarea, select {
    font-family: inherit;
  }

  button {
    cursor: pointer;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.surface};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #565656;
  }
`

export const Container = styled.div`
  max-width: 428px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.sm};
  width: 100%;

  ${media.sm`
    max-width: 640px;
  `}

  ${media.md`
    max-width: 768px;
    padding: 0 ${({ theme }) => theme.spacing.md};
  `}

  ${media.lg`
    max-width: 100%;
    padding: 0 ${({ theme }) => theme.spacing.lg};
  `}

  ${media.xl`
    max-width: 1280px;
  `}
`

export const Card = styled.div`
  background: ${({ theme }) => theme.colors.cardBg};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md};
  box-shadow: ${({ theme }) => theme.shadows.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
`

export const Button = styled.button`
  background: ${({ variant, theme }) => 
    variant === 'outline' ? 'transparent' : theme.colors.primary};
  color: ${({ variant, theme }) => 
    variant === 'outline' ? theme.colors.primary : theme.colors.text.primary};
  border: 2px solid ${({ theme }) => theme.colors.primary};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s ease;
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'auto'};

  &:hover:not(:disabled) {
    background: ${({ variant, theme }) => 
      variant === 'outline' ? theme.colors.primary : theme.colors.primaryHover};
    color: ${({ theme }) => theme.colors.text.primary};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }
`

export const Label = styled.label`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 500;
  font-size: 0.85rem;

  ${media.md`
    font-size: 1rem;
  `}
`