import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiStar } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import { GlassCard, Button, Input, Label, GradientText, FloatingOrb, media } from '../styles/theme'

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.md};
  position: relative;
  overflow: hidden;
`

const BackgroundDecor = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
`

const LoginCard = styled(GlassCard)`
  width: 100%;
  max-width: 500px;
  position: relative;
  z-index: 1;

  ${media.md`
    max-width: 560px;
  `}

  ${media.lg`
    max-width: 600px;
  `}
`

const LogoSection = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const LogoIcon = styled(motion.div)`
  width: 64px;
  height: 64px;
  margin: 0 auto ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.gradient.primary};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${({ theme }) => theme.shadows.glow};

  svg {
    font-size: 1.75rem;
    color: white;
  }
`

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 8px;
`

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.95rem;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`

const FormGroup = styled.div`
  position: relative;
`

const InputWrapper = styled.div`
  position: relative;
`

const InputIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.text.muted};
  display: flex;
  align-items: center;
  pointer-events: none;
  transition: color ${({ theme }) => theme.transitions.normal};
  
  svg {
    font-size: 1.1rem;
  }
`

const StyledInput = styled(Input)`
  padding-left: 48px;
  padding-right: ${({ hasToggle }) => hasToggle ? '48px' : '16px'};
`

const PasswordToggle = styled.button`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.muted};
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
    background: ${({ theme }) => theme.colors.surface};
  }

  svg {
    font-size: 1.1rem;
  }
`

const ErrorMessage = styled(motion.div)`
  background: ${({ theme }) => theme.colors.errorLight};
  color: ${({ theme }) => theme.colors.error};
  padding: 12px 16px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 0.875rem;
`

const FieldError = styled.span`
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.8rem;
  margin-top: 6px;
  display: block;
`

const SubmitButton = styled(Button)`
  margin-top: ${({ theme }) => theme.spacing.xs};
  
  svg {
    transition: transform ${({ theme }) => theme.transitions.normal};
  }
  
  &:hover:not(:disabled) svg {
    transform: translateX(4px);
  }
`

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin: ${({ theme }) => theme.spacing.md} 0;
  
  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.colors.borderLight};
  }
  
  span {
    color: ${({ theme }) => theme.colors.text.muted};
    font-size: 0.85rem;
  }
`

const LinkSection = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.95rem;
  
  a {
    color: ${({ theme }) => theme.colors.primary};
    font-weight: 600;
    transition: all ${({ theme }) => theme.transitions.normal};
    
    &:hover {
      color: ${({ theme }) => theme.colors.secondary};
      text-decoration: underline;
    }
  }
`

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setIsLoading(true)
    setApiError('')

    try {
      const response = await authAPI.login(data)
      login(response.data.user, response.data.token)
      const from = location.state?.from?.pathname || '/'
      navigate(from, { replace: true })
    } catch (error) {
      setApiError(
        error.response?.data?.error || 'Logowanie nie powiodło się. Spróbuj ponownie.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <LoginContainer>
      <BackgroundDecor>
        <FloatingOrb size="400px" color="rgba(139, 92, 246, 0.15)" style={{ top: '-10%', right: '-10%' }} delay="0s" />
        <FloatingOrb size="300px" color="rgba(236, 72, 153, 0.12)" style={{ bottom: '-5%', left: '-5%' }} delay="2s" />
        <FloatingOrb size="200px" color="rgba(6, 182, 212, 0.1)" style={{ top: '40%', left: '10%' }} delay="4s" />
      </BackgroundDecor>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <LoginCard>
          <LogoSection>
            <LogoIcon
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <FiStar />
            </LogoIcon>
            <Title>
              <GradientText>Witaj ponownie</GradientText>
            </Title>
            <Subtitle>Zaloguj się do swojego konta</Subtitle>
          </LogoSection>

          <Form onSubmit={handleSubmit(onSubmit)}>
            {apiError && (
              <ErrorMessage
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {apiError}
              </ErrorMessage>
            )}

            <FormGroup>
              <Label htmlFor="email">Adres e-mail</Label>
              <InputWrapper>
                <StyledInput
                  id="email"
                  type="email"
                  placeholder="twoj@email.com"
                  {...register('email', { 
                    required: 'Adres e-mail jest wymagany',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Wprowadź poprawny adres e-mail'
                    }
                  })}
                />
                <InputIcon>
                  <FiMail />
                </InputIcon>
              </InputWrapper>
              {errors.email && (
                <FieldError>{errors.email.message}</FieldError>
              )}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="password">Hasło</Label>
              <InputWrapper>
                <StyledInput
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Wprowadź hasło"
                  hasToggle
                  {...register('password', { 
                    required: 'Hasło jest wymagane'
                  })}
                />
                <InputIcon>
                  <FiLock />
                </InputIcon>
                <PasswordToggle 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </PasswordToggle>
              </InputWrapper>
              {errors.password && (
                <FieldError>{errors.password.message}</FieldError>
              )}
            </FormGroup>

            <SubmitButton 
              type="submit" 
              fullWidth 
              disabled={isLoading}
            >
              {isLoading ? 'Logowanie...' : (
                <>
                  Zaloguj się
                  <FiArrowRight />
                </>
              )}
            </SubmitButton>
          </Form>

          <Divider>
            <span>lub</span>
          </Divider>

          <LinkSection>
            Nie masz jeszcze konta? <Link to="/register">Utwórz konto</Link>
          </LinkSection>
        </LoginCard>
      </motion.div>
    </LoginContainer>
  )
}

export default Login