import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiScissors } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import { Button, Input, Label, GradientText, media } from '../styles/theme'

const RegisterContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.md};
  position: relative;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.gradient.hero};
`

const BackgroundPattern = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  opacity: 0.4;
  background-image: 
    radial-gradient(circle at 80% 20%, rgba(124, 58, 237, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 20% 80%, rgba(236, 72, 153, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 60% 60%, rgba(245, 158, 11, 0.06) 0%, transparent 40%);
`

const RegisterCard = styled(motion.div)`
  width: 100%;
  max-width: 480px;
  background: ${({ theme }) => theme.colors.cardBg};
  border-radius: ${({ theme }) => theme.borderRadius['2xl']};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  position: relative;
  z-index: 1;

  ${media.md`
    padding: ${({ theme }) => theme.spacing['2xl']};
    max-width: 520px;
  `}
`

const LogoSection = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const LogoIcon = styled(motion.div)`
  width: 72px;
  height: 72px;
  margin: 0 auto ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.gradient.primary};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${({ theme }) => theme.shadows.button};

  svg {
    font-size: 2rem;
    color: white;
  }
`

const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: ${({ theme }) => theme.colors.text.primary};
`

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1rem;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`

const FormGroup = styled.div`
  position: relative;
`

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.sm};
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
  
  svg {
    font-size: 1.25rem;
  }
`

const StyledInput = styled(Input)`
  padding-left: 52px;
  padding-right: ${({ $hasToggle }) => $hasToggle ? '52px' : '16px'};
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
    color: ${({ theme }) => theme.colors.primary};
  }

  svg {
    font-size: 1.25rem;
  }
`

const ErrorMessage = styled(motion.div)`
  background: ${({ theme }) => theme.colors.errorLight};
  color: ${({ theme }) => theme.colors.error};
  padding: 14px 16px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: 0.9rem;
  font-weight: 500;
  border: 1px solid rgba(239, 68, 68, 0.2);
`

const FieldError = styled.span`
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.85rem;
  margin-top: 8px;
  display: block;
  font-weight: 500;
`

const SubmitButton = styled(Button)`
  margin-top: ${({ theme }) => theme.spacing.sm};
  
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
  margin: ${({ theme }) => theme.spacing.lg} 0;
  
  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.colors.border};
  }
  
  span {
    color: ${({ theme }) => theme.colors.text.muted};
    font-size: 0.9rem;
    font-weight: 500;
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
    margin-left: 4px;
    
    &:hover {
      color: ${({ theme }) => theme.colors.primaryHover};
    }
  }
`

const Register = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const password = watch('password')

  const onSubmit = async (data) => {
    setIsLoading(true)
    setApiError('')

    try {
      const response = await authAPI.register(data)
      login(response.data.user, response.data.token)
      navigate('/', { replace: true })
    } catch (error) {
      setApiError(
        error.response?.data?.error || 'Rejestracja nie powiodła się. Spróbuj ponownie.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <RegisterContainer>
      <BackgroundPattern />

      <RegisterCard
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <LogoSection>
          <LogoIcon
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <FiScissors />
          </LogoIcon>
          <Title>
            <GradientText>Utwórz konto</GradientText>
          </Title>
          <Subtitle>Dołącz do naszej społeczności</Subtitle>
        </LogoSection>
        
        <Form onSubmit={handleSubmit(onSubmit)}>
          {apiError && (
            <ErrorMessage
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {apiError}
            </ErrorMessage>
          )}

          <FormRow>
            <FormGroup>
              <Label htmlFor="firstName">Imię</Label>
              <InputWrapper>
                <StyledInput
                  id="firstName"
                  type="text"
                  placeholder="Twoje imię"
                  {...register('firstName', { 
                    required: 'Imię jest wymagane',
                    minLength: { value: 2, message: 'Min. 2 znaki' }
                  })}
                />
                <InputIcon>
                  <FiUser />
                </InputIcon>
              </InputWrapper>
              {errors.firstName && (
                <FieldError>{errors.firstName.message}</FieldError>
              )}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="lastName">Nazwisko</Label>
              <InputWrapper>
                <StyledInput
                  id="lastName"
                  type="text"
                  placeholder="Twoje nazwisko"
                  {...register('lastName', { 
                    required: 'Nazwisko jest wymagane',
                    minLength: { value: 2, message: 'Min. 2 znaki' }
                  })}
                />
                <InputIcon>
                  <FiUser />
                </InputIcon>
              </InputWrapper>
              {errors.lastName && (
                <FieldError>{errors.lastName.message}</FieldError>
              )}
            </FormGroup>
          </FormRow>

          <FormGroup>
            <Label htmlFor="email">Adres e-mail</Label>
            <InputWrapper>
              <StyledInput
                id="email"
                type="email"
                placeholder="twoj@email.com"
                {...register('email', { 
                  required: 'E-mail jest wymagany',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Niepoprawny e-mail' }
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
                placeholder="Min. 6 znaków"
                $hasToggle
                {...register('password', { 
                  required: 'Hasło jest wymagane',
                  minLength: { value: 6, message: 'Min. 6 znaków' }
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

          <FormGroup>
            <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
            <InputWrapper>
              <StyledInput
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Powtórz hasło"
                $hasToggle
                {...register('confirmPassword', { 
                  required: 'Potwierdź hasło',
                  validate: value => value === password || 'Hasła nie są identyczne'
                })}
              />
              <InputIcon>
                <FiLock />
              </InputIcon>
              <PasswordToggle 
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <FiEyeOff /> : <FiEye />}
              </PasswordToggle>
            </InputWrapper>
            {errors.confirmPassword && (
              <FieldError>{errors.confirmPassword.message}</FieldError>
            )}
          </FormGroup>

          <SubmitButton 
            type="submit" 
            $fullWidth 
            disabled={isLoading}
          >
            {isLoading ? 'Tworzenie...' : (
              <>
                Utwórz konto
                <FiArrowRight />
              </>
            )}
          </SubmitButton>
        </Form>

        <Divider>
          <span>lub</span>
        </Divider>

        <LinkSection>
          Masz już konto?<Link to="/login">Zaloguj się</Link>
        </LinkSection>
      </RegisterCard>
    </RegisterContainer>
  )
}

export default Register
