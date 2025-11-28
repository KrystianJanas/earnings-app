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
    primary: '#8B5CF6',
    primaryHover: '#7C3AED',
    primaryLight: 'rgba(139, 92, 246, 0.15)',
    secondary: '#EC4899',
    secondaryLight: 'rgba(236, 72, 153, 0.15)',
    accent: '#06B6D4',
    accentLight: 'rgba(6, 182, 212, 0.15)',
    
    background: '#0F0F1A',
    backgroundSecondary: '#14142B',
    cardBg: 'rgba(26, 26, 46, 0.7)',
    cardBgSolid: '#1A1A2E',
    surface: 'rgba(42, 42, 74, 0.5)',
    surfaceSolid: '#2A2A4A',
    
    text: {
      primary: '#FFFFFF',
      secondary: '#B4B4C4',
      muted: '#6B6B8A',
      accent: '#8B5CF6'
    },
    
    success: '#10B981',
    successLight: 'rgba(16, 185, 129, 0.15)',
    warning: '#F59E0B',
    warningLight: 'rgba(245, 158, 11, 0.15)',
    error: '#EF4444',
    errorLight: 'rgba(239, 68, 68, 0.15)',
    
    border: 'rgba(139, 92, 246, 0.2)',
    borderLight: 'rgba(255, 255, 255, 0.08)',
    
    gradient: {
      primary: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
      secondary: 'linear-gradient(135deg, #06B6D4 0%, #8B5CF6 100%)',
      accent: 'linear-gradient(135deg, #EC4899 0%, #F59E0B 100%)',
      dark: 'linear-gradient(180deg, #1A1A2E 0%, #0F0F1A 100%)',
      card: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%)',
      glow: 'radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)'
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
    xl: '1.5rem',
    full: '9999px'
  },
  shadows: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.25)',
    md: '0 4px 16px rgba(0, 0, 0, 0.3)',
    lg: '0 8px 32px rgba(0, 0, 0, 0.4)',
    glow: '0 0 40px rgba(139, 92, 246, 0.3)',
    glowSm: '0 0 20px rgba(139, 92, 246, 0.2)',
    inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)'
  },
  blur: {
    sm: 'blur(8px)',
    md: 'blur(16px)',
    lg: 'blur(24px)'
  },
  transitions: {
    fast: '0.15s ease',
    normal: '0.25s ease',
    slow: '0.4s ease',
    bounce: '0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
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
  50% { transform: translateY(-10px); }
`

export { shimmer, pulse, float }

export const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

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

  body::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(ellipse 80% 50% at 50% -20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
      radial-gradient(ellipse 60% 40% at 100% 50%, rgba(236, 72, 153, 0.1) 0%, transparent 50%),
      radial-gradient(ellipse 60% 40% at 0% 80%, rgba(6, 182, 212, 0.08) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 1;
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
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.backgroundSecondary};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 3px;
    
    &:hover {
      background: ${({ theme }) => theme.colors.primary};
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
  backdrop-filter: ${({ theme }) => theme.blur.md};
  -webkit-backdrop-filter: ${({ theme }) => theme.blur.md};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      rgba(255, 255, 255, 0.1) 50%, 
      transparent 100%
    );
  }
`

export const Card = styled.div`
  background: ${({ theme }) => theme.colors.cardBg};
  backdrop-filter: ${({ theme }) => theme.blur.sm};
  -webkit-backdrop-filter: ${({ theme }) => theme.blur.sm};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  box-shadow: ${({ theme }) => theme.shadows.md};
  transition: all ${({ theme }) => theme.transitions.normal};
  position: relative;

  &:hover {
    border-color: ${({ theme }) => theme.colors.border};
    box-shadow: ${({ theme }) => theme.shadows.lg};
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

export const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
  background: ${({ variant, theme }) =>
    variant === 'outline' ? 'transparent' :
    variant === 'ghost' ? 'transparent' :
    variant === 'secondary' ? theme.colors.surface :
    theme.colors.gradient.primary};
  color: ${({ variant, theme }) =>
    variant === 'outline' ? theme.colors.primary :
    variant === 'ghost' ? theme.colors.text.secondary :
    variant === 'secondary' ? theme.colors.text.primary :
    theme.colors.text.primary};
  border: ${({ variant, theme }) =>
    variant === 'outline' ? `2px solid ${theme.colors.primary}` :
    variant === 'ghost' ? 'none' :
    'none'};
  padding: 12px 20px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-weight: 600;
  font-size: 0.9rem;
  transition: all ${({ theme }) => theme.transitions.normal};
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'auto'};
  min-height: 44px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    transition: left 0.5s ease;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${({ variant, theme }) =>
      variant === 'outline' || variant === 'ghost' ? 'none' : theme.shadows.glow};
    
    &::before {
      left: 100%;
    }
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
    padding: 14px 24px;
    font-size: 1rem;
    min-height: 48px;
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
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1rem;
  height: 48px;
  transition: all ${({ theme }) => theme.transitions.normal};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryLight};
    background: ${({ theme }) => theme.colors.surfaceSolid};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }

  ${media.md`
    padding: 16px 18px;
    height: 52px;
  `}
`

export const Label = styled.label`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
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
  padding: 4px 12px;
  font-size: 0.75rem;
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
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.surface} 25%,
    ${({ theme }) => theme.colors.surfaceSolid} 50%,
    ${({ theme }) => theme.colors.surface} 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  height: ${({ height }) => height || '20px'};
  width: ${({ width }) => width || '100%'};
`

export const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.borderLight};
  margin: ${({ theme }) => theme.spacing.md} 0;
`

export const FloatingOrb = styled.div`
  position: absolute;
  width: ${({ size }) => size || '200px'};
  height: ${({ size }) => size || '200px'};
  border-radius: 50%;
  background: ${({ color, theme }) => color || theme.colors.gradient.primary};
  filter: blur(80px);
  opacity: 0.3;
  pointer-events: none;
  animation: ${float} 6s ease-in-out infinite;
  animation-delay: ${({ delay }) => delay || '0s'};
`
