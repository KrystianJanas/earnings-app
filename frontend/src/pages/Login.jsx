import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import { Container, Card, Button, Input, Label, media } from '../styles/theme'

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.sm};
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);

  ${media.md`
    padding: ${({ theme }) => theme.spacing.md};
  `}
`

const LoginCard = styled(Card)`
  width: 100%;
  max-width: 400px;

  ${media.md`
    max-width: 480px;
    padding: ${({ theme }) => theme.spacing.xl};
  `}

  ${media.lg`
    max-width: 520px;
  `}
`

const Title = styled.h1`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`

const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.875rem;
  margin-top: ${({ theme }) => theme.spacing.xs};
`

const LinkText = styled.div`
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  
  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    
    &:hover {
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
        error.response?.data?.error || 'Login failed. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <LoginContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <LoginCard>
          <Title>Witaj ponownie</Title>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormGroup>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Wprowadź swój email"
                {...register('email', { 
                  required: 'Email jest wymagany',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Wprowadź poprawny adres email'
                  }
                })}
              />
              {errors.email && (
                <ErrorMessage>{errors.email.message}</ErrorMessage>
              )}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="password">Hasło</Label>
              <Input
                id="password"
                type="password"
                placeholder="Wprowadź swoje hasło"
                {...register('password', { 
                  required: 'Hasło jest wymagane',
                  minLength: {
                    value: 6,
                    message: 'Hasło musi mieć co najmniej 6 znaków'
                  }
                })}
              />
              {errors.password && (
                <ErrorMessage>{errors.password.message}</ErrorMessage>
              )}
            </FormGroup>

            {apiError && (
              <ErrorMessage style={{ textAlign: 'center', marginBottom: '1rem' }}>
                {apiError}
              </ErrorMessage>
            )}

            <Button 
              type="submit" 
              fullWidth 
              disabled={isLoading}
            >
              {isLoading ? 'Logowanie...' : 'Zaloguj się'}
            </Button>
          </form>

          <LinkText>
            Nie masz konta? <Link to="/register">Zarejestruj się</Link>
          </LinkText>
        </LoginCard>
      </motion.div>
    </LoginContainer>
  )
}

export default Login