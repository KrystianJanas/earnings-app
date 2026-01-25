import styled, { createGlobalStyle, css, keyframes } from 'styled-components'

export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
}

export const media = {
  sm: (...args) => css`@media (min-width: ${breakpoints.sm}px) { ${css(...args)} }`,
  md: (...args) => css`@media (min-width: ${breakpoints.md}px) { ${css(...args)} }`,
  lg: (...args) => css`@media (min-width: ${breakpoints.lg}px) { ${css(...args)} }`,
  xl: (...args) => css`@media (min-width: ${breakpoints.xl}px) { ${css(...args)} }`,
  '2xl': (...args) => css`@media (min-width: ${breakpoints['2xl']}px) { ${css(...args)} }`
}

export const theme = {
  colors: {
    primary: '#7C3AED',
    primaryHover: '#6D28D9',
    primaryLight: 'rgba(124, 58, 237, 0.08)',
    primarySoft: 'rgba(124, 58, 237, 0.12)',
    secondary: '#EC4899',
    secondaryLight: 'rgba(236, 72, 153, 0.08)',
    accent: '#F59E0B',
    accentLight: 'rgba(245, 158, 11, 0.08)',
    
    background: '#FAFAFA',
    backgroundSecondary: '#F5F3FF',
    cardBg: '#FFFFFF',
    cardBgSolid: '#FFFFFF',
    surface: '#F8F7FC',
    surfaceSolid: '#FFFFFF',
    surfaceHover: '#F3F0FF',
    
    text: {
      primary: '#1F1A2E',
      secondary: '#6B7280',
      muted: '#9CA3AF',
      accent: '#7C3AED',
      inverse: '#FFFFFF'
    },
    
    success: '#10B981',
    successLight: 'rgba(16, 185, 129, 0.1)',
    warning: '#F59E0B',
    warningLight: 'rgba(245, 158, 11, 0.1)',
    error: '#EF4444',
    errorLight: 'rgba(239, 68, 68, 0.1)',
    
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    borderFocus: '#7C3AED',
    
    gradient: {
      primary: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
      secondary: 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)',
      accent: 'linear-gradient(135deg, #F59E0B 0%, #EC4899 100%)',
      soft: 'linear-gradient(135deg, #F5F3FF 0%, #FDF2F8 100%)',
      hero: 'linear-gradient(135deg, #EDE9FE 0%, #FCE7F3 50%, #FEF3C7 100%)',
      card: 'linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 100%)',
      shimmer: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)'
    }
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
    '2xl': '4rem'
  },
  borderRadius: {
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    full: '9999px'
  },
  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.04)',
    sm: '0 2px 8px rgba(0, 0, 0, 0.06)',
    md: '0 4px 16px rgba(0, 0, 0, 0.08)',
    lg: '0 8px 32px rgba(0, 0, 0, 0.1)',
    xl: '0 16px 48px rgba(0, 0, 0, 0.12)',
    glow: '0 0 40px rgba(124, 58, 237, 0.15)',
    glowSm: '0 0 20px rgba(124, 58, 237, 0.1)',
    card: '0 1px 3px rgba(0, 0, 0, 0.04), 0 6px 16px rgba(0, 0, 0, 0.04)',
    cardHover: '0 4px 12px rgba(0, 0, 0, 0.08), 0 16px 32px rgba(0, 0, 0, 0.06)',
    input: '0 1px 2px rgba(0, 0, 0, 0.04)',
    inputFocus: '0 0 0 3px rgba(124, 58, 237, 0.12)',
    button: '0 2px 8px rgba(124, 58, 237, 0.25)',
    buttonHover: '0 8px 24px rgba(124, 58, 237, 0.3)'
  },
  blur: {
    sm: 'blur(8px)',
    md: 'blur(16px)',
    lg: 'blur(24px)'
  },
  transitions: {
    fast: '0.15s ease',
    normal: '0.2s ease',
    slow: '0.3s ease',
    bounce: '0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
  },
  breakpoints,
  media
}

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
`

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`

export { shimmer, pulse, float, fadeIn }

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text.primary};
    line-height: 1.6;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    min-height: 100vh;
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
    border: none;
    background: none;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  ::selection {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 4px;
    
    &:hover {
      background: ${({ theme }) => theme.colors.text.muted};
    }
  }

  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  textarea:-webkit-autofill,
  textarea:-webkit-autofill:hover,
  textarea:-webkit-autofill:focus,
  select:-webkit-autofill,
  select:-webkit-autofill:hover,
  select:-webkit-autofill:focus {
    -webkit-text-fill-color: ${({ theme }) => theme.colors.text.primary};
    -webkit-box-shadow: 0 0 0px 1000px ${({ theme }) => theme.colors.surfaceSolid} inset;
    transition: background-color 5000s ease-in-out 0s;
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

export const GlassCard = styled.div`
  background: ${({ theme }) => theme.colors.cardBg};
  border-radius: ${({ theme }) => theme.borderRadius['2xl']};
  padding: ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.card};
  position: relative;
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.cardHover};
  }
`

export const Card = styled.div`
  background: ${({ theme }) => theme.colors.cardBg};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  box-shadow: ${({ theme }) => theme.shadows.card};
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover {
    border-color: ${({ theme }) => theme.colors.border};
    box-shadow: ${({ theme }) => theme.shadows.cardHover};
    transform: translateY(-2px);
  }
`

export const GradientText = styled.span`
  background: ${({ theme, variant }) => 
    variant === 'secondary' ? theme.colors.gradient.secondary :
    variant === 'accent' ? theme.colors.gradient.accent :
    theme.colors.gradient.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`

export const Button = styled.button.attrs(props => ({
  type: props.type || 'button'
}))`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
  background: ${({ variant, theme }) =>
    variant === 'outline' ? 'transparent' :
    variant === 'ghost' ? 'transparent' :
    variant === 'secondary' ? theme.colors.surface :
    variant === 'danger' ? theme.colors.error :
    theme.colors.gradient.primary};
  color: ${({ variant, theme }) =>
    variant === 'outline' ? theme.colors.primary :
    variant === 'ghost' ? theme.colors.text.secondary :
    variant === 'secondary' ? theme.colors.text.primary :
    theme.colors.text.inverse};
  border: ${({ variant, theme }) =>
    variant === 'outline' ? `2px solid ${theme.colors.primary}` :
    variant === 'secondary' ? `1px solid ${theme.colors.border}` :
    'none'};
  padding: 12px 24px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};
  width: ${({ $fullWidth }) => $fullWidth ? '100%' : 'auto'};
  min-height: 48px;
  position: relative;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  box-shadow: ${({ variant, theme }) =>
    variant === 'outline' || variant === 'ghost' || variant === 'secondary' ? 'none' : theme.shadows.button};

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${({ variant, theme }) =>
      variant === 'outline' || variant === 'ghost' ? 'none' : 
      variant === 'secondary' ? theme.shadows.sm :
      theme.shadows.buttonHover};
    background: ${({ variant, theme }) =>
      variant === 'outline' ? theme.colors.primaryLight :
      variant === 'ghost' ? theme.colors.surface :
      variant === 'secondary' ? theme.colors.surfaceHover :
      variant === 'danger' ? '#DC2626' :
      undefined};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  ${media.md`
    padding: 14px 28px;
    font-size: 1rem;
    min-height: 52px;
  `}
`

export const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text.secondary};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primaryLight};
    color: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    font-size: 1.25rem;
  }
`

export const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  background: ${({ theme }) => theme.colors.surfaceSolid};
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1rem;
  height: 52px;
  transition: all ${({ theme }) => theme.transitions.normal};
  box-shadow: ${({ theme }) => theme.shadows.input};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) => theme.shadows.inputFocus};
    background: ${({ theme }) => theme.colors.surfaceSolid};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }

  ${media.md`
    padding: 16px 18px;
    height: 56px;
  `}
`

export const Label = styled.label`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 500;
  font-size: 0.9rem;
  letter-spacing: 0.01em;

  ${media.md`
    font-size: 0.95rem;
  `}
`

export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 14px;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background: ${({ variant, theme }) =>
    variant === 'success' ? theme.colors.successLight :
    variant === 'warning' ? theme.colors.warningLight :
    variant === 'error' ? theme.colors.errorLight :
    theme.colors.primaryLight};
  color: ${({ variant, theme }) =>
    variant === 'success' ? theme.colors.success :
    variant === 'warning' ? theme.colors.warning :
    variant === 'error' ? theme.colors.error :
    theme.colors.primary};
`

export const Skeleton = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  background-image: ${({ theme }) => theme.colors.gradient.shimmer};
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  height: ${({ height }) => height || '20px'};
  width: ${({ width }) => width || '100%'};
`

export const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.border};
  margin: ${({ theme }) => theme.spacing.md} 0;
`

export const FloatingOrb = styled.div`
  position: absolute;
  width: ${({ size }) => size || '300px'};
  height: ${({ size }) => size || '300px'};
  border-radius: 50%;
  background: ${({ color, theme }) => color || theme.colors.gradient.primary};
  filter: blur(120px);
  opacity: 0.15;
  pointer-events: none;
  animation: ${float} 8s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay || '0s'};
`

export const PageHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  
  h1 {
    font-size: 1.75rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: 0.25rem;
    
    ${media.md`
      font-size: 2rem;
    `}
  }
  
  p {
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: 0.95rem;
  }
`

export const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.cardBg};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  box-shadow: ${({ theme }) => theme.shadows.card};
  transition: all ${({ theme }) => theme.transitions.normal};
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.cardHover};
  }
`

export const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ $color, theme }) => 
    $color === 'primary' ? theme.colors.primaryLight :
    $color === 'secondary' ? theme.colors.secondaryLight :
    $color === 'success' ? theme.colors.successLight :
    $color === 'warning' ? theme.colors.warningLight :
    theme.colors.primaryLight};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $color, theme }) => 
    $color === 'primary' ? theme.colors.primary :
    $color === 'secondary' ? theme.colors.secondary :
    $color === 'success' ? theme.colors.success :
    $color === 'warning' ? theme.colors.warning :
    theme.colors.primary};
  font-size: 1.25rem;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

export const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.25rem;
  
  ${media.md`
    font-size: 1.75rem;
  `}
`

export const StatLabel = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 500;
`

export const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  
  svg {
    font-size: 3rem;
    margin-bottom: ${({ theme }) => theme.spacing.md};
    color: ${({ theme }) => theme.colors.text.muted};
  }
  
  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: ${({ theme }) => theme.colors.text.primary};
  }
  
  p {
    font-size: 0.9rem;
    max-width: 300px;
    margin: 0 auto;
  }
`
